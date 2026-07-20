import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

interface CreateOrderResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// amount here is legitimately client-controlled — it's the user's own
// wallet top-up amount, charged to them via Razorpay. wallet-service never
// trusts a client amount again at /verify (lib below) — it re-reads the
// DB-stored order amount created here.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let amount: unknown;
  try {
    ({ amount } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'A positive amount is required' }, { status: 400 });
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
