import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyGatewayGet = vi.fn();
const mockAuthedGatewayFetch = vi.fn();
const mockRejectCrossOrigin = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  proxyGatewayGet: (...args: unknown[]) => mockProxyGatewayGet(...args),
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
  authedGatewayFetch: (...args: unknown[]) => mockAuthedGatewayFetch(...args),
}));

vi.mock('@/lib/csrf', () => ({
  rejectCrossOrigin: (...args: unknown[]) => mockRejectCrossOrigin(...args),
}));

import { GET, POST } from '../route';

function makePostRequest(body: unknown) {
  return new Request('http://localhost:3000/api/platform-reviews', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockProxyGatewayGet.mockResolvedValue({ reviews: [] });
  mockAuthedGatewayFetch.mockResolvedValue({ created: true });
});

describe('GET /api/platform-reviews', () => {
  it('proxies to /api/auth/platform-reviews', async () => {
    const res = await GET();
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/auth/platform-reviews');
    expect(res).toEqual({ reviews: [] });
  });
});

describe('POST /api/platform-reviews', () => {
  it('calls gateway and returns 201 on success', async () => {
    const res = await POST(makePostRequest({ rating: 5, comment: 'Great!' }));
    expect(res.status).toBe(201);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/auth/platform-reviews', {
      method: 'POST',
      body: { rating: 5, comment: 'Great!' },
    });
  });

  it('sends null comment when not provided', async () => {
    await POST(makePostRequest({ rating: 4 }));
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/auth/platform-reviews', {
      method: 'POST',
      body: { rating: 4, comment: null },
    });
  });

  it('returns 400 when rating is missing', async () => {
    const res = await POST(makePostRequest({ comment: 'Nice' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/rating/i);
  });

  it('returns 400 when rating is not a number', async () => {
    const res = await POST(makePostRequest({ rating: 'five' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost:3000/api/platform-reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 403 when CSRF check blocks', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await POST(makePostRequest({ rating: 5 }));
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(400, { error: 'Already reviewed' })
    );
    const res = await POST(makePostRequest({ rating: 5 }));
    expect(res.status).toBe(400);
  });
});
