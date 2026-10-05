import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyAuthedGet = vi.fn();

vi.mock('@/lib/session', () => ({
  proxyAuthedGet: (...args: unknown[]) => mockProxyAuthedGet(...args),
}));

import { GET } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
  mockProxyAuthedGet.mockResolvedValue({ warnings: [] });
});

describe('GET /api/attendance/warnings', () => {
  it('proxies to /api/bookings/mine/attendance-warnings', async () => {
    const res = await GET();
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/bookings/mine/attendance-warnings');
    expect(res).toEqual({ warnings: [] });
  });
});
