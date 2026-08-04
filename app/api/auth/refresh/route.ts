import { NextResponse } from 'next/server';
import { GatewayError } from '@/lib/gateway-client';
import { readSession, refreshSession, clearSession } from '@/lib/session';
import { rejectCrossOrigin } from '@/lib/csrf';

// Exposed mainly so a client can proactively refresh (e.g. on app focus)
// rather than waiting for a 401 — authedGatewayFetch (lib/session.ts) already
// does this transparently for every other route; this one just makes the
// same rotation callable directly. Shares refreshSession() with
// authedGatewayFetch so there's exactly one place that writes the rotated
// access+refresh cookie pair.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  const { refreshToken } = await readSession();
  if (!refreshToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    await refreshSession(refreshToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Mirror lib/session.ts: only an auth rejection (401/403) means the
    // session is dead — clear it then. A transient gateway/5xx failure must
    // leave the cookies alone so the user isn't force-logged-out by a blip.
    const authFailure = err instanceof GatewayError && (err.status === 401 || err.status === 403);
    if (authFailure) await clearSession();
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
