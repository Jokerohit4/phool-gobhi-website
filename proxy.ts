import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Server-only, same convention as lib/gateway-client.ts.
const GATEWAY_URL = process.env.GATEWAY_URL;

// Gym visibility + booking creation are gated until launch; partner
// onboarding (/partner/*) and every marketing page are deliberately outside
// these prefixes and stay live throughout.
const GYMS_PAGE_PREFIXES = ['/gyms', '/book', '/checkin'];
const GYMS_API_PREFIXES = ['/api/gyms', '/api/bookings', '/api/checkin'];

// Wallet pages/APIs are gated only while wallet maintenance is active — never
// by the launch gate (the wallet is fine to use post-launch).
const WALLET_PAGE_PREFIXES = ['/account/wallet'];
const WALLET_API_PREFIXES = ['/api/wallet'];

// Best-effort in-memory cache so a burst of gated requests doesn't hit the
// gateway once per request — proxy has no access to shared state across
// instances, this is purely per-instance and can go stale by CACHE_MS, which
// is fine for a launch gate (not a security boundary against a fresh instant).
let launchCache: { isLive: boolean; expiresAt: number } | null = null;
let maintenanceCache: { status: MaintenanceStatus; expiresAt: number } | null = null;
const CACHE_MS = 15_000;

interface MaintenanceEntry {
  active: boolean;
  message: string;
}

interface MaintenanceStatus {
  wallet: MaintenanceEntry;
  gyms: MaintenanceEntry;
}

const NO_MAINTENANCE: MaintenanceStatus = {
  wallet: { active: false, message: '' },
  gyms: { active: false, message: '' },
};

const DEFAULT_WALLET_MESSAGE = 'Wallet services are temporarily unavailable. Please try again later.';
const DEFAULT_GYMS_MESSAGE = 'Gym browsing and booking are temporarily unavailable. Please try again later.';

async function isLive(): Promise<boolean> {
  if (launchCache && launchCache.expiresAt > Date.now()) return launchCache.isLive;
  // If the gateway itself isn't configured, every other route on this site
  // is already broken — fail closed here too rather than special-case it.
  if (!GATEWAY_URL) return false;
  try {
    const res = await fetch(`${GATEWAY_URL}/api/auth/launch-status`, { cache: 'no-store' });
    const data = (await res.json()) as { isLive?: boolean };
    const live = res.ok && data.isLive === true;
    launchCache = { isLive: live, expiresAt: Date.now() + CACHE_MS };
    return live;
    // Fails closed on a gateway hiccup: a false "not live yet" self-heals on
    // the next request, while a false "live" would leak gym visibility
    // before the go-live instant.
  } catch {
    launchCache = { isLive: false, expiresAt: Date.now() + CACHE_MS };
    return false;
  }
}

// Maintenance status is served from /app-config (same blob the admin portal
// edits). Unlike the launch gate this FAILS OPEN: a transient gateway/DB
// blip must never masquerade as a maintenance window, since that would take
// the site down for exactly the people who aren't under maintenance.
async function getMaintenance(): Promise<MaintenanceStatus> {
  if (maintenanceCache && maintenanceCache.expiresAt > Date.now()) return maintenanceCache.status;
  if (!GATEWAY_URL) return NO_MAINTENANCE;
  try {
    const res = await fetch(`${GATEWAY_URL}/api/auth/app-config`, { cache: 'no-store' });
    const data = (await res.json()) as {
      maintenance?: {
        wallet?: { active?: boolean; message?: string };
        gyms?: { active?: boolean; message?: string };
      };
    };
    const m = data?.maintenance;
    const status: MaintenanceStatus = {
      wallet: { active: m?.wallet?.active === true, message: m?.wallet?.message || DEFAULT_WALLET_MESSAGE },
      gyms: { active: m?.gyms?.active === true, message: m?.gyms?.message || DEFAULT_GYMS_MESSAGE },
    };
    maintenanceCache = { status, expiresAt: Date.now() + CACHE_MS };
    return status;
  } catch {
    maintenanceCache = { status: NO_MAINTENANCE, expiresAt: Date.now() + CACHE_MS };
    return NO_MAINTENANCE;
  }
}

function maintenanceJson(feature: 'wallet' | 'gyms', message: string) {
  return NextResponse.json({ error: message, maintenance: true, feature }, { status: 503 });
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method } = request;

  const isGymsPage = GYMS_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isGymsApi = GYMS_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isWalletPage = WALLET_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isWalletApi = WALLET_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  // Booking creation and cancellation move wallet money server-side, so they
  // are also gated while the wallet is under maintenance even though they
  // live under /api/bookings (which is otherwise a gyms surface).
  const isWalletMoneyMover =
    (pathname === '/api/bookings' && method === 'POST') ||
    (/^\/api\/bookings\/[^/]+\/cancel$/.test(pathname) && method === 'PUT');

  if (!isGymsPage && !isGymsApi && !isWalletPage && !isWalletApi && !isWalletMoneyMover) {
    return NextResponse.next();
  }

  // Launch gate — gyms surfaces only, existing behavior.
  if (isGymsPage || isGymsApi) {
    if (!(await isLive())) {
      if (isGymsApi) return NextResponse.json({ error: 'Not live yet' }, { status: 403 });
      // The homepage itself renders the countdown in place of its normal
      // content while the gate is active (see app/page.tsx) — redirecting
      // here rather than to a separate /coming-soon route.
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const maintenance = await getMaintenance();

  // Gyms maintenance gates the whole gym section (browse/detail/booking/checkin).
  if (maintenance.gyms.active && (isGymsPage || isGymsApi)) {
    if (isGymsApi) return maintenanceJson('gyms', maintenance.gyms.message);
    // The global MaintenanceBanner explains what's down on the homepage.
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Wallet maintenance gates the wallet page/APIs and booking money movers.
  if (maintenance.wallet.active && (isWalletPage || isWalletApi || isWalletMoneyMover)) {
    if (isWalletPage) return NextResponse.redirect(new URL('/account/profile', request.url));
    return maintenanceJson('wallet', maintenance.wallet.message);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/gyms/:path*',
    '/book/:path*',
    '/checkin/:path*',
    '/api/gyms/:path*',
    '/api/bookings/:path*',
    '/api/checkin/:path*',
    '/account/wallet/:path*',
    '/api/wallet/:path*',
  ],
};
