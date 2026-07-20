import { proxyAuthedGet } from '@/lib/session';

export async function GET() {
  return proxyAuthedGet('/api/bookings/mine');
}
