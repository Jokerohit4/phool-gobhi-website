import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGatewayFetch = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  gatewayFetch: (...args: unknown[]) => mockGatewayFetch(...args),
}));

import { POST } from '../route';

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGatewayFetch.mockResolvedValue({ ok: true });
});

describe('POST /api/events', () => {
  it('proxies valid event to gateway and returns 202', async () => {
    const res = await POST(makeRequest({ event: 'page_viewed', distinct_id: 'u1', properties: { page: '/' } }));
    expect(res.status).toBe(202);
    expect(mockGatewayFetch).toHaveBeenCalledWith('/api/events', {
      method: 'POST',
      body: expect.objectContaining({
        event: 'page_viewed',
        distinct_id: 'u1',
        properties: expect.objectContaining({ page: '/' }),
      }),
    });
  });

  it('returns 202 on invalid JSON body', async () => {
    const res = await POST(makeRequest('not json'));
    expect(res.status).toBe(202);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 202 when event is not a string (skips gateway)', async () => {
    const res = await POST(makeRequest({ event: 123 }));
    expect(res.status).toBe(202);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns 202 even when gateway fails', async () => {
    mockGatewayFetch.mockRejectedValue(new Error('network'));
    const res = await POST(makeRequest({ event: 'test_event' }));
    expect(res.status).toBe(202);
  });

  it('forwards user-agent from request headers', async () => {
    const res = await POST(
      makeRequest({ event: 'test' }, { 'user-agent': 'Mozilla/5.0' })
    );
    expect(res.status).toBe(202);
    expect(mockGatewayFetch).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        body: expect.objectContaining({
          properties: expect.objectContaining({ user_agent: 'Mozilla/5.0' }),
        }),
      })
    );
  });

  it('does not set distinct_id when not a string', async () => {
    await POST(makeRequest({ event: 'test', distinct_id: 42 }));
    expect(mockGatewayFetch).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        body: expect.objectContaining({
          distinct_id: undefined,
        }),
      })
    );
  });
});
