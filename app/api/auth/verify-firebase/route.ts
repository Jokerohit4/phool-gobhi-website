import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import { writeSession } from '@/lib/session';
import { rejectCrossOrigin } from '@/lib/csrf';

interface VerifyFirebaseGatewayResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: unknown;
}

export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { idToken?: unknown; name?: unknown; email?: unknown; linkedGymId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { idToken, name, email, linkedGymId } = body ?? {};
  if (typeof idToken !== 'string') {
    return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
  }
  // Only meaningful for a brand-new account (the backend ignores it for an
  // existing user — see issueSessionForUser) — attendance-SaaS wedge, set
  // once at signup from the /join/[gymId] page.
  const resolvedLinkedGymId = typeof linkedGymId === 'number' && Number.isInteger(linkedGymId) && linkedGymId > 0
    ? linkedGymId
    : undefined;

  try {
    // role/type hardcoded here, never taken from the request body — same
    // reasoning as verify-otp/route.ts: the website only ever creates
    // customer accounts through this endpoint.
    const data = await gatewayFetch<VerifyFirebaseGatewayResponse>('/api/auth/verify-firebase-token', {
      method: 'POST',
      body: { idToken, name, email, role: 'customer', type: 'general', linkedGymId: resolvedLinkedGymId },
    });

    await writeSession(data.accessToken, data.refreshToken);

    return NextResponse.json({ user: data.user, isNewUser: data.isNewUser });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
