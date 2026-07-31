import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import { writeSession } from '@/lib/session';

interface VerifyOtpGatewayResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: unknown;
}

// Partner counterpart to dev-verify-otp, mirroring verify-firebase-partner's
// route.ts — see dev-send-otp for why this dev bypass exists. role: 'partner'
// is only a request-for-a-new-account; an existing phone still authenticates
// as its real DB role regardless (see auth-service's issueSessionForUser),
// which is why PartnerSignupForm checks user.role === 'partner' on the
// response rather than trusting what it asked for.
export async function POST(req: Request) {
  if (process.env.ALLOW_DEV_OTP !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  let body: { phone?: unknown; otp?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { phone, otp } = body ?? {};
  if (typeof phone !== 'string' || typeof otp !== 'string') {
    return NextResponse.json({ error: 'phone and otp are required' }, { status: 400 });
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
