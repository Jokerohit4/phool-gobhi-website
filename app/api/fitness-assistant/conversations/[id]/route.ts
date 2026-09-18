import { NextResponse } from 'next/server';
import { authedGatewayFetch, proxyAuthedGet } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

// Next 16: route params are async — see AGENTS.md's warning that this is not
// the Next you know.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAuthedGet(`/api/health/assistant/conversations/${encodeURIComponent(id)}`);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;
  const { id } = await params;
  try {
    const data = await authedGatewayFetch(
      `/api/health/assistant/conversations/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
