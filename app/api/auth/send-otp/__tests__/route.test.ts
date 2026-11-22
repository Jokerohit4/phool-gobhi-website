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
  return new Request('http://localhost:3000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGatewayFetch.mockResolvedValue({ success: true });
});

describe('POST /api/auth/send-otp', () => {
  it('calls gateway and returns data on valid phone', async () => {
    const res = await POST(makeRequest({ phone: '9876543210' }));
    expect(res.status).toBe(200);
    expect(mockGatewayFetch).toHaveBeenCalledWith('/api/auth/send-otp', {
      method: 'POST',
      body: { phone: '9876543210' },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('returns 400 when phone is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/phone/i);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when phone is not a string', async () => {
    const res = await POST(makeRequest({ phone: 1234567890 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/phone/i);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new Request('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/invalid request body/i);
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockGatewayFetch.mockRejectedValue(
      new GatewayError(429, { error: 'Rate limited' })
    );
    const res = await POST(makeRequest({ phone: '9876543210' }));
    expect(res.status).toBe(429);
  });

  it('returns 502 on non-GatewayError', async () => {
    mockGatewayFetch.mockRejectedValue(new Error('network'));
    const res = await POST(makeRequest({ phone: '9876543210' }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/gateway unreachable/i);
  });

  it('rejects cross-origin requests with 403 and does not call the gateway', async () => {
    const req = new Request('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.example', host: 'localhost:3000' },
      body: JSON.stringify({ phone: '9876543210' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('allows same-origin requests', async () => {
    const req = new Request('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000', host: 'localhost:3000' },
      body: JSON.stringify({ phone: '9876543210' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 400 for a malformed phone number', async () => {
    for (const phone of ['123', 'abcdefghij', '1234567890', '9'.repeat(30)]) {
      const res = await POST(makeRequest({ phone }));
      expect(res.status).toBe(400);
    }
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('accepts an E.164 phone number', async () => {
    const res = await POST(makeRequest({ phone: '+919876543210' }));
    expect(res.status).toBe(200);
  });
});
