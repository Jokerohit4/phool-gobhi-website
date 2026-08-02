import { NextResponse } from 'next/server';
import { proxyGatewayGet, GatewayError } from '@/lib/gateway-client';
import { authedGatewayFetch } from '@/lib/session';
import { rejectCrossOrigin } from '@/lib/csrf';

export async function GET() {
  return proxyGatewayGet('/api/auth/platform-reviews');
}

// Customer-authenticated — one review per customer (upsert), enforced
// backend-side. Never carries a price/amount, so no self-booking-style
// fraud concern here, just the standard CSRF guard on a mutating route.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { rating?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { rating, comment } = body;
  if (typeof rating !== 'number') {
    return NextResponse.json({ error: 'rating is required' }, { status: 400 });
  }

  try {
    const data = await authedGatewayFetch('/api/auth/platform-reviews', {
      method: 'POST',
      body: { rating, comment: typeof comment === 'string' ? comment : null },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
