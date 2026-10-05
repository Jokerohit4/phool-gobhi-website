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

const mockRejectCrossOrigin = vi.fn();
vi.mock('@/lib/csrf', () => ({
  rejectCrossOrigin: (...args: unknown[]) => mockRejectCrossOrigin(...args),
}));

import { POST } from '../route';
import { GatewayError } from '@/lib/gateway-client';

function makeRequest(body?: unknown) {
  return {
    json: body !== undefined ? () => Promise.resolve(body) : () => Promise.reject(new Error('no body')),
    headers: new Headers(),
  } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockJson.mockReturnValue({ json: true });
});

const ctx = { params: Promise.resolve({ id: 'bk_abc' }) };

describe('POST /api/bookings/[id]/cancel', () => {
  it('returns 403 on cross-origin', async () => {
    const blocked = { error: 'blocked', status: 403 } as unknown as import('next/server').NextResponse;
    mockRejectCrossOrigin.mockReturnValue(blocked);

    const result = await POST(makeRequest(), ctx);
    expect(result).toBe(blocked);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('cancels with both feedback fields', async () => {
    const body = { cancellationReason: 'injury', nextVisitIntent: 'this_week' };
    mockAuthedGatewayFetch.mockResolvedValue({ success: true });

    await POST(makeRequest(body), ctx);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/bookings/bk_abc/cancel', {
      method: 'PUT',
      body: { cancellationReason: 'injury', nextVisitIntent: 'this_week' },
    });
  });

  it('cancels with only reason', async () => {
    const body = { cancellationReason: 'work' };
    mockAuthedGatewayFetch.mockResolvedValue({ success: true });

    await POST(makeRequest(body), ctx);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/bookings/bk_abc/cancel', {
      method: 'PUT',
      body: { cancellationReason: 'work' },
    });
  });

  it('cancels with empty body (older clients)', async () => {
    mockAuthedGatewayFetch.mockResolvedValue({ success: true });

    await POST(makeRequest({}), ctx);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/bookings/bk_abc/cancel', {
      method: 'PUT',
      body: {},
    });
  });

  it('drops invalid reasons silently', async () => {
    const body = { cancellationReason: 'not_valid', nextVisitIntent: 'today' };
    mockAuthedGatewayFetch.mockResolvedValue({ success: true });

    await POST(makeRequest(body), ctx);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/bookings/bk_abc/cancel', {
      method: 'PUT',
      body: { nextVisitIntent: 'today' },
    });
  });

  it('drops invalid nextVisitIntent silently', async () => {
    const body = { cancellationReason: 'travel', nextVisitIntent: 'next_year' };
    mockAuthedGatewayFetch.mockResolvedValue({ success: true });

    await POST(makeRequest(body), ctx);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/bookings/bk_abc/cancel', {
      method: 'PUT',
      body: { cancellationReason: 'travel' },
    });
  });

  it('returns NextResponse.json with data on success', async () => {
    const data = { refund: 200 };
    mockAuthedGatewayFetch.mockResolvedValue(data);

    await POST(makeRequest({}), ctx);
    expect(mockJson).toHaveBeenCalledWith(data);
  });

  it('returns GatewayError status on GatewayError', async () => {
    mockAuthedGatewayFetch.mockRejectedValue(new GatewayError(404, { error: 'Not found' }));

    await POST(makeRequest({}), ctx);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Not found' }, { status: 404 });
  });

  it('returns 502 on non-GatewayError', async () => {
    mockAuthedGatewayFetch.mockRejectedValue(new Error('network'));

    await POST(makeRequest({}), ctx);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Gateway unreachable' }, { status: 502 });
  });
});
