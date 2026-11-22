import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';
import { toE164 } from '@/lib/phone';

// Direct (non-Firebase) OTP send, used whenever GET /api/auth/otp-config
// reports "fast2sms" or "skip" — the backend itself decides whether a given
// phone gets a real SMS or a skip-mode bypass (see otpProviderService.js),
// so this route never needs to know which. Supersedes the old
// ALLOW_DEV_OTP-gated dev-send-otp route: that flag no longer exists on the
// backend, replaced by the admin-configurable provider.
export async function POST(req: Request) {
  // Each call can trigger a paid SMS, so refuse cross-origin callers.
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { phone } = body ?? {};
  if (typeof phone !== 'string' || phone.length > 20) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }
  if (toE164(phone) === null) {
    return NextResponse.json({ error: 'phone must be a valid 10-digit Indian mobile number' }, { status: 400 });
  }

  try {
    const data = await gatewayFetch('/api/auth/send-otp', { method: 'POST', body: { phone } });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
