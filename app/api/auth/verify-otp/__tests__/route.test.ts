import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGatewayFetch = vi.fn();
const mockWriteSession = vi.fn();
const mockRejectCrossOrigin = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  gatewayFetch: (...args: unknown[]) => mockGatewayFetch(...args),
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

vi.mock('@/lib/session', () => ({
  writeSession: (...args: unknown[]) => mockWriteSession(...args),
}));

vi.mock('@/lib/csrf', () => ({
  rejectCrossOrigin: (...args: unknown[]) => mockRejectCrossOrigin(...args),
}));

import { POST } from '../route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockGatewayFetch.mockResolvedValue({
    accessToken: 'at_1',
    refreshToken: 'rt_1',
    isNewUser: false,
    user: { id: 'u1', name: 'Test' },
  });
});

describe('POST /api/auth/verify-otp', () => {
  it('calls gateway with role customer, writes session, and returns user', async () => {
    const res = await POST(makeRequest({ phone: '9876543210', otp: '123456' }));
    expect(res.status).toBe(200);
    expect(mockGatewayFetch).toHaveBeenCalledWith('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone: '9876543210', otp: '123456', role: 'customer', type: 'general', linkedGymId: undefined },
    });
    expect(mockWriteSession).toHaveBeenCalledWith('at_1', 'rt_1');
    const json = await res.json();
    expect(json.user).toEqual({ id: 'u1', name: 'Test' });
    expect(json.isNewUser).toBe(false);
  });

  it('returns 400 when phone is missing', async () => {
    const res = await POST(makeRequest({ otp: '123456' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/phone and otp/i);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when otp is missing', async () => {
    const res = await POST(makeRequest({ phone: '9876543210' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/phone and otp/i);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new Request('http://localhost:3000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/invalid request body/i);
  });

  it('forwards linkedGymId when valid integer > 0', async () => {
    await POST(makeRequest({ phone: '9876543210', otp: '123456', linkedGymId: 5 }));
    expect(mockGatewayFetch).toHaveBeenCalledWith(
      '/api/auth/verify-otp',
      expect.objectContaining({
        body: expect.objectContaining({ linkedGymId: 5 }),
      })
    );
  });

  it('ignores linkedGymId when 0', async () => {
    await POST(makeRequest({ phone: '9876543210', otp: '123456', linkedGymId: 0 }));
    expect(mockGatewayFetch).toHaveBeenCalledWith(
      '/api/auth/verify-otp',
      expect.objectContaining({
        body: expect.objectContaining({ linkedGymId: undefined }),
      })
    );
  });

  it('ignores linkedGymId when negative', async () => {
    await POST(makeRequest({ phone: '9876543210', otp: '123456', linkedGymId: -3 }));
    expect(mockGatewayFetch).toHaveBeenCalledWith(
      '/api/auth/verify-otp',
      expect.objectContaining({
        body: expect.objectContaining({ linkedGymId: undefined }),
      })
    );
  });

  it('ignores linkedGymId when not an integer', async () => {
    await POST(makeRequest({ phone: '9876543210', otp: '123456', linkedGymId: 3.5 }));
    expect(mockGatewayFetch).toHaveBeenCalledWith(
      '/api/auth/verify-otp',
      expect.objectContaining({
        body: expect.objectContaining({ linkedGymId: undefined }),
      })
    );
  });

  it('returns gateway error status without writing session on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockGatewayFetch.mockRejectedValue(
      new GatewayError(401, { error: 'Invalid OTP' })
    );
    const res = await POST(makeRequest({ phone: '9876543210', otp: '000000' }));
    expect(res.status).toBe(401);
    expect(mockWriteSession).not.toHaveBeenCalled();
  });

  it('returns 502 on non-GatewayError', async () => {
    mockGatewayFetch.mockRejectedValue(new Error('network'));
    const res = await POST(makeRequest({ phone: '9876543210', otp: '123456' }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/gateway unreachable/i);
  });

  it('returns 403 when CSRF check blocks the request', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await POST(makeRequest({ phone: '9876543210', otp: '123456' }));
    expect(res.status).toBe(403);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });
});
