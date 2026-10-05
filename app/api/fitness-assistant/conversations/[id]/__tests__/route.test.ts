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

import { GET, DELETE } from '../route';

function makeCtx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockProxyAuthedGet.mockResolvedValue({ id: 'conv_1', messages: [] });
  mockAuthedGatewayFetch.mockResolvedValue({ deleted: true });
});

describe('GET /api/fitness-assistant/conversations/[id]', () => {
  it('proxies with URI-encoded id', async () => {
    const res = await GET(new Request('http://localhost:3000/api/fitness-assistant/conversations/a b'), makeCtx('a b'));
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/health/assistant/conversations/a%20b');
    expect(res).toEqual({ id: 'conv_1', messages: [] });
  });

  it('handles special characters in id', async () => {
    await GET(new Request('http://localhost'), makeCtx('conv/1?q=2'));
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/health/assistant/conversations/conv%2F1%3Fq%3D2');
  });
});

describe('DELETE /api/fitness-assistant/conversations/[id]', () => {
  it('calls gateway with DELETE and encoded id', async () => {
    const res = await DELETE(new Request('http://localhost', { method: 'DELETE' }), makeCtx('conv_1'));
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/health/assistant/conversations/conv_1', {
      method: 'DELETE',
    });
  });

  it('URI-encodes the id', async () => {
    await DELETE(new Request('http://localhost', { method: 'DELETE' }), makeCtx('a b'));
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/health/assistant/conversations/a%20b', {
      method: 'DELETE',
    });
  });

  it('returns 403 when CSRF check blocks', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await DELETE(new Request('http://localhost', { method: 'DELETE' }), makeCtx('conv_1'));
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(404, { error: 'Not found' })
    );
    const res = await DELETE(new Request('http://localhost', { method: 'DELETE' }), makeCtx('missing'));
    expect(res.status).toBe(404);
  });
});
