import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthedGatewayFetch = vi.fn();
const mockRejectCrossOrigin = vi.fn();

vi.mock('@/lib/session', () => ({
  authedGatewayFetch: (...args: unknown[]) => mockAuthedGatewayFetch(...args),
}));

vi.mock('@/lib/csrf', () => ({
  rejectCrossOrigin: (...args: unknown[]) => mockRejectCrossOrigin(...args),
}));

vi.mock('@/lib/gateway-client', () => ({
  GatewayError: class GatewayError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
      super(String(body));
      this.status = status;
      this.body = body;
    }
  },
}));

import { POST } from '../route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/wallet/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockAuthedGatewayFetch.mockResolvedValue({ status: 'ok' });
});

describe('POST /api/wallet/verify', () => {
  it('calls gateway and returns result on valid body', async () => {
    const body = {
      orderId: 'order_1',
      razorpayPaymentId: 'pay_1',
      razorpaySignature: 'sig_1',
    };
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/wallet/verify', {
      method: 'POST',
      body,
    });
  });

  it('returns 400 when orderId is missing', async () => {
    const res = await POST(
      makeRequest({ razorpayPaymentId: 'pay_1', razorpaySignature: 'sig_1' })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/orderId/i);
  });

  it('returns 400 when razorpayPaymentId is missing', async () => {
    const res = await POST(
      makeRequest({ orderId: 'order_1', razorpaySignature: 'sig_1' })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/razorpayPaymentId/i);
  });

  it('returns 400 when razorpaySignature is missing', async () => {
    const res = await POST(
      makeRequest({ orderId: 'order_1', razorpayPaymentId: 'pay_1' })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/razorpaySignature/i);
  });

  it('returns gateway error status on gateway failure', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(400, { error: 'Invalid signature' })
    );
    const res = await POST(
      makeRequest({
        orderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: 'bad',
      })
    );
    expect(res.status).toBe(400);
  });
});
