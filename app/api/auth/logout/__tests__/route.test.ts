import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGatewayFetch = vi.fn();
const mockReadSession = vi.fn();
const mockClearSession = vi.fn();
const mockRejectCrossOrigin = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  gatewayFetch: (...args: unknown[]) => mockGatewayFetch(...args),
}));

vi.mock('@/lib/session', () => ({
  readSession: (...args: unknown[]) => mockReadSession(...args),
  clearSession: (...args: unknown[]) => mockClearSession(...args),
}));

vi.mock('@/lib/csrf', () => ({
  rejectCrossOrigin: (...args: unknown[]) => mockRejectCrossOrigin(...args),
}));

import { POST } from '../route';

function makeRequest() {
  return new Request('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockReadSession.mockResolvedValue({ refreshToken: 'rt_1' });
  mockGatewayFetch.mockResolvedValue(undefined);
  mockClearSession.mockResolvedValue(undefined);
});

describe('POST /api/auth/logout', () => {
  it('revokes token, clears session, and returns 200', async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockGatewayFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      body: { token: 'rt_1' },
    });
    expect(mockClearSession).toHaveBeenCalled();
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('skips gateway call when no refreshToken and still clears session', async () => {
    mockReadSession.mockResolvedValue({});
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
    expect(mockClearSession).toHaveBeenCalled();
  });

  it('still clears session when gateway fetch fails', async () => {
    mockGatewayFetch.mockRejectedValue(new Error('network'));
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockClearSession).toHaveBeenCalled();
  });

  it('returns 403 when CSRF check blocks the request', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
    expect(mockClearSession).not.toHaveBeenCalled();
  });
});
