import type { NextRequest } from 'next/server';
import { pickLocationHeaders, proxyGatewayGet } from '@/lib/gateway-client';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyGatewayGet(`/api/gyms/${id}${req.nextUrl.search}`, pickLocationHeaders(req));
}
