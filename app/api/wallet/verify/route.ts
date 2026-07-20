import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { orderId?: unknown; razorpayPaymentId?: unknown; razorpaySignature?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { orderId, razorpayPaymentId, razorpaySignature } = body;
  if (typeof orderId !== 'string' || typeof razorpayPaymentId !== 'string' || typeof razorpaySignature !== 'string') {
    return NextResponse.json({ error: 'orderId, razorpayPaymentId and razorpaySignature are required' }, { status: 400 });
  }

  try {
    // wallet-service HMAC-verifies razorpaySignature server-side and credits
    // the amount stored on the order row at /orders time — it never trusts a
    // client-supplied amount here.
    const data = await authedGatewayFetch('/api/wallet/verify', {
      method: 'POST',
      body: { orderId, razorpayPaymentId, razorpaySignature },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
