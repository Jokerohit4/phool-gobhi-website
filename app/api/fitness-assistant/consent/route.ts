import { NextResponse } from 'next/server';
import { authedGatewayFetch, proxyAuthedGet } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

// Disclaimer text + this user's consent state in one call, so the chat screen
// can decide whether to show the gate without a second round trip.
export async function GET() {
  return proxyAuthedGet('/api/health/assistant/consent');
}

// Deliberately sends no body: the backend stamps its own policy version, which
// is what makes "the terms changed, agree again" enforceable. A version
// supplied from here would just be the client asserting what it agreed to.
export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;
  try {
    const data = await authedGatewayFetch('/api/health/assistant/consent', {
      method: 'POST',
      body: {},
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}

export async function DELETE(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;
  try {
    const data = await authedGatewayFetch('/api/health/assistant/consent', { method: 'DELETE' });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
