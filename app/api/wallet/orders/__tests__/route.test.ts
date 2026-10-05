import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockJson = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: (...args: unknown[]) => mockJson(...args),
  },
}));

const mockAuthedGatewayFetch = vi.fn();
vi.mock('@/lib/session', () => ({
  authedGatewayFetch: (...args: unknown[]) => mockAuthedGatewayFetch(...args),
}));

const mockRejectCrossOrigin = vi.fn();
vi.mock('@/lib/csrf', () => ({
  rejectCrossOrigin: (...args: unknown[]) => mockRejectCrossOrigin(...args),
}));

import { POST } from '../route';
import { GatewayError } from '@/lib/gateway-client';

function makeRequest(body?: unknown) {
  return {
    json: body !== undefined ? () => Promise.resolve(body) : () => Promise.reject(new Error('no body')),
    headers: new Headers(),
  } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockJson.mockReturnValue({ json: true });
});

describe('POST /api/wallet/orders', () => {
  it('returns 403 on cross-origin', async () => {
    const blocked = { error: 'blocked', status: 403 } as unknown as import('next/server').NextResponse;
    mockRejectCrossOrigin.mockReturnValue(blocked);

    const result = await POST(makeRequest({ amount: 500 }));
    expect(result).toBe(blocked);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when body is invalid JSON', async () => {
    await POST(makeRequest(undefined));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid request body' }, { status: 400 });
  });

  it('returns 400 when amount is missing', async () => {
    await POST(makeRequest({}));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid amount' }, { status: 400 });
  });

  it('returns 400 when amount is not a number', async () => {
    await POST(makeRequest({ amount: 'five-hundred' }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid amount' }, { status: 400 });
  });

  it('returns 400 when amount is not finite', async () => {
    await POST(makeRequest({ amount: Infinity }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid amount' }, { status: 400 });
    vi.clearAllMocks();
    await POST(makeRequest({ amount: NaN }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid amount' }, { status: 400 });
  });

  it('returns 400 when amount is zero', async () => {
    await POST(makeRequest({ amount: 0 }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid amount' }, { status: 400 });
  });

  it('returns 400 when amount is negative', async () => {
    await POST(makeRequest({ amount: -100 }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid amount' }, { status: 400 });
  });

  it('passes amount to gateway and unwraps data envelope', async () => {
    const orderData = { id: 'ord_1', orderId: 'rzp_abc', amount: 50000, currency: 'INR', keyId: 'key_x' };
    mockAuthedGatewayFetch.mockResolvedValue({ data: orderData });

    await POST(makeRequest({ amount: 500 }));
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/wallet/orders', {
      method: 'POST',
      body: { amount: 500 },
    });
    expect(mockJson).toHaveBeenCalledWith(orderData);
  });

  it('returns GatewayError status on GatewayError', async () => {
    mockAuthedGatewayFetch.mockRejectedValue(new GatewayError(422, { error: 'Insufficient balance' }));

    await POST(makeRequest({ amount: 500 }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Insufficient balance' }, { status: 422 });
  });

  it('returns 502 on non-GatewayError', async () => {
    mockAuthedGatewayFetch.mockRejectedValue(new Error('network'));

    await POST(makeRequest({ amount: 500 }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Gateway unreachable' }, { status: 502 });
  });
});
