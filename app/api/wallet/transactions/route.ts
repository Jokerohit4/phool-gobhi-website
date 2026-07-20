import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';

interface MeResponse {
  id: number;
}

// wallet-service's transactions endpoint is keyed by userId in the path
// (GET /api/wallet/:userId/transactions, ownership-checked server-side
// against the JWT), not a "mine" route — so this needs the current user's
// id first, same pattern as app/api/profile/route.ts.
export async function GET() {
  try {
    const me = await authedGatewayFetch<MeResponse>('/api/auth/me');
    const data = await authedGatewayFetch(`/api/wallet/${me.id}/transactions`);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
