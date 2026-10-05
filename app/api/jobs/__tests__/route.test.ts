import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyGatewayGet = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  proxyGatewayGet: (...args: unknown[]) => mockProxyGatewayGet(...args),
}));

import { GET } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
  mockProxyGatewayGet.mockResolvedValue({ jobs: [] });
});

describe('GET /api/jobs', () => {
  it('proxies to /api/auth/jobs', async () => {
    const res = await GET();
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/auth/jobs');
    expect(res).toEqual({ jobs: [] });
  });
});
