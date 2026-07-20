import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';
import { readSession, writeAccessToken, clearSession } from '@/lib/session';
import { rejectCrossOrigin } from '@/lib/csrf';

// Exposed mainly so a client can proactively refresh (e.g. on app focus)
// rather than waiting for a 401 — authedGatewayFetch (lib/session.ts) already
// does this transparently for every other route; this one just makes the
// same rotation callable directly.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  const { refreshToken } = await readSession();
  if (!refreshToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const data = await gatewayFetch<{ accessToken: string }>('/api/auth/refresh-token', {
      method: 'POST',
      body: { token: refreshToken },
    });
    await writeAccessToken(data.accessToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    await clearSession();
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
