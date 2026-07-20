import { NextResponse } from 'next/server';

// SameSite=Lax on pg_at/pg_rt (lib/session.ts) already blocks the CSRF cases
// that matter here — every mutating route in this app is POST/PUT/PATCH,
// never a GET a third-party page could trigger via a plain link/image tag.
// This Origin check is defense-in-depth for the edge cases SameSite doesn't
// cover (older browsers, a browser extension stripping cookie attributes).
// Call this first in every route handler that mutates state.
//
// Deliberately compares Origin against the request's own Host/X-Forwarded-Host
// header, NOT new URL(req.url).origin — a Route Handler's req.url is
// normalized by Next.js internally (e.g. to "localhost:<port>") and does not
// reflect the Host the client actually sent, so comparing against it rejects
// every legitimate same-origin request in both local dev and prod.
export function rejectCrossOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get('origin');
  if (!origin) return null; // same-site requests often omit Origin; SameSite=Lax is the real guard

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!host) return null; // nothing to compare against — SameSite=Lax remains the primary guard

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 });
  }

  if (originHost !== host) {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 });
  }
  return null;
}
