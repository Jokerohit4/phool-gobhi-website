import { proxyGatewayGet } from '@/lib/gateway-client';

export async function GET() {
  return proxyGatewayGet('/api/auth/jobs');
}
