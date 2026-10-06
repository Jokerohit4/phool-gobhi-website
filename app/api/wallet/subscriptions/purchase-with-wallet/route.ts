import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

// sixMonthly is deliberately included: gyms can set a six-month plan price
// (gym-service SUBSCRIPTION_PLANS lists it), the plan row is sellable on the
// site, and wallet-service accepts it — it was only missing from this
// allowlist, which made every six-month purchase 400 at the BFF while the
// price still showed on the gym page.
const VALID_PLAN_TYPES = ['weekly', 'monthly', 'quarterly', 'sixMonthly', 'yearly'];

// Subscriptions are paid out of wallet balance only, never a direct Razorpay
// charge — see wallet-service's purchaseSubscriptionWithWallet for why (RBI
// refund-to-original-source). Price is never client-supplied here —
// wallet-service looks it up itself from the gym's own plan pricing.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { gymId?: unknown; planType?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { gymId, planType } = body;
  if (!gymId || typeof planType !== 'string' || !VALID_PLAN_TYPES.includes(planType)) {
    return NextResponse.json({ error: 'gymId and a valid planType are required' }, { status: 400 });
  }

  try {
    const data = await authedGatewayFetch('/api/wallet/subscriptions/purchase-with-wallet', {
      method: 'POST',
      body: { gymId, planType },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
