import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Server-only, same convention as lib/gateway-client.ts.
const GATEWAY_URL = process.env.GATEWAY_URL;

// Gym visibility + booking creation are gated until launch; partner
// onboarding (/partner/*) and every marketing page are deliberately outside
// these prefixes and stay live throughout.
const GATED_PAGE_PREFIXES = ['/gyms', '/book', '/checkin'];
const GATED_API_PREFIXES = ['/api/gyms', '/api/bookings', '/api/checkin'];

// Best-effort in-memory cache so a burst of gated requests doesn't hit the
// gateway once per request — proxy has no access to shared state across
// instances, this is purely per-instance and can go stale by CACHE_MS, which
// is fine for a launch gate (not a security boundary against a fresh instant).
let cache: { isLive: boolean; expiresAt: number } | null = null;
const CACHE_MS = 15_000;

async function isLive(): Promise<boolean> {
  if (cache && cache.expiresAt > Date.now()) return cache.isLive;
  // If the gateway itself isn't configured, every other route on this site
  // is already broken — fail closed here too rather than special-case it.
  if (!GATEWAY_URL) return false;
  try {
    const res = await fetch(`${GATEWAY_URL}/api/auth/launch-status`, { cache: 'no-store' });
    const data = (await res.json()) as { isLive?: boolean };
    const live = res.ok && data.isLive === true;
    cache = { isLive: live, expiresAt: Date.now() + CACHE_MS };
    return live;
    // Fails closed on a gateway hiccup: a false "not live yet" self-heals on
    // the next request, while a false "live" would leak gym visibility
    // before the go-live instant.
  } catch {
    cache = { isLive: false, expiresAt: Date.now() + CACHE_MS };
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isGatedPage = GATED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isGatedApi = GATED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isGatedPage && !isGatedApi) return NextResponse.next();

  if (await isLive()) return NextResponse.next();

  if (isGatedApi) {
    return NextResponse.json({ error: 'Not live yet' }, { status: 403 });
  }
  // The homepage itself renders the same countdown in place of its normal
  // content while the gate is active (see app/page.tsx) — redirecting here
  // rather than to a separate /coming-soon route.
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: ['/gyms/:path*', '/book/:path*', '/checkin/:path*', '/api/gyms/:path*', '/api/bookings/:path*', '/api/checkin/:path*'],
};
