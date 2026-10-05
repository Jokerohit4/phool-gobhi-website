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

describe('POST /api/wallet/subscriptions/purchase-with-wallet', () => {
  it('returns 403 on cross-origin', async () => {
    const blocked = { error: 'blocked', status: 403 } as unknown as import('next/server').NextResponse;
    mockRejectCrossOrigin.mockReturnValue(blocked);

    const result = await POST(makeRequest({ gymId: 'g1', planType: 'monthly' }));
    expect(result).toBe(blocked);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when body is invalid JSON', async () => {
    await POST(makeRequest(undefined));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid request body' }, { status: 400 });
  });

  it('returns 400 when gymId is missing', async () => {
    await POST(makeRequest({ planType: 'monthly' }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'gymId and a valid planType are required' },
      { status: 400 }
    );
  });

  it('returns 400 when planType is invalid', async () => {
    await POST(makeRequest({ gymId: 'g1', planType: 'lifetime' }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'gymId and a valid planType are required' },
      { status: 400 }
    );
  });

  it('returns 400 when planType is missing', async () => {
    await POST(makeRequest({ gymId: 'g1' }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'gymId and a valid planType are required' },
      { status: 400 }
    );
  });

  it.each(['weekly', 'monthly', 'quarterly', 'yearly'])('accepts planType "%s"', async (planType) => {
    mockAuthedGatewayFetch.mockResolvedValue({ subscription: { id: 'sub_1' } });

    await POST(makeRequest({ gymId: 'g1', planType }));
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/wallet/subscriptions/purchase-with-wallet', {
      method: 'POST',
      body: { gymId: 'g1', planType },
    });
  });

  it('returns 201 on success', async () => {
    const data = { subscription: { id: 'sub_1' } };
    mockAuthedGatewayFetch.mockResolvedValue(data);

    await POST(makeRequest({ gymId: 'g1', planType: 'monthly' }));
    expect(mockJson).toHaveBeenCalledWith(data, { status: 201 });
  });

  it('returns GatewayError status on GatewayError', async () => {
    mockAuthedGatewayFetch.mockRejectedValue(new GatewayError(422, { error: 'Insufficient wallet balance' }));

    await POST(makeRequest({ gymId: 'g1', planType: 'monthly' }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Insufficient wallet balance' }, { status: 422 });
  });

  it('returns 502 on non-GatewayError', async () => {
    mockAuthedGatewayFetch.mockRejectedValue(new Error('network'));

    await POST(makeRequest({ gymId: 'g1', planType: 'monthly' }));
    expect(mockJson).toHaveBeenCalledWith({ error: 'Gateway unreachable' }, { status: 502 });
  });
});
