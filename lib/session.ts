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
  // Explicit env var instead of NODE_ENV — Vercel sets NODE_ENV=production
  // for every deployed build (Preview/dev-branch deployments included), so
  // that check can't distinguish dev from prod. COOKIE_DOMAIN is scoped
  // per-Vercel-environment instead.
  domain: process.env.COOKIE_DOMAIN || undefined,
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

export async function writeRefreshToken(refreshToken: string) {
  const store = await cookies();
  store.set(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });
}

// Clears the website's own cookies. Revoking the refresh token server-side
// (so it can't be replayed after logout) is a separate step — see
// app/api/auth/logout/route.ts, which calls the gateway before this runs.
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

// Backend rotates the refresh token on every use (auth-service
// refreshTokenService.js) — the response now carries a new refreshToken
// alongside the new accessToken, and the old one becomes single-use. Both
// cookies must be rewritten together on every refresh, or the browser is
// left holding a refresh token the server has already marked used, which
// looks like replay on its next legitimate use. A short server-side grace
// window absorbs concurrent requests from multiple tabs racing on the same
// old token (we can't mutex across separate requests/tabs here the way the
// Flutter apps can in-process) — see refreshTokenService.js REUSE_GRACE_MS.
export async function refreshSession(refreshToken: string): Promise<string> {
  const refreshed = await gatewayFetch<{ accessToken: string; refreshToken: string }>(
    '/api/auth/refresh-token',
    { method: 'POST', body: { token: refreshToken } }
  );
  await writeAccessToken(refreshed.accessToken);
  await writeRefreshToken(refreshed.refreshToken);
  return refreshed.accessToken;
}

// Mirrors the Flutter apps' Dio interceptor: attach the current access
// token, and on the gateway's exact 401 "Token expired" response, refresh
// once and retry the original call once.
export async function authedGatewayFetch<T = unknown>(
  path: string,
  opts: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown } = {}
): Promise<T> {
  const { accessToken, refreshToken } = await readSession();
  if (!accessToken && !refreshToken) {
    throw new GatewayError(401, { error: 'Not authenticated', errorCode: 'NO_SESSION' });
  }

  try {
    // A missing access token (its own 15-minute cookie maxAge already
    // expired browser-side — the normal case after any 15+ minute gap
    // between requests, not evidence of a dead session) is treated as
    // "expired" here rather than thrown immediately, so it falls into the
    // same refresh-then-retry path below instead of forcing a re-login
    // whenever a still-valid 7-day refresh token could have handled it
    // silently.
    if (!accessToken) throw new GatewayError(401, { error: 'Token expired', errorCode: 'TOKEN_EXPIRED' });
    return await gatewayFetch<T>(path, { ...opts, accessToken });
  } catch (err) {
    const expired = err instanceof GatewayError && err.status === 401;
    if (!expired || !refreshToken) throw err;

    let newAccessToken: string;
    try {
      newAccessToken = await refreshSession(refreshToken);
    } catch (refreshErr) {
      // Only a gateway auth rejection (invalid/revoked/expired refresh token)
      // means the session is genuinely dead and worth clearing. A transient
      // failure (5xx/502/network — a deploy warm-up, a DB blip) must NOT
      // destroy the session: clearing both cookies here is what turns a
      // brief backend outage into a permanent force-logout. Leave the
      // cookies in place so the next request can retry the refresh.
      if (refreshErr instanceof GatewayError && (refreshErr.status === 401 || refreshErr.status === 403)) {
        await clearSession();
      }
      throw err;
    }

    return gatewayFetch<T>(path, { ...opts, accessToken: newAccessToken });
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
