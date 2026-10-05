import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthedGatewayFetch = vi.fn();
const mockRejectCrossOrigin = vi.fn();

vi.mock('@/lib/session', () => ({
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

import { POST } from '../route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/fitness-assistant/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockAuthedGatewayFetch.mockResolvedValue({ reply: 'Sure!' });
});

describe('POST /api/fitness-assistant/messages', () => {
  it('forwards message and conversationId to gateway', async () => {
    const res = await POST(makeRequest({ message: 'Hello', conversationId: 'conv_1' }));
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/health/assistant/messages', {
      method: 'POST',
      body: { message: 'Hello', conversationId: 'conv_1' },
    });
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost:3000/api/fitness-assistant/messages', {
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
    const res = await POST(makeRequest({ message: 'Hello' }));
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 403 gateway error for CONSENT_REQUIRED', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(403, { error: 'CONSENT_REQUIRED' })
    );
    const res = await POST(makeRequest({ message: 'Hello' }));
    expect(res.status).toBe(403);
  });

  it('returns 429 for RATE_LIMITED', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(429, { error: 'RATE_LIMITED', retryAfterSeconds: 30 })
    );
    const res = await POST(makeRequest({ message: 'Hello' }));
    expect(res.status).toBe(429);
  });

  it('returns 503 for ASSISTANT_UNAVAILABLE', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(503, { error: 'ASSISTANT_UNAVAILABLE' })
    );
    const res = await POST(makeRequest({ message: 'Hello' }));
    expect(res.status).toBe(503);
  });
});
