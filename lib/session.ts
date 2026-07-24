import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from './gateway-client';

const ACCESS_COOKIE = 'pg_at';
const REFRESH_COOKIE = 'pg_rt';
// Match the gateway's own token lifetimes (auth-service/utils/generateTokens.js)
// so a cookie never outlives the JWT inside it.
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

// httpOnly so injected/third-party JS on the site can never read either
// token; SameSite=Lax so neither is auto-attached on a cross-site request
// (every mutating route here is POST/PUT, never a plain link) — see
// lib/csrf.ts for the accompanying Origin check. `domain` is scoped to the
// whole phoolgobhi.com zone (prod only — localhost has no real subdomain to
// share with) so partner.phoolgobhi.com can read the same session cookie
// after a partner-role login redirect, without a second login.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? '.phoolgobhi.com' : undefined,
};

export async function writeSession(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });
}

export async function writeAccessToken(accessToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
}

// Logout can only ever clear these cookies — the refresh JWT itself is
// stateless (auth-service issues it with no server-side store or revocation
// list), so it stays valid until its own 7-day expiry regardless. Documented
// as an accepted, pre-existing gap in the implementation plan.
//
// Deleting via `.set(..., maxAge: 0)` with the full cookieOptions (rather
// than `.delete()`, which sends no `Domain` attribute) — a browser matches
// a cookie for deletion by name+domain+path, so without `domain` here this
// would never clear the domain-scoped cookie set by writeSession above.
export async function clearSession() {
  const store = await cookies();
  store.set(ACCESS_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  store.set(REFRESH_COOKIE, '', { ...cookieOptions, maxAge: 0 });
}

export async function readSession() {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
  };
}

// Mirrors the Flutter customer app's Dio interceptor: attach the current
// access token, and on the gateway's exact 401 "Token expired" response,
// refresh once and retry the original call once. On a successful refresh we
// rewrite the pg_at cookie here (not just return the new token) so the
// browser isn't left holding a stale one and re-paying this round trip on
// every subsequent request.
export async function authedGatewayFetch<T = unknown>(
  path: string,
  opts: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown } = {}
): Promise<T> {
  const { accessToken, refreshToken } = await readSession();
  if (!accessToken) {
    throw new GatewayError(401, { error: 'Not authenticated', errorCode: 'NO_SESSION' });
  }

  try {
    return await gatewayFetch<T>(path, { ...opts, accessToken });
  } catch (err) {
    const expired = err instanceof GatewayError && err.status === 401;
    if (!expired || !refreshToken) throw err;

    const refreshed = await gatewayFetch<{ accessToken: string }>('/api/auth/refresh-token', {
      method: 'POST',
      body: { token: refreshToken },
    }).catch(() => null);

    if (!refreshed?.accessToken) {
      await clearSession();
      throw err;
    }

    await writeAccessToken(refreshed.accessToken);
    return gatewayFetch<T>(path, { ...opts, accessToken: refreshed.accessToken });
  }
}

// Shared response shaping for the authenticated read-only routes (auth/me,
// bookings/mine, wallet/balance) — same idea as gateway-client's
// proxyGatewayGet, but through the session-aware fetch above.
export async function proxyAuthedGet(gatewayPath: string): Promise<NextResponse> {
  try {
    const data = await authedGatewayFetch(gatewayPath);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
