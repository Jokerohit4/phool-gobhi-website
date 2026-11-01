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

  it('forwards limit and cursor to the gateway', async () => {
    await GET(new Request('http://localhost/api/bookings/mine?limit=50&cursor=90'));
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/bookings/mine?limit=50&cursor=90');
  });

  it('drops non-numeric and unknown params', async () => {
    await GET(new Request('http://localhost/api/bookings/mine?limit=abc&cursor=1%26x%3D2&evil=1'));
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/bookings/mine');
  });

  it('returns the result from proxyAuthedGet', async () => {
    const fakeResponse = { bookings: [{ id: 'b1' }] };
    mockProxyAuthedGet.mockResolvedValue(fakeResponse);

    const result = await GET();
    expect(result).toBe(fakeResponse);
  });
});
