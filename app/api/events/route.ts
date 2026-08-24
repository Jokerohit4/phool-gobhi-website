import { NextResponse } from 'next/server';
import { gatewayFetch } from '@/lib/gateway-client';

// Vercel stamps every request hitting this serverless function with the
// visitor's edge-derived geolocation (unlike `ip`, which here is our own
// egress address — see the admin portal's HIDDEN_INLINE_PROPS note). The
// country header is an ISO 3166-1 code ('IN'); DisplayNames turns it into
// the readable name ('India') that dashboards and dropdowns want. City is
// percent-encoded. Both are absent locally/outside Vercel — stamping just
// skips then, and those events simply show up under "no location tag".
let regionNames: Intl.DisplayNames | null = null;
function geoFromHeaders(headers: Headers): Record<string, string> {
  const geo: Record<string, string> = {};
  const countryCode = headers.get('x-vercel-ip-country');
  if (countryCode) {
    try {
      regionNames ||= new Intl.DisplayNames(['en'], { type: 'region' });
      const name = regionNames.of(countryCode);
      if (name && name !== countryCode) geo.geo_country = name;
    } catch {
      // Unknown code or no ICU — leave untagged rather than store a raw code
      // that would fork the country dimension into two spellings.
    }
  }
  const encodedCity = headers.get('x-vercel-ip-city');
  if (encodedCity) {
    try {
      const city = decodeURIComponent(encodedCity);
      if (city) geo.geo_city = city;
    } catch {
      // malformed encoding — skip
    }
  }
  return geo;
}

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
      const userAgent = req.headers.get('user-agent');
      const geo = geoFromHeaders(req.headers);
      const properties = typeof body.properties === 'object' && body.properties !== null ? body.properties : {};
      await gatewayFetch('/api/events', {
        method: 'POST',
        body: {
          event: body.event,
          distinct_id: typeof body.distinct_id === 'string' ? body.distinct_id : undefined,
          // Raw UA only — the gateway parses it into os/browser/device_type
          // fields centrally, so both website and any other future client
          // surface get identically-shaped enrichment from one place.
          properties: { ...properties, ...(userAgent ? { user_agent: userAgent } : {}), ...geo },
        },
      });
    } catch {
      // Swallow — never fail the client over analytics. A gateway error vs a
      // network failure are both just "didn't land," nothing to react to.
    }
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
