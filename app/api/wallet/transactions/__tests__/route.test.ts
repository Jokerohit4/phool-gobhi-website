import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockJson = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: (...args: unknown[]) => mockJson(...args),
  },
}));

const mockAuthedGatewayFetch = vi.fn();
vi.mock('@/lib/session', () => ({
  authedGatewayFetch: (...args: unknown[]) => mockAuthedGatewayFetch(...args),
}));

import { GET } from '../route';
import { GatewayError } from '@/lib/gateway-client';

beforeEach(() => {
  vi.clearAllMocks();
  mockJson.mockReturnValue({ json: true });
});

describe('GET /api/wallet/transactions', () => {
  it('fetches user id then transactions', async () => {
    mockAuthedGatewayFetch
      .mockResolvedValueOnce({ id: 42 })
      .mockResolvedValueOnce({ transactions: [{ id: 't1' }] });

    await GET();

    expect(mockAuthedGatewayFetch).toHaveBeenCalledTimes(2);
    expect(mockAuthedGatewayFetch).toHaveBeenNthCalledWith(1, '/api/auth/me');
    expect(mockAuthedGatewayFetch).toHaveBeenNthCalledWith(2, '/api/wallet/42/transactions');
  });

  it('returns 200 with transaction data on success', async () => {
    const txData = { transactions: [{ id: 't1', amount: 500 }] };
    mockAuthedGatewayFetch
      .mockResolvedValueOnce({ id: 42 })
      .mockResolvedValueOnce(txData);

    await GET();
    expect(mockJson).toHaveBeenCalledWith(txData);
  });

  it('returns GatewayError status when /auth/me fails', async () => {
    mockAuthedGatewayFetch.mockRejectedValueOnce(new GatewayError(401, { error: 'Not authenticated' }));

    await GET();
    expect(mockJson).toHaveBeenCalledWith({ error: 'Not authenticated' }, { status: 401 });
  });

  it('returns GatewayError status when transactions call fails', async () => {
    mockAuthedGatewayFetch
      .mockResolvedValueOnce({ id: 42 })
      .mockRejectedValueOnce(new GatewayError(403, { error: 'Forbidden' }));

    await GET();
    expect(mockJson).toHaveBeenCalledWith({ error: 'Forbidden' }, { status: 403 });
  });

  it('returns 502 on non-GatewayError from /auth/me', async () => {
    mockAuthedGatewayFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await GET();
    expect(mockJson).toHaveBeenCalledWith({ error: 'Gateway unreachable' }, { status: 502 });
  });

  it('returns 502 on non-GatewayError from transactions call', async () => {
    mockAuthedGatewayFetch
      .mockResolvedValueOnce({ id: 42 })
      .mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await GET();
    expect(mockJson).toHaveBeenCalledWith({ error: 'Gateway unreachable' }, { status: 502 });
  });
});
