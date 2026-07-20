import { proxyAuthedGet } from '@/lib/session';

export async function GET() {
  return proxyAuthedGet('/api/wallet/balance');
}
