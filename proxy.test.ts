import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockJson = vi.fn();
const mockRedirect = vi.fn();
const mockNext = vi.fn();

vi.mock('next/server', () => ({
  NextResponse: {
    json: (...args: unknown[]) => mockJson(...args),
    redirect: (...args: unknown[]) => mockRedirect(...args),
    next: (...args: unknown[]) => mockNext(...args),
  },
}));

const originalFetch = global.fetch;

function makeRequest(pathname: string, method = 'GET') {
  return {
    nextUrl: { pathname },
    method,
    url: `https://www.phoolgobhi.com${pathname}`,
  } as never;
}

describe('proxy middleware', () => {
  let proxy: typeof import('./proxy').default;

  beforeEach(async () => {
    process.env.GATEWAY_URL = 'https://gateway.example.com';
    vi.resetModules();

    mockJson.mockReturnValue({ json: true });
    mockRedirect.mockReturnValue({ redirect: true });
    mockNext.mockReturnValue({ next: true });

    const mod = await import('./proxy');
    proxy = mod.default;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.GATEWAY_URL;
  });

  it('passes through non-gated paths immediately', async () => {
    const req = makeRequest('/about');
    await proxy(req);

    expect(mockNext).toHaveBeenCalled();
    expect(mockJson).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('passes through /partner/apply (not gated)', async () => {
    const req = makeRequest('/partner/apply');
    await proxy(req);

    expect(mockNext).toHaveBeenCalled();
  });

  describe('launch gate (gyms paths)', () => {
    it('redirects to / when not live', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ isLive: false }),
      });

      const req = makeRequest('/gyms');
      await proxy(req);

      expect(mockRedirect).toHaveBeenCalled();
    });

    it('returns 403 for gym API when not live', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ isLive: false }),
      });

      const req = makeRequest('/api/gyms');
      await proxy(req);

      expect(mockJson).toHaveBeenCalledWith({ error: 'Not live yet' }, { status: 403 });
    });

    it('passes through when live', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ isLive: true }),
      });

      const req = makeRequest('/gyms');
      await proxy(req);

      expect(mockNext).toHaveBeenCalled();
    });

    it('passes through /book/xyz when live', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ isLive: true }),
      });

      const req = makeRequest('/book/some-gym-id');
      await proxy(req);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('maintenance gate', () => {
    it('gym maintenance redirects gym pages to /', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('launch-status')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ isLive: true }) });
        }
        if (url.includes('app-config')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                maintenance: { gyms: { active: true, message: 'Under maintenance' } },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const req = makeRequest('/gyms');
      await proxy(req);

      expect(mockRedirect).toHaveBeenCalled();
    });

    it('gym maintenance returns 503 for gym API', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('launch-status')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ isLive: true }) });
        }
        if (url.includes('app-config')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                maintenance: {
                  gyms: { active: true, message: 'Gyms down for maintenance' },
                },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const req = makeRequest('/api/gyms');
      await proxy(req);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Gyms down for maintenance', maintenance: true }),
        { status: 503 }
      );
    });

    it('wallet maintenance redirects wallet page', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('launch-status')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ isLive: true }) });
        }
        if (url.includes('app-config')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                maintenance: { wallet: { active: true, message: 'Wallet maintenance' } },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const req = makeRequest('/account/wallet');
      await proxy(req);

      expect(mockRedirect).toHaveBeenCalled();
    });

    it('wallet maintenance returns 503 for wallet API', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('launch-status')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ isLive: true }) });
        }
        if (url.includes('app-config')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                maintenance: { wallet: { active: true, message: 'Wallet down' } },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const req = makeRequest('/api/wallet/balance');
      await proxy(req);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Wallet down', maintenance: true }),
        { status: 503 }
      );
    });
  });

  describe('gateway failure handling', () => {
    it('fails closed when gateway is unreachable (launch gate)', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('network error'));

      const req = makeRequest('/gyms');
      await proxy(req);

      expect(mockRedirect).toHaveBeenCalled();
    });

    it('fails open for maintenance (gateway error → no maintenance)', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('launch-status')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ isLive: true }) });
        }
        if (url.includes('app-config')) {
          return Promise.reject(new Error('network error'));
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const req = makeRequest('/gyms');
      await proxy(req);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('booking money-mover gating', () => {
    it('POST /api/bookings is gated by wallet maintenance', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('launch-status')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ isLive: true }) });
        }
        if (url.includes('app-config')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                maintenance: { wallet: { active: true, message: 'Wallet maintenance' } },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const req = makeRequest('/api/bookings', 'POST');
      await proxy(req);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ maintenance: true }),
        { status: 503 }
      );
    });

    it('POST /api/bookings/:id/cancel is gated by wallet maintenance', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('launch-status')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ isLive: true }) });
        }
        if (url.includes('app-config')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                maintenance: { wallet: { active: true, message: 'Wallet maintenance' } },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      // The browser POSTs to the BFF cancel route handler; the BFF then calls
      // the gateway with the backend's method. The gate keys on the BROWSER
      // method — a PUT here would be dead code, since no PUT reaches this
      // proxy.
      const req = makeRequest('/api/bookings/bk_123/cancel', 'POST');
      await proxy(req);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ maintenance: true }),
        { status: 503 }
      );
    });

    it('GET /api/bookings/:id is NOT gated by wallet maintenance', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('launch-status')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ isLive: true }) });
        }
        if (url.includes('app-config')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                maintenance: { wallet: { active: true, message: 'Wallet maintenance' } },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const req = makeRequest('/api/bookings/bk_123', 'GET');
      await proxy(req);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
