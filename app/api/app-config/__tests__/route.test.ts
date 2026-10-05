import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyGatewayGet = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  proxyGatewayGet: (...args: unknown[]) => mockProxyGatewayGet(...args),
}));

import { GET } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
  mockProxyGatewayGet.mockResolvedValue({ features: {} });
});

describe('GET /api/app-config', () => {
  it('proxies to /api/auth/app-config', async () => {
    const res = await GET();
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/auth/app-config');
    expect(res).toEqual({ features: {} });
  });
});
