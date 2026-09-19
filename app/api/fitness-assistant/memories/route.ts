import { NextResponse } from 'next/server';
import { authedGatewayFetch, proxyAuthedGet } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

export async function GET() {
  return proxyAuthedGet('/api/health/assistant/memories');
}

// Upserts a fact the user states directly, which the backend records as
// 'user_confirmed' rather than 'extracted'. Body forwarded verbatim: the
// allowed keys and length limits live in one place server-side, and a second
// copy here would only be somewhere for them to drift.
export async function PUT(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { key?: unknown; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const data = await authedGatewayFetch('/api/health/assistant/memories', {
      method: 'PUT',
      body: { key: body.key, value: body.value },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
