import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthedGatewayFetch = vi.fn();
const mockRejectCrossOrigin = vi.fn();

vi.mock('@/lib/session', () => ({
  authedGatewayFetch: (...args: unknown[]) => mockAuthedGatewayFetch(...args),
}));

vi.mock('@/lib/csrf', () => ({
  rejectCrossOrigin: (...args: unknown[]) => mockRejectCrossOrigin(...args),
}));

vi.mock('@/lib/gateway-client', () => ({
  GatewayError: class GatewayError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
      super(String(body));
      this.status = status;
      this.body = body;
    }
  },
}));

import { POST } from '../route';

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockAuthedGatewayFetch.mockResolvedValue({ data: { id: 'bk_1' } });
});

describe('POST /api/bookings', () => {
  it('returns 201 with valid plain-slot body', async () => {
    const res = await POST(
      makeRequest({ gymId: 'g1', date: '2026-09-20', startTime: '10:00', endTime: '11:00' })
    );
    expect(res.status).toBe(201);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'POST',
      body: { gymId: 'g1', date: '2026-09-20', startTime: '10:00', endTime: '11:00' },
    });
  });

  it('returns 201 with valid class booking body', async () => {
    const res = await POST(
      makeRequest({ gymId: 'g1', date: '2026-09-20', classId: 42 })
    );
    expect(res.status).toBe(201);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'POST',
      body: { gymId: 'g1', date: '2026-09-20', classId: 42 },
    });
  });

  it('returns 400 when gymId is missing', async () => {
    const res = await POST(
      makeRequest({ date: '2026-09-20', startTime: '10:00', endTime: '11:00' })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/gymId/i);
  });

  it('returns 400 when date is missing', async () => {
    const res = await POST(
      makeRequest({ gymId: 'g1', startTime: '10:00', endTime: '11:00' })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/gymId and date/i);
  });

  it('returns 400 when classId is not a number', async () => {
    const res = await POST(
      makeRequest({ gymId: 'g1', date: '2026-09-20', classId: 'abc' })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/classId must be a number/i);
  });

  it('returns 400 when neither startTime/endTime nor classId provided', async () => {
    const res = await POST(
      makeRequest({ gymId: 'g1', date: '2026-09-20' })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/startTime and endTime/i);
  });

  it('returns gateway error status on gateway failure', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(409, { error: 'Slot unavailable' })
    );
    const res = await POST(
      makeRequest({ gymId: 'g1', date: '2026-09-20', startTime: '10:00', endTime: '11:00' })
    );
    expect(res.status).toBe(409);
  });

  it('returns 403 when CSRF check blocks the request', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await POST(
      makeRequest({}, { origin: 'https://evil.com' })
    );
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });
});
