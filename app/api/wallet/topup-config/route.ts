import { proxyAuthedGet } from '@/lib/session';

// Authenticated (not public) — wallet top-up only ever happens post-login,
// so this rides the same authed-with-refresh path as /api/wallet/balance,
// not the pre-login public otp-config/app-config convention.
export async function GET() {
  return proxyAuthedGet('/api/wallet/topup-config');
}
