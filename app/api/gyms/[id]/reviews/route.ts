import type { NextRequest } from 'next/server';
import { proxyGatewayGet } from '@/lib/gateway-client';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyGatewayGet(`/api/gyms/${id}/reviews${req.nextUrl.search}`);
}
