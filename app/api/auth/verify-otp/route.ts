import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import { writeSession } from '@/lib/session';

interface VerifyOtpGatewayResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: unknown;
}

export async function POST(req: Request) {
  let body: { phone?: unknown; otp?: unknown; name?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { phone, otp, name, email } = body ?? {};
  if (typeof phone !== 'string' || typeof otp !== 'string') {
    return NextResponse.json({ error: 'Phone and otp are required' }, { status: 400 });
  }

  try {
    // role/type are hardcoded here — never taken from the request body. The
    // website only ever creates customer accounts; forwarding a client-sent
    // role would let a caller request role:'partner' or role:'gobhi' for a
    // brand-new phone number (the backend now rejects 'gobhi' outright, see
    // auth-service/services/authService.js, but this route shouldn't rely on
    // that alone).
    const data = await gatewayFetch<VerifyOtpGatewayResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone, otp, name, email, role: 'customer', type: 'general' },
    });

    await writeSession(data.accessToken, data.refreshToken);

    // Never forward accessToken/refreshToken to the browser — they live only
    // in the httpOnly cookies just set above.
    return NextResponse.json({ user: data.user, isNewUser: data.isNewUser });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
