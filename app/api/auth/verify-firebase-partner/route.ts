import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import { writeSession } from '@/lib/session';

interface VerifyFirebaseGatewayResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: unknown;
}

// Dedicated entry point for partner signup — mirrors verify-otp-partner's
// route.ts. Kept separate from verify-firebase (not a parameter on it) for
// the same reason that one hardcodes 'customer': role must never be taken
// from the request body, only from which fixed endpoint the client called.
//
// An existing account still always authenticates as its real DB role
// regardless of what's requested here (see auth-service's
// issueSessionForUser) — the caller checks `user.role === 'partner'` on the
// response and only proceeds to the partner app when it's actually true.
export async function POST(req: Request) {
  let body: { idToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { idToken } = body ?? {};
  if (typeof idToken !== 'string') {
    return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
  }

  try {
    const data = await gatewayFetch<VerifyFirebaseGatewayResponse>('/api/auth/verify-firebase-token', {
      method: 'POST',
      body: { idToken, role: 'partner', type: 'general' },
    });

    await writeSession(data.accessToken, data.refreshToken);

    return NextResponse.json({ user: data.user, isNewUser: data.isNewUser });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
