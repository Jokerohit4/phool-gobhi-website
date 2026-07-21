import type { NextRequest } from 'next/server';
import { pickLocationHeaders, proxyGatewayGet } from '@/lib/gateway-client';

export async function GET(req: NextRequest) {
  return proxyGatewayGet(`/api/gyms${req.nextUrl.search}`, pickLocationHeaders(req));
}
