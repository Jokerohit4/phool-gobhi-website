import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyAuthedGet = vi.fn();

vi.mock('@/lib/session', () => ({
  proxyAuthedGet: (...args: unknown[]) => mockProxyAuthedGet(...args),
}));

import { GET } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
  mockProxyAuthedGet.mockResolvedValue({ total: 10 });
});

describe('GET /api/attendance/summary', () => {
  it('proxies to /api/bookings/mine/attendance-summary', async () => {
    const res = await GET();
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/bookings/mine/attendance-summary');
    expect(res).toEqual({ total: 10 });
  });
});
