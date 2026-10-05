import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyAuthedGet = vi.fn();
vi.mock('@/lib/session', () => ({
  proxyAuthedGet: (...args: unknown[]) => mockProxyAuthedGet(...args),
}));

import { GET } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/bookings/mine', () => {
  it('calls proxyAuthedGet with the correct gateway path', async () => {
    await GET();
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/bookings/mine');
  });

  it('returns the result from proxyAuthedGet', async () => {
    const fakeResponse = { bookings: [{ id: 'b1' }] };
    mockProxyAuthedGet.mockResolvedValue(fakeResponse);

    const result = await GET();
    expect(result).toBe(fakeResponse);
  });
});
