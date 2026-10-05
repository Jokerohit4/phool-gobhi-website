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

import { GET, PUT } from '../route';

function makePutRequest(body: unknown) {
  return new Request('http://localhost:3000/api/fitness-assistant/memories', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockProxyAuthedGet.mockResolvedValue({ memories: [] });
  mockAuthedGatewayFetch.mockResolvedValue({ saved: true });
});

describe('GET /api/fitness-assistant/memories', () => {
  it('proxies to /api/health/assistant/memories', async () => {
    const res = await GET();
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/health/assistant/memories');
    expect(res).toEqual({ memories: [] });
  });
});

describe('PUT /api/fitness-assistant/memories', () => {
  it('calls gateway with key and value', async () => {
    const res = await PUT(makePutRequest({ key: 'weight', value: '75kg' }));
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/health/assistant/memories', {
      method: 'PUT',
      body: { key: 'weight', value: '75kg' },
    });
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost:3000/api/fitness-assistant/memories', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 403 when CSRF check blocks', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await PUT(makePutRequest({ key: 'weight', value: '75kg' }));
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(400, { error: 'Invalid key' })
    );
    const res = await PUT(makePutRequest({ key: '', value: '75kg' }));
    expect(res.status).toBe(400);
  });
});
