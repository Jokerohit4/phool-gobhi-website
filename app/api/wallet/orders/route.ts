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

// The preset/custom-amount restriction is DB-backed (wallet-service's
// WalletTopupConfig, admin-editable), so it's not duplicated here —
// wallet-service's own createTopUpOrder is the sole enforcement point, and
// its (dynamic, config-driven) error message is forwarded verbatim below.
// This route only guards against obviously-invalid input.
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
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
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
