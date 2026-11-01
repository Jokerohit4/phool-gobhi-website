import { proxyAuthedGet } from '@/lib/session';
import { pageQuery } from '@/lib/pagination';

// Forwards ?limit=&cursor= to the gateway; the response (including
// `meta: { nextCursor, hasMore }`) is passed through untouched.
export async function GET(request?: Request) {
  return proxyAuthedGet(`/api/bookings/mine${pageQuery(request)}`);
}
