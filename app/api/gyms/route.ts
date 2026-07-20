import type { NextRequest } from 'next/server';
import { proxyGatewayGet } from '@/lib/gateway-client';

export async function GET(req: NextRequest) {
  return proxyGatewayGet(`/api/gyms${req.nextUrl.search}`);
}
