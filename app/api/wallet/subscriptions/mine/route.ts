import type { NextRequest } from 'next/server';
import { proxyAuthedGet } from '@/lib/session';

export async function GET(req: NextRequest) {
  return proxyAuthedGet(`/api/wallet/subscriptions/mine${req.nextUrl.search}`);
}
