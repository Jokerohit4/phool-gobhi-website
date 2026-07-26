import { NextResponse } from 'next/server';
import { gatewayFetch } from '@/lib/gateway-client';

// Proxies client-side analytics events to the backend gateway's public
// /api/events route (same ingestion endpoint the Flutter apps POST to — see
// docs/analytics-events.json for the event registry it validates against).
// Public, unauthenticated, same reasoning as app/api/contact/route.ts: no
// cookie/session is forged here, and the gateway's own allowlist + rate
// limiter (60/min/IP) are the abuse guard, not anything in this route.
// Analytics must never surface as a page error, so this always 202s.
export async function POST(req: Request) {
  let body: { event?: unknown; distinct_id?: unknown; properties?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  if (typeof body?.event === 'string') {
    try {
      await gatewayFetch('/api/events', {
        method: 'POST',
        body: {
          event: body.event,
          distinct_id: typeof body.distinct_id === 'string' ? body.distinct_id : undefined,
          properties: typeof body.properties === 'object' && body.properties !== null ? body.properties : {},
        },
      });
    } catch {
      // Swallow — never fail the client over analytics. A gateway error vs a
      // network failure are both just "didn't land," nothing to react to.
    }
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
