import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import { writeSession } from '@/lib/session';

interface VerifyOtpGatewayResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: unknown;
}

// Dedicated entry point for partner signup — the only place on the website
// that ever requests role:'partner' for a brand-new phone number. Kept as
// its own route (not a parameter on the regular verify-otp) for the same
// reason that one hardcodes 'customer': role must never be taken from the
// request body, only from which fixed endpoint the client called.
//
// An existing account still always authenticates as its real DB role
// regardless of what's requested here (see auth-service's
// issueSessionForUser) — so a customer's number typed into this form logs
// them in as themselves, not as a partner. The caller checks
// `user.role === 'partner'` on the response and only proceeds to the
// partner app when it's actually true.
export async function POST(req: Request) {
  let body: { phone?: unknown; otp?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { phone, otp } = body ?? {};
  if (typeof phone !== 'string' || typeof otp !== 'string') {
    return NextResponse.json({ error: 'Phone and otp are required' }, { status: 400 });
  }

  try {
    const data = await gatewayFetch<VerifyOtpGatewayResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone, otp, role: 'partner', type: 'general' },
    });

    await writeSession(data.accessToken, data.refreshToken);

    return NextResponse.json({ user: data.user, isNewUser: data.isNewUser });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
