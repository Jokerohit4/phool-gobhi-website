import { NextResponse } from 'next/server';
import { gatewayFetch, GatewayError } from '@/lib/gateway-client';

export async function POST(req: Request) {
  let phone: unknown;
  try {
    ({ phone } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (typeof phone !== 'string') {
    return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
  }

  try {
    const data = await gatewayFetch<{ message: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: { phone },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
