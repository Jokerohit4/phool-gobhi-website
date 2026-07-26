'use client';

// Client-safe analytics helper — mirrors the Flutter apps' FirstPartyAnalyticsService
// (lib/core/analytics/analytics_service.dart in both apps): same event shape
// ({event, distinct_id, properties}), same anon-id/identify/session-id model,
// posting through this site's own /api/events route rather than the gateway
// directly (GATEWAY_URL has no NEXT_PUBLIC_ prefix — the browser can't reach
// it). See docs/analytics-events.json in phool-gobhi-backend for the full
// event registry; only use event names listed there, or the gateway's
// allowlist silently drops them.

const ANON_ID_KEY = 'pg_analytics_anon_id';
const SESSION_ID_KEY = 'pg_analytics_session_id';
const SESSION_STARTED_KEY = 'pg_analytics_session_started';

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getOrCreateAnonId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = newId('anon');
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

// sessionStorage (not localStorage) is deliberate — a new tab/window is a new
// session, matching the apps' "one id per cold start" semantics.
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = newId('sess');
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

// In-memory current identity — starts as the persisted anon id, becomes the
// real userId after identify(). Not persisted itself (only the anon id is);
// a page reload while logged in just re-derives it from the session cookie
// via SessionProvider calling identify() again on refresh().
let distinctId: string | null = null;

function currentDistinctId(): string {
  if (!distinctId) distinctId = getOrCreateAnonId();
  return distinctId;
}

function post(event: string, properties: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        distinct_id: currentDistinctId(),
        properties: { app: 'website', session_id: getOrCreateSessionId(), ...properties },
      }),
      // Lets the request complete even if it's fired right before/during
      // navigation (e.g. a CTA click that also triggers a route change).
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics must never break the page
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  post(event, properties);
}

export function trackScreen(pathname: string) {
  post('screen_viewed', { screen_name: pathname });
}

export function trackCta(cta: string) {
  post('cta_clicked', { cta });
}

/** Call once per tab session, e.g. from AnalyticsBootstrap on mount. */
export function ensureSessionStarted() {
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(SESSION_STARTED_KEY)) return;
  sessionStorage.setItem(SESSION_STARTED_KEY, '1');
  post('session_started');
}

/** Call from SessionProvider once a logged-in user resolves. */
export function identify(userId: string, traits?: Record<string, unknown>) {
  const priorAnon = currentDistinctId();
  distinctId = userId;
  post('identify', { anon_distinct_id: priorAnon, ...traits });
}

/**
 * Call on logout — generates and persists a fresh anon id so the next
 * pre-login session on a shared device doesn't inherit the previous user's
 * identity, same rationale as the apps' AnalyticsService.reset().
 */
export function resetAnalyticsIdentity() {
  if (typeof window === 'undefined') return;
  const fresh = newId('anon');
  localStorage.setItem(ANON_ID_KEY, fresh);
  distinctId = fresh;
}
