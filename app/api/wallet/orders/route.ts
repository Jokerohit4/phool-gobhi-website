import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';
import { WALLET_TOPUP_AMOUNTS } from '@/lib/walletConstants';

interface CreateOrderResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// wallet-service's own /orders endpoint would accept any positive amount —
// the fixed-preset restriction is a website/business policy, not a backend
// one, so it's enforced here rather than assuming the UI alone is enough
// (the UI can always be bypassed by calling this route directly).
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let amount: unknown;
  try {
    ({ amount } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (typeof amount !== 'number' || !WALLET_TOPUP_AMOUNTS.includes(amount as never)) {
    return NextResponse.json({ error: `Amount must be one of: ${WALLET_TOPUP_AMOUNTS.join(', ')}` }, { status: 400 });
  }

  try {
    const data = await authedGatewayFetch<{ data: CreateOrderResponse }>('/api/wallet/orders', {
      method: 'POST',
      body: { amount },
    });
    return NextResponse.json(data.data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
