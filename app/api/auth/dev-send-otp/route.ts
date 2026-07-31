import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';

// Dev-only bypass for Firebase Phone Auth: sending a real SMS through
// Firebase requires the dev project to be on the paid Blaze plan just to
// test a login, when the backend already has a free 123456 backdoor
// (ALLOW_DEV_OTP) used everywhere else in dev. Gated on the server-only
// (non-NEXT_PUBLIC) flag so this can never activate in prod even if called
// directly, regardless of what the client sends.
export async function POST(req: Request) {
  if (process.env.ALLOW_DEV_OTP !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  let body: { phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { phone } = body ?? {};
  if (typeof phone !== 'string') {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }

  try {
    const data = await gatewayFetch('/api/auth/send-otp', { method: 'POST', body: { phone } });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
