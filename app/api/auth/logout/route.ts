import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';
import { rejectCrossOrigin } from '@/lib/csrf';

// This can only clear the website's own cookies — the refresh JWT itself has
// no server-side revocation (stateless, 7-day expiry, see lib/session.ts) and
// stays valid until it naturally expires. Accepted, pre-existing gap shared
// with the mobile apps; not something this route can fix on its own.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  await clearSession();
  return NextResponse.json({ ok: true });
}
