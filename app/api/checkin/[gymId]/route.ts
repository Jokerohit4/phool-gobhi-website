import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

// Browser-geolocation fallback for the poster-QR flow when the native app
// isn't installed — same backend endpoint the app's self-check-in uses.
export async function POST(req: Request, ctx: { params: Promise<{ gymId: string }> }) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  const { gymId } = await ctx.params;

  let body: { lat?: unknown; lng?: unknown; confirmEarly?: unknown; join?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { lat, lng, confirmEarly, join } = body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'lat and lng are required', code: 'LOCATION_REQUIRED' }, { status: 400 });
  }

  try {
    const data = await authedGatewayFetch(`/api/bookings/gym/${gymId}/entrance-checkin`, {
      method: 'POST',
      // `join` is the customer's explicit "I'm a member, add me" tap. The
      // server only honours it after verifying they are inside the gym.
      body: { lat, lng, confirmEarly: !!confirmEarly, join: join === true },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
