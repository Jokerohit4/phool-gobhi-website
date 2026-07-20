import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';

// auth-service's getMe returns the user flat ({id, phone, name, ...}), not
// wrapped — but SessionProvider (and verify-otp's response, which the
// backend does wrap in `.user`) expect {user: {...}} consistently on this
// side of the BFF. Wrap it here rather than relying on the raw passthrough
// proxyAuthedGet gives every other route.
export async function GET() {
  try {
    const user = await authedGatewayFetch('/api/auth/me');
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
