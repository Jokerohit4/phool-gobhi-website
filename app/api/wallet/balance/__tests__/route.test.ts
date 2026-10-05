import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyAuthedGet = vi.fn();
vi.mock('@/lib/session', () => ({
  proxyAuthedGet: (...args: unknown[]) => mockProxyAuthedGet(...args),
}));

import { GET } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/wallet/balance', () => {
  it('calls proxyAuthedGet with the correct gateway path', async () => {
    await GET();
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/wallet/balance');
  });

  it('returns the result from proxyAuthedGet', async () => {
    const fakeResponse = { balance: 5000 };
    mockProxyAuthedGet.mockResolvedValue(fakeResponse);

    const result = await GET();
    expect(result).toBe(fakeResponse);
  });
});
