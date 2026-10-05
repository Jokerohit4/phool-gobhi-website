import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('../gateway-client', () => ({
  gatewayFetch: vi.fn(),
  GatewayError: class GatewayError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
      super(String((body as Record<string, unknown>)?.error ?? 'Gateway error'));
      this.status = status;
      this.body = body;
    }
  },
}));

import { cookies } from 'next/headers';
import { gatewayFetch } from '../gateway-client';
import { writeSession, refreshSession, authedGatewayFetch, clearSession } from '../session';

const mockedCookies = vi.mocked(cookies);
const mockedGatewayFetch = vi.mocked(gatewayFetch);

function makeStore(map: Map<string, string>) {
  const setCalls: Array<{ name: string; value: string; opts: Record<string, unknown> }> = [];
  return {
    store: {
      get: (name: string) => (map.has(name) ? { value: map.get(name)! } : undefined),
      set: (name: string, value: string, opts?: Record<string, unknown>) => {
        setCalls.push({ name, value, opts: opts ?? {} });
        map.set(name, value);
      },
    } as never,
    setCalls,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('writeSession', () => {
  it('sets pg_at and pg_rt cookies with correct attributes', async () => {
    const map = new Map<string, string>();
    const { store, setCalls } = makeStore(map);
    mockedCookies.mockResolvedValue(store);

    await writeSession('access-token-123', 'refresh-token-456');

    const atCall = setCalls.find((c) => c.name === 'pg_at');
    const rtCall = setCalls.find((c) => c.name === 'pg_rt');

    expect(atCall).toBeDefined();
    expect(atCall!.value).toBe('access-token-123');
    expect(atCall!.opts.httpOnly).toBe(true);
    expect(atCall!.opts.sameSite).toBe('lax');
    expect(atCall!.opts.path).toBe('/');
    expect(atCall!.opts.maxAge).toBe(15 * 60);

    expect(rtCall).toBeDefined();
    expect(rtCall!.value).toBe('refresh-token-456');
    expect(rtCall!.opts.maxAge).toBe(7 * 24 * 60 * 60);
    expect(rtCall!.opts.httpOnly).toBe(true);
  });

  it('includes COOKIE_DOMAIN when set', async () => {
    // cookieOptions is evaluated at module load, so re-import with the env var set
    process.env.COOKIE_DOMAIN = '.phoolgobhi.com';
    vi.resetModules();
    const { cookies: freshCookies } = await import('next/headers');
    const { writeSession: freshWriteSession } = await import('../session');
    const mockedFreshCookies = vi.mocked(freshCookies);

    const map = new Map<string, string>();
    const { store, setCalls } = makeStore(map);
    mockedFreshCookies.mockResolvedValue(store);

    await freshWriteSession('at', 'rt');

    const atCall = setCalls.find((c) => c.name === 'pg_at');
    expect(atCall!.opts.domain).toBe('.phoolgobhi.com');

    delete process.env.COOKIE_DOMAIN;
  });
});

describe('clearSession', () => {
  it('sets both cookies with maxAge 0', async () => {
    const map = new Map<string, string>();
    const { store, setCalls } = makeStore(map);
    mockedCookies.mockResolvedValue(store);

    await clearSession();

    const atCall = setCalls.find((c) => c.name === 'pg_at');
    const rtCall = setCalls.find((c) => c.name === 'pg_rt');

    expect(atCall!.value).toBe('');
    expect(atCall!.opts.maxAge).toBe(0);
    expect(rtCall!.value).toBe('');
    expect(rtCall!.opts.maxAge).toBe(0);
  });
});

describe('refreshSession', () => {
  it('calls gateway /auth/refresh-token and writes new tokens', async () => {
    const map = new Map<string, string>();
    const { store, setCalls } = makeStore(map);
    mockedCookies.mockResolvedValue(store);
    mockedGatewayFetch.mockResolvedValue({
      accessToken: 'new-at',
      refreshToken: 'new-rt',
    } as never);

    const result = await refreshSession('old-rt');

    expect(result).toBe('new-at');
    expect(mockedGatewayFetch).toHaveBeenCalledWith('/api/auth/refresh-token', {
      method: 'POST',
      body: { token: 'old-rt' },
    });

    const atCall = setCalls.find((c) => c.name === 'pg_at');
    const rtCall = setCalls.find((c) => c.name === 'pg_rt');
    expect(atCall!.value).toBe('new-at');
    expect(rtCall!.value).toBe('new-rt');
  });
});

describe('authedGatewayFetch', () => {
  it('throws NO_SESSION when both cookies are missing', async () => {
    const map = new Map<string, string>();
    const { store } = makeStore(map);
    mockedCookies.mockResolvedValue(store);

    await expect(authedGatewayFetch('/api/gyms')).rejects.toThrow('Not authenticated');
  });

  it('calls gatewayFetch with Bearer token when access token exists', async () => {
    const map = new Map<string, string>([
      ['pg_at', 'my-access-token'],
      ['pg_rt', 'my-refresh-token'],
    ]);
    const { store } = makeStore(map);
    mockedCookies.mockResolvedValue(store);
    mockedGatewayFetch.mockResolvedValue({ data: 'ok' } as never);

    const result = await authedGatewayFetch('/api/bookings/mine');

    expect(mockedGatewayFetch).toHaveBeenCalledWith('/api/bookings/mine', {
      accessToken: 'my-access-token',
    });
    expect(result).toEqual({ data: 'ok' });
  });

  it('refreshes and retries on 401 when refresh token is available', async () => {
    const map = new Map<string, string>([
      ['pg_at', 'expired-at'],
      ['pg_rt', 'valid-rt'],
    ]);
    const { store } = makeStore(map);
    mockedCookies.mockResolvedValue(store);

    const err401 = new (await import('../gateway-client')).GatewayError(401, { error: 'Token expired' });
    mockedGatewayFetch
      .mockRejectedValueOnce(err401)
      .mockResolvedValueOnce({ accessToken: 'refreshed-at', refreshToken: 'refreshed-rt' } as never)
      .mockResolvedValueOnce({ data: 'success' } as never);

    const result = await authedGatewayFetch('/api/bookings/mine');

    expect(mockedGatewayFetch).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ data: 'success' });
  });

  it('clears session on refresh 401 and rethrows original error', async () => {
    const readMap = new Map<string, string>([
      ['pg_at', 'expired-at'],
      ['pg_rt', 'dead-rt'],
    ]);
    const { store: readStore } = makeStore(readMap);

    const clearMap = new Map<string, string>([
      ['pg_at', 'expired-at'],
      ['pg_rt', 'dead-rt'],
    ]);
    const { store: clearStore, setCalls: clearCalls } = makeStore(clearMap);

    mockedCookies.mockResolvedValueOnce(readStore).mockResolvedValueOnce(clearStore);

    const { GatewayError } = await import('../gateway-client');
    const err401 = new GatewayError(401, { error: 'Token expired' });
    const refreshErr = new GatewayError(401, { error: 'Invalid refresh token' });
    mockedGatewayFetch.mockRejectedValueOnce(err401).mockRejectedValueOnce(refreshErr);

    await expect(authedGatewayFetch('/api/gyms')).rejects.toThrow('Token expired');

    const atClear = clearCalls.find((c) => c.name === 'pg_at');
    const rtClear = clearCalls.find((c) => c.name === 'pg_rt');
    expect(atClear).toBeDefined();
    expect(atClear!.opts.maxAge).toBe(0);
    expect(rtClear).toBeDefined();
    expect(rtClear!.opts.maxAge).toBe(0);
  });

  it('does NOT clear session on transient refresh failure (5xx)', async () => {
    const map = new Map<string, string>([
      ['pg_at', 'expired-at'],
      ['pg_rt', 'valid-rt'],
    ]);
    const { store } = makeStore(map);
    mockedCookies.mockResolvedValue(store);

    const { GatewayError } = await import('../gateway-client');
    const err401 = new GatewayError(401, { error: 'Token expired' });
    const transientErr = new Error('fetch failed');
    mockedGatewayFetch.mockRejectedValueOnce(err401).mockRejectedValueOnce(transientErr);

    await expect(authedGatewayFetch('/api/gyms')).rejects.toThrow('Token expired');
    expect(mockedGatewayFetch).toHaveBeenCalledTimes(2);
    expect(mockedCookies).toHaveBeenCalledTimes(1);
  });

  it('treats missing access token as expired and attempts refresh', async () => {
    const map = new Map<string, string>([['pg_rt', 'valid-rt']]);
    const { store } = makeStore(map);
    mockedCookies.mockResolvedValue(store);
    mockedGatewayFetch
      .mockResolvedValueOnce({ accessToken: 'new-at', refreshToken: 'new-rt' } as never)
      .mockResolvedValueOnce({ data: 'recovered' } as never);

    const result = await authedGatewayFetch('/api/wallet/balance');

    expect(mockedGatewayFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: 'recovered' });
  });
});
