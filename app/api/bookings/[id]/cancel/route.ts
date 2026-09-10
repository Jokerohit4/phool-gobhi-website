import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

// FR-14's optional cancellation feedback. Allowlisted here rather than passed
// through, so a malformed or hostile body can never turn a cancellation into
// a 400 — the backend validates these too, and a rejection there would mean
// the user's booking stayed live because their feedback was unparseable.
// That trade is never worth making: the cancellation is the thing they asked
// for, the feedback is a favour they're doing us.
const CANCELLATION_REASONS = ['not_this_time', 'injury', 'work', 'travel', 'other'];
const NEXT_VISIT_INTENTS = ['today', 'this_week', 'this_month', 'unsure'];

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  const { id } = await ctx.params;

  // A body is optional: older clients and the "Skip" path send none at all.
  let cancellationReason: string | undefined;
  let nextVisitIntent: string | undefined;
  try {
    const body = await req.json();
    if (CANCELLATION_REASONS.includes(body?.cancellationReason)) {
      cancellationReason = body.cancellationReason;
    }
    if (NEXT_VISIT_INTENTS.includes(body?.nextVisitIntent)) {
      nextVisitIntent = body.nextVisitIntent;
    }
  } catch {
    // No body, or not JSON. Cancel anyway.
  }

  const feedback = {
    ...(cancellationReason ? { cancellationReason } : {}),
    ...(nextVisitIntent ? { nextVisitIntent } : {}),
  };

  try {
    // Refund amount is the booking's own server-stored amount — nothing for
    // this route to compute or forward. The feedback rides along with the
    // cancellation so there is exactly one write, same as the app.
    const data = await authedGatewayFetch(`/api/bookings/${id}/cancel`, {
      method: 'PUT',
      // gatewayFetch sets Content-Type and stringifies, so this stays an
      // object. Sent even when empty: the backend treats absent fields as
      // "declined to answer", and an empty object is a valid JSON body.
      body: feedback,
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
