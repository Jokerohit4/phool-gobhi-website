import { proxyGatewayGet } from '@/lib/gateway-client';

// Public — serves the backend's /app-config (feature flags, maintenance
// windows, app versions) verbatim. Consumed by the MaintenanceBanner on every
// page and by nothing authed; mirrors the otp-config passthrough pattern.
export async function GET() {
  return proxyGatewayGet('/api/auth/app-config');
}
