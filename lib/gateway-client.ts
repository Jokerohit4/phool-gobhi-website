import { NextResponse, type NextRequest } from 'next/server';

// Server-only — never imported from a client component. Same convention as
// the existing app/api/verify-pitch-access/route.ts: GATEWAY_URL has no
// NEXT_PUBLIC_ prefix, so it (and everything this file talks to) is
// unreachable from the browser.
const GATEWAY_URL = process.env.GATEWAY_URL;

export class GatewayError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const message =
      body && typeof body === 'object' && 'error' in body ? String((body as { error: unknown }).error) : 'Gateway error';
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface GatewayFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
  headers?: Record<string, string>;
}

// One fetch wrapper so every Route Handler doesn't repeat header/error-shape
// boilerplate. Every call to the gateway from this repo goes through here
// (or authedGatewayFetch in lib/session.ts, which wraps this) — the website
// never calls wallet-service/booking-service/gym-service directly.
export async function gatewayFetch<T = unknown>(path: string, opts: GatewayFetchOptions = {}): Promise<T> {
  if (!GATEWAY_URL) throw new Error('GATEWAY_URL is not configured');
  const { method = 'GET', body, accessToken, headers } = opts;
  // FormData must be passed through as-is — fetch sets its own
  // multipart/form-data boundary header, which JSON.stringify (and a
  // manually-set Content-Type) would break.
  const isFormData = body instanceof FormData;

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON body (e.g. an HTML 502/504 page from Cloud Run or a proxy).
      // Surface it as a GatewayError so callers' existing handling applies:
      // route handlers forward err.status/err.body, and lib/session.ts only
      // treats 401/403 as a dead session, so a 5xx stays a transient error.
      // A 2xx with an unparseable body is a broken upstream, reported as 502.
      throw new GatewayError(res.ok ? 502 : res.status, { error: 'Gateway returned an invalid response' });
    }
  }

  if (!res.ok) {
    throw new GatewayError(res.status, data);
  }
  return data as T;
}

// Lifts the visitor's GPS fix (sent by the browser per lib/locationHolder.ts)
// off the incoming request so a Route Handler can forward it to the gateway
// — gym-service reads these to populate Gym.distanceKm.
export function pickLocationHeaders(req: NextRequest): Record<string, string> {
  const lat = req.headers.get('x-user-lat');
  const lng = req.headers.get('x-user-lng');
  return lat && lng ? { 'x-user-lat': lat, 'x-user-lng': lng } : {};
}

// Shared response shaping for the many read-only public passthrough routes
// (gym browse/detail/slots/availability/reviews) — call the gateway, forward
// its status/body verbatim, or 502 if the gateway itself is unreachable.
export async function proxyGatewayGet(
  gatewayPath: string,
  headers?: Record<string, string>,
): Promise<NextResponse> {
  try {
    const data = await gatewayFetch(gatewayPath, { headers });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
