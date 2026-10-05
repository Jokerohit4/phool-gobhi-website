import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn() },
  NextRequest: class {},
}));

const originalFetch = global.fetch;

describe('gatewayFetch', () => {
  let gatewayFetch: typeof import('../gateway-client').gatewayFetch;
  let GatewayError: typeof import('../gateway-client').GatewayError;

  beforeEach(async () => {
    process.env.GATEWAY_URL = 'https://gateway.example.com';
    vi.resetModules();
    const mod = await import('../gateway-client');
    gatewayFetch = mod.gatewayFetch;
    GatewayError = mod.GatewayError;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.GATEWAY_URL;
  });

  it('throws when GATEWAY_URL is not set', async () => {
    delete process.env.GATEWAY_URL;
    vi.resetModules();
    const mod = await import('../gateway-client');
    const gf = mod.gatewayFetch;

    await expect(gf('/api/test')).rejects.toThrow('GATEWAY_URL is not configured');
  });

  it('calls the correct URL with GET by default', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: 'hello' })),
    });
    global.fetch = mockFetch;

    await gatewayFetch('/api/gyms');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('https://gateway.example.com/api/gyms');
    expect(opts.method).toBe('GET');
    expect(opts.cache).toBe('no-store');
  });

  it('attaches Authorization header when accessToken is provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    });
    global.fetch = mockFetch;

    await gatewayFetch('/api/bookings/mine', { accessToken: 'my-jwt' });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers).toMatchObject({
      Authorization: 'Bearer my-jwt',
    });
  });

  it('does not include Authorization when no accessToken', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    });
    global.fetch = mockFetch;

    await gatewayFetch('/api/gyms');

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers).not.toHaveProperty('Authorization');
  });

  it('sends POST with JSON-stringified body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 1 })),
    });
    global.fetch = mockFetch;

    await gatewayFetch('/api/bookings', {
      method: 'POST',
      body: { gymId: 'g1', slotId: 's1' },
    });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ gymId: 'g1', slotId: 's1' }));
    expect(opts.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('passes FormData without JSON.stringify', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ url: 'uploaded' })),
    });
    global.fetch = mockFetch;

    const fd = new FormData();
    fd.append('file', new Blob(['test']), 'test.png');

    await gatewayFetch('/api/upload', { method: 'POST', body: fd });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.body).toBe(fd);
    expect(opts.headers).not.toHaveProperty('Content-Type');
  });

  it('handles non-JSON responses (empty body) gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(''),
    });
    global.fetch = mockFetch;

    const result = await gatewayFetch('/api/health');
    expect(result).toBeNull();
  });

  it('throws GatewayError on non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve(JSON.stringify({ error: 'Not found' })),
    });
    global.fetch = mockFetch;

    try {
      await gatewayFetch('/api/gyms/nonexistent');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayError);
      expect((err as InstanceType<typeof GatewayError>).status).toBe(404);
      expect((err as InstanceType<typeof GatewayError>).body).toEqual({ error: 'Not found' });
    }
  });

  it('merges custom headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    });
    global.fetch = mockFetch;

    await gatewayFetch('/api/test', {
      headers: { 'x-custom': 'value' },
    });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers).toMatchObject({ 'x-custom': 'value' });
  });
});
