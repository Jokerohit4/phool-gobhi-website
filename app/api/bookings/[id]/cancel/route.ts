import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  const { id } = await ctx.params;
  try {
    // Refund amount is the booking's own server-stored amount — nothing for
    // this route to compute or forward.
    const data = await authedGatewayFetch(`/api/bookings/${id}/cancel`, { method: 'PUT' });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
