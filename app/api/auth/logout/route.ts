import { NextResponse } from 'next/server';
import { gatewayFetch } from '@/lib/gateway-client';
import { readSession, clearSession } from '@/lib/session';
import { rejectCrossOrigin } from '@/lib/csrf';

// Revokes the refresh token's whole rotation family server-side (so it can't
// be replayed after logout) before clearing local cookies. Best-effort: a
// failed revoke call must never block the user from logging out locally.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  const { refreshToken } = await readSession();
  if (refreshToken) {
    await gatewayFetch('/api/auth/logout', { method: 'POST', body: { token: refreshToken } }).catch(() => null);
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}
