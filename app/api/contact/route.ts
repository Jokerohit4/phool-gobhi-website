import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';

// First-party replacement for the previous Formspree integration (its form
// id had gone stale — every submission 404'd with no visible failure to the
// submitter). This is a public, unauthenticated write with no cookie/session
// involved, so there's no CSRF surface here (nothing to forge someone else's
// identity into); the gateway's own rate limiter is the abuse guard.
export async function POST(req: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { name, email, message } = body ?? {};
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
  }

  try {
    const data = await gatewayFetch('/api/auth/contact', {
      method: 'POST',
      body: { name, email, message },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
