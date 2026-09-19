import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

export async function POST(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { message?: unknown; conversationId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    // Forwarded verbatim rather than validated here: the backend already
    // enforces length, rate limit, consent and scope, and a second copy of
    // those rules in the BFF is a second place for them to drift.
    const data = await authedGatewayFetch('/api/health/assistant/messages', {
      method: 'POST',
      body: { message: body.message, conversationId: body.conversationId },
    });
    return NextResponse.json(data);
  } catch (err) {
    // The interesting statuses all come from the gateway and are forwarded
    // intact, because the UI branches on them: 403 CONSENT_REQUIRED /
    // CONSENT_STALE, 429 RATE_LIMITED (with retryAfterSeconds), and the two
    // 503s — ASSISTANT_UNAVAILABLE (provider fault) and ASSISTANT_CAPACITY
    // (provider out of quota). Both mean the message was saved.
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
