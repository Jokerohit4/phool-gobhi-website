import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProxyAuthedGet = vi.fn();

vi.mock('@/lib/session', () => ({
  proxyAuthedGet: (...args: unknown[]) => mockProxyAuthedGet(...args),
}));

import { GET } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
  mockProxyAuthedGet.mockResolvedValue({ conversations: [] });
});

describe('GET /api/fitness-assistant/conversations', () => {
  it('proxies to /api/health/assistant/conversations', async () => {
    const res = await GET();
    expect(mockProxyAuthedGet).toHaveBeenCalledWith('/api/health/assistant/conversations');
    expect(res).toEqual({ conversations: [] });
  });
});
