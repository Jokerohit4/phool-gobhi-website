import type { NextRequest } from 'next/server';
import { proxyGatewayGet } from '@/lib/gateway-client';

// Public passthrough for the gateway's /content/loader-facts. The browser asks
// for one 10-fact batch at a time (offset/limit/audience), so no full corpus
// ever reaches the client.
export async function GET(req: NextRequest) {
  const incoming = req.nextUrl.searchParams;
  const query = new URLSearchParams();
  for (const key of ['offset', 'limit', 'audience']) {
    const value = incoming.get(key);
    if (value !== null) query.set(key, value);
  }

  const suffix = query.toString();
  const res = await proxyGatewayGet(`/content/loader-facts${suffix ? `?${suffix}` : ''}`);
  res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  return res;
}
