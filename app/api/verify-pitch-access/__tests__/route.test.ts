import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const originalFetch = global.fetch;

vi.mock('@/lib/gateway-client', () => ({}));

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/verify-pitch-access', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GATEWAY_URL = 'https://gateway.test';
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.GATEWAY_URL;
});

describe('POST /api/verify-pitch-access', () => {
  async function loadRoute() {
    vi.resetModules();
    process.env.GATEWAY_URL = 'https://gateway.test';
    const mod = await import('../route');
    return mod.POST;
  }

  it('returns allowed: true when backend allows', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => ({ allowed: true }),
    });
    const POST = await loadRoute();
    const res = await POST(makeRequest({ contact: '9999999999' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.allowed).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://gateway.test/api/auth/pitch-access/check',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('returns allowed: false when backend denies', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => ({ allowed: false }),
    });
    const POST = await loadRoute();
    const res = await POST(makeRequest({ contact: '1111111111' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.allowed).toBe(false);
  });

  it('returns 400 on invalid JSON', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => ({ allowed: false }),
    });
    const POST = await loadRoute();
    const req = new NextRequest('http://localhost:3000/api/verify-pitch-access', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.allowed).toBe(false);
  });

  it('returns 502 when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'));
    const POST = await loadRoute();
    const res = await POST(makeRequest({ contact: '9999999999' }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.allowed).toBe(false);
  });

  it('defaults contact to empty string when not a string', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => ({ allowed: false }),
    });
    const POST = await loadRoute();
    await POST(makeRequest({ contact: 123 }));
    expect(global.fetch).toHaveBeenCalledWith(
      'https://gateway.test/api/auth/pitch-access/check',
      expect.objectContaining({
        body: JSON.stringify({ contact: '' }),
      })
    );
  });
});
