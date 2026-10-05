import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockReadSession = vi.fn();
const mockRefreshSession = vi.fn();
const mockClearSession = vi.fn();
const mockRejectCrossOrigin = vi.fn();

vi.mock('@/lib/session', () => ({
  readSession: (...args: unknown[]) => mockReadSession(...args),
  refreshSession: (...args: unknown[]) => mockRefreshSession(...args),
  clearSession: (...args: unknown[]) => mockClearSession(...args),
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

function makeRequest() {
  return new Request('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockReadSession.mockResolvedValue({ refreshToken: 'rt_1' });
  mockRefreshSession.mockResolvedValue(undefined);
});

describe('POST /api/auth/refresh', () => {
  it('calls refreshSession and returns 200 on success', async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockReadSession).toHaveBeenCalled();
    expect(mockRefreshSession).toHaveBeenCalledWith('rt_1');
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('returns 401 when no refreshToken', async () => {
    mockReadSession.mockResolvedValue({});
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/not authenticated/i);
    expect(mockRefreshSession).not.toHaveBeenCalled();
  });

  it('clears session and returns 401 on GatewayError 401', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockRefreshSession.mockRejectedValue(new GatewayError(401, { error: 'Token expired' }));
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    expect(mockClearSession).toHaveBeenCalled();
  });

  it('clears session and returns 403 on GatewayError 403', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockRefreshSession.mockRejectedValue(new GatewayError(403, { error: 'Forbidden' }));
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
    expect(mockClearSession).toHaveBeenCalled();
  });

  it('does NOT clear session on GatewayError 500', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockRefreshSession.mockRejectedValue(new GatewayError(500, { error: 'Internal' }));
    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
    expect(mockClearSession).not.toHaveBeenCalled();
  });

  it('returns 502 on non-GatewayError', async () => {
    mockRefreshSession.mockRejectedValue(new Error('network'));
    const res = await POST(makeRequest());
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/gateway unreachable/i);
  });

  it('returns 403 when CSRF check blocks the request', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
    expect(mockRefreshSession).not.toHaveBeenCalled();
  });
});
