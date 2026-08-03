import { proxyGatewayGet } from '@/lib/gateway-client';

// Public — tells OtpForm/PartnerSignupForm which OTP mechanism is currently
// active (fast2sms / firebase / skip), admin-configurable via the backend's
// /api/auth/otp-config/admin (see phool-gobhi-admin's Settings page).
export async function GET() {
  return proxyGatewayGet('/api/auth/otp-config');
}
