import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthedGatewayFetch = vi.fn();

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

import { GET } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthedGatewayFetch.mockResolvedValue({ id: 'u1', name: 'Test', phone: '1234567890' });
});

describe('GET /api/auth/me', () => {
  it('returns 200 with wrapped user object', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/auth/me');
    const json = await res.json();
    expect(json.user).toEqual({ id: 'u1', name: 'Test', phone: '1234567890' });
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(401, { error: 'Unauthorized' })
    );
    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 502 on non-GatewayError', async () => {
    mockAuthedGatewayFetch.mockRejectedValue(new Error('network'));
    const res = await GET();
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/gateway unreachable/i);
  });
});
