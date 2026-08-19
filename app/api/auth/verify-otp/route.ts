import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import { writeSession } from '@/lib/session';
import { rejectCrossOrigin } from '@/lib/csrf';

interface VerifyOtpGatewayResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: unknown;
}

// Counterpart to send-otp — see that route. Response shape matches
// verify-firebase/route.ts on purpose so OtpForm's post-verify handling
// (session write, partner redirect) works unchanged either way. Supersedes
// the old ALLOW_DEV_OTP-gated dev-verify-otp route.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { phone?: unknown; otp?: unknown; linkedGymId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { phone, otp, linkedGymId } = body ?? {};
  if (typeof phone !== 'string' || typeof otp !== 'string') {
    return NextResponse.json({ error: 'phone and otp are required' }, { status: 400 });
  }
  // Only meaningful for a brand-new account (the backend ignores it for an
  // existing user — see issueSessionForUser) — attendance-SaaS wedge, set
  // once at signup from the /join/[gymId] page.
  const resolvedLinkedGymId = typeof linkedGymId === 'number' && Number.isInteger(linkedGymId) && linkedGymId > 0
    ? linkedGymId
    : undefined;

  try {
    // role/type hardcoded here, never taken from the request body — same
    // reasoning as verify-firebase/route.ts: the website only ever creates
    // customer accounts through this endpoint.
    const data = await gatewayFetch<VerifyOtpGatewayResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone, otp, role: 'customer', type: 'general', linkedGymId: resolvedLinkedGymId },
    });

    await writeSession(data.accessToken, data.refreshToken);

    return NextResponse.json({ user: data.user, isNewUser: data.isNewUser });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
