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
const EXCLUDED_KEY = 'pg_analytics_excluded';

// Internal-traffic opt-out for staff testing devices — visit ?notrack=1 once
// and every future post() on this browser (pre- or post-login, this session
// or any later one) no-ops before it ever reaches /api/events. ?notrack=0
// clears it. Checked from post() itself (not a one-time bootstrap call) so
// it takes effect immediately even mid-session, and covers every entry point
// (track/trackScreen/trackCta/identify all funnel through post()).
function syncExcludedFromQueryParam() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('notrack')) return;
  if (params.get('notrack') === '0') {
    localStorage.removeItem(EXCLUDED_KEY);
  } else {
    localStorage.setItem(EXCLUDED_KEY, '1');
  }
}

function isExcluded(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(EXCLUDED_KEY) === '1';
}

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
  syncExcludedFromQueryParam();
  if (isExcluded()) return;
  try {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        distinct_id: currentDistinctId(),
        properties: { app: 'website', platform: 'web', session_id: getOrCreateSessionId(), ...properties },
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

// Coarse channel buckets, same idea as GA's default channel grouping — good
// enough to answer "organic search vs. social vs. someone else's link"
// without a full attribution service. utm_source always wins (an explicit
// campaign tag is a stronger signal than guessing from the referrer host).
const SOCIAL_REFERRER_PATTERN = /facebook|instagram|twitter|x\.com|t\.co|linkedin|whatsapp|reddit|pinterest/i;
const SEARCH_REFERRER_PATTERN = /google|bing|duckduckgo|yahoo|baidu/i;

function classifyChannel(utmSource: string | null, referrerHost: string | null): string {
  if (utmSource) return `campaign:${utmSource}`;
  if (!referrerHost) return 'direct';
  if (SEARCH_REFERRER_PATTERN.test(referrerHost)) return 'organic_search';
  if (SOCIAL_REFERRER_PATTERN.test(referrerHost)) return 'social';
  return 'referral';
}

// Only meaningful captured once, at the very first paint of a tab session —
// document.referrer and the landing URL's query string are both still the
// original values ensureSessionStarted sees them at (before any client-side
// navigation strips or rewrites them), which is why this lives inside
// ensureSessionStarted itself rather than being computed lazily elsewhere.
function getLandingContext(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const context: Record<string, string> = {};

  let referrerHost: string | null = null;
  if (document.referrer) {
    try {
      referrerHost = new URL(document.referrer).hostname;
    } catch {
      // malformed/unparseable referrer — treat as no referrer
    }
  }
  if (referrerHost) context.referrer_host = referrerHost;

  const utmSource = params.get('utm_source');
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) context[key] = value;
  }

  context.channel = classifyChannel(utmSource, referrerHost);
  context.landing_path = window.location.pathname;
  return context;
}

/** Call once per tab session, e.g. from AnalyticsBootstrap on mount. */
export function ensureSessionStarted() {
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(SESSION_STARTED_KEY)) return;
  sessionStorage.setItem(SESSION_STARTED_KEY, '1');
  post('session_started', getLandingContext());
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
