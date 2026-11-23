import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

// The outgoing body to the gateway is exactly {gymId, date, startTime,
// endTime} (plain-slot booking) or {gymId, date, classId} (class booking) —
// never a price. booking-service always computes the amount itself from
// the gym/slot or class (bookingService.js:211/createBooking's classId
// branch); this route must never grow a price field. For a class booking,
// startTime/endTime are the class's own fixed schedule (resolved
// server-side) — the client never sends them.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { gymId?: unknown; date?: unknown; startTime?: unknown; endTime?: unknown; classId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { gymId, date, startTime, endTime, classId } = body;
  if (!gymId || typeof date !== 'string') {
    return NextResponse.json({ error: 'gymId and date are required' }, { status: 400 });
  }
  if (classId != null) {
    if (typeof classId !== 'number') {
      return NextResponse.json({ error: 'classId must be a number' }, { status: 400 });
    }
  } else if (typeof startTime !== 'string' || typeof endTime !== 'string') {
    return NextResponse.json({ error: 'startTime and endTime are required for a plain-slot booking' }, { status: 400 });
  }

  try {
    const data = await authedGatewayFetch('/api/bookings', {
      method: 'POST',
      body: classId != null ? { gymId, date, classId } : { gymId, date, startTime, endTime },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
