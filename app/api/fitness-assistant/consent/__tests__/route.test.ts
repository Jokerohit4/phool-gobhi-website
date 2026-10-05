import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyAuthedGet = vi.fn();
const mockAuthedGatewayFetch = vi.fn();
const mockRejectCrossOrigin = vi.fn();

vi.mock('@/lib/session', () => ({
  proxyAuthedGet: (...args: unknown[]) => mockProxyAuthedGet(...args),
  authedGatewayFetch: (...args: unknown[]) => mockAuthedGatewayFetch(...args),
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

vi.mock('@/lib/csrf', () => ({
  rejectCrossOrigin: (...args: unknown[]) => mockRejectCrossOrigin(...args),
}));

import { GET, POST, DELETE } from '../route';

function makeRequest(method: string) {
  return new Request('http://localhost:3000/api/fitness-assistant/consent', { method });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockProxyAuthedGet.mockResolvedValue({ consented: true });
  mockAuthedGatewayFetch.mockResolvedValue({ consented: true });
});

describe('GET /api/fitness-assistant/consent', () => {
  it('proxies to /api/health/assistant/consent', async () => {
    const res = await GET();
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/health/assistant/consent');
    expect(res).toEqual({ consented: true });
  });
});

describe('POST /api/fitness-assistant/consent', () => {
  it('sends empty body and returns result', async () => {
    const res = await POST(makeRequest('POST'));
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/health/assistant/consent', {
      method: 'POST',
      body: {},
    });
  });

  it('returns 403 when CSRF check blocks', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await POST(makeRequest('POST'));
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(400, { error: 'Bad request' })
    );
    const res = await POST(makeRequest('POST'));
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/fitness-assistant/consent', () => {
  it('calls gateway with DELETE method', async () => {
    const res = await DELETE(makeRequest('DELETE'));
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/health/assistant/consent', {
      method: 'DELETE',
    });
  });

  it('returns 403 when CSRF check blocks', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await DELETE(makeRequest('DELETE'));
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(502, { error: 'Unreachable' })
    );
    const res = await DELETE(makeRequest('DELETE'));
    expect(res.status).toBe(502);
  });
});
