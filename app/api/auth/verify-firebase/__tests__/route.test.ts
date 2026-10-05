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
  return new Request('http://localhost:3000/api/auth/verify-firebase', {
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

describe('POST /api/auth/verify-firebase', () => {
  it('calls gateway, writes session, and returns user on valid idToken', async () => {
    const res = await POST(makeRequest({ idToken: 'firebase-token-123' }));
    expect(res.status).toBe(200);
    expect(mockGatewayFetch).toHaveBeenCalledWith('/api/auth/verify-firebase-token', {
      method: 'POST',
      body: {
        idToken: 'firebase-token-123',
        name: undefined,
        email: undefined,
        role: 'customer',
        type: 'general',
        linkedGymId: undefined,
      },
    });
    expect(mockWriteSession).toHaveBeenCalledWith('at_1', 'rt_1');
    const json = await res.json();
    expect(json.user).toEqual({ id: 'u1', name: 'Test' });
    expect(json.isNewUser).toBe(false);
  });

  it('returns 400 when idToken is missing', async () => {
    const res = await POST(makeRequest({ name: 'Test' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/idToken/i);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('passes linkedGymId to gateway when valid', async () => {
    await POST(makeRequest({ idToken: 'tok', linkedGymId: 5 }));
    expect(mockGatewayFetch).toHaveBeenCalledWith(
      '/api/auth/verify-firebase-token',
      expect.objectContaining({
        body: expect.objectContaining({ linkedGymId: 5 }),
      })
    );
  });

  it('ignores non-integer linkedGymId', async () => {
    await POST(makeRequest({ idToken: 'tok', linkedGymId: 3.5 }));
    expect(mockGatewayFetch).toHaveBeenCalledWith(
      '/api/auth/verify-firebase-token',
      expect.objectContaining({
        body: expect.objectContaining({ linkedGymId: undefined }),
      })
    );
  });

  it('returns gateway error status on gateway failure', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockGatewayFetch.mockRejectedValue(
      new GatewayError(401, { error: 'Invalid token' })
    );
    const res = await POST(makeRequest({ idToken: 'bad-token' }));
    expect(res.status).toBe(401);
    expect(mockWriteSession).not.toHaveBeenCalled();
  });
});
