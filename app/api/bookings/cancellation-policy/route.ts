import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import type { CancellationPolicyTier } from '@/lib/cancellationPolicy';

// Serve the admin-editable cancellation policy (booking-service)
// so the UI can show the exact tier the backend will apply, instead of a
// hand-mirrored copy that can drift. Requires an authenticated customer
// session (the backend gates this route to customer/gobhi roles) — logged-out
// callers get a 401 and the UI falls back to DEFAULT_CANCELLATION_TIERS.
export async function GET() {
  try {
    const data = await authedGatewayFetch<{ tiers: CancellationPolicyTier[]; updatedAt: string | null }>(
      '/api/bookings/cancellation-policy',
    );
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}