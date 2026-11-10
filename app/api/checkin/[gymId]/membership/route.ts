import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

export async function POST(req: Request, ctx: { params: Promise<{ gymId: string }> }) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;
  const gymId = Number((await ctx.params).gymId);
  if (!Number.isInteger(gymId) || gymId <= 0) return NextResponse.json({ error: 'Invalid gym' }, { status: 400 });
  try {
    const data = await authedGatewayFetch('/api/auth/gym-links/entrance-request', {
      method: 'POST', body: { gymId },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
