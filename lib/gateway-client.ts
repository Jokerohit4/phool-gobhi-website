import { NextResponse } from 'next/server';

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
}

// One fetch wrapper so every Route Handler doesn't repeat header/error-shape
// boilerplate. Every call to the gateway from this repo goes through here
// (or authedGatewayFetch in lib/session.ts, which wraps this) — the website
// never calls wallet-service/booking-service/gym-service directly.
export async function gatewayFetch<T = unknown>(path: string, opts: GatewayFetchOptions = {}): Promise<T> {
  if (!GATEWAY_URL) throw new Error('GATEWAY_URL is not configured');
  const { method = 'GET', body, accessToken } = opts;

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new GatewayError(res.status, data);
  }
  return data as T;
}

// Shared response shaping for the many read-only public passthrough routes
// (gym browse/detail/slots/availability/reviews) — call the gateway, forward
// its status/body verbatim, or 502 if the gateway itself is unreachable.
export async function proxyGatewayGet(gatewayPath: string): Promise<NextResponse> {
  try {
    const data = await gatewayFetch(gatewayPath);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
