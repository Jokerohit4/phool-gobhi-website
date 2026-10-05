import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGatewayFetch = vi.fn();

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

import { POST } from '../route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGatewayFetch.mockResolvedValue({ sent: true });
});

describe('POST /api/contact', () => {
  it('calls gateway and returns 201 on success', async () => {
    const res = await POST(makeRequest({ name: 'Test', email: 'a@b.com', message: 'Hi' }));
    expect(res.status).toBe(201);
    expect(mockGatewayFetch).toHaveBeenCalledWith('/api/auth/contact', {
      method: 'POST',
      body: { name: 'Test', email: 'a@b.com', message: 'Hi' },
    });
  });

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com', message: 'Hi' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/name, email and message/i);
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ name: 'Test', message: 'Hi' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is missing', async () => {
    const res = await POST(makeRequest({ name: 'Test', email: 'a@b.com' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when fields are not strings', async () => {
    const res = await POST(makeRequest({ name: 123, email: true, message: {} }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockGatewayFetch.mockRejectedValue(
      new GatewayError(429, { error: 'Rate limited' })
    );
    const res = await POST(makeRequest({ name: 'Test', email: 'a@b.com', message: 'Hi' }));
    expect(res.status).toBe(429);
  });
});
