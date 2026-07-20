import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

// The outgoing body to the gateway is exactly {gymId, date, startTime,
// endTime} — never a price. booking-service always computes the amount
// itself from the gym/slot (bookingService.js:211); this route must never
// grow a price field.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { gymId?: unknown; date?: unknown; startTime?: unknown; endTime?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { gymId, date, startTime, endTime } = body;
  if (!gymId || typeof date !== 'string' || typeof startTime !== 'string' || typeof endTime !== 'string') {
    return NextResponse.json({ error: 'gymId, date, startTime and endTime are required' }, { status: 400 });
  }

  try {
    const data = await authedGatewayFetch('/api/bookings', {
      method: 'POST',
      body: { gymId, date, startTime, endTime },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
