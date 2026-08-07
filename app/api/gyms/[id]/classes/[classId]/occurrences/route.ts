import type { NextRequest } from 'next/server';
import { proxyGatewayGet } from '@/lib/gateway-client';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string; classId: string }> }) {
  const { id, classId } = await ctx.params;
  return proxyGatewayGet(`/api/gyms/${id}/classes/${classId}/occurrences${req.nextUrl.search}`);
}
