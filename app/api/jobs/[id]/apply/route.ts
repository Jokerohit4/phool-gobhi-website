import { gatewayFetch, GatewayError } from '@/lib/gateway-client';

// Public, unauthenticated write — same no-CSRF-surface reasoning as
// app/api/contact/route.ts (no cookie/session involved, nothing to forge
// someone else's identity into). Rate-limited at the gateway.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: { name?: unknown; email?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { name, email, message } = body ?? {};
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return Response.json({ error: 'Name, email and message are required' }, { status: 400 });
  }

  try {
    const data = await gatewayFetch(`/api/auth/jobs/${id}/apply`, {
      method: 'POST',
      body: { name, email, message },
    });
    return Response.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof GatewayError) return Response.json(err.body, { status: err.status });
    return Response.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
