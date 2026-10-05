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

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/checkin/gym_1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeCtx(gymId = 'gym_1') {
  return { params: Promise.resolve({ gymId }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockAuthedGatewayFetch.mockResolvedValue({ status: 'checked-in' });
});

describe('POST /api/checkin/[gymId]', () => {
  it('calls gateway with lat/lng and returns 200', async () => {
    const res = await POST(makeRequest({ lat: 12.9, lng: 77.5 }), makeCtx());
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/bookings/gym/gym_1/self-checkin', {
      method: 'POST',
      body: { lat: 12.9, lng: 77.5, confirmEarly: false },
    });
  });

  it('coerces confirmEarly to boolean', async () => {
    await POST(makeRequest({ lat: 12.9, lng: 77.5, confirmEarly: 1 }), makeCtx());
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith(
      '/api/bookings/gym/gym_1/self-checkin',
      expect.objectContaining({ body: expect.objectContaining({ confirmEarly: true }) })
    );
  });

  it('returns 400 when lat is missing', async () => {
    const res = await POST(makeRequest({ lng: 77.5 }), makeCtx());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/lat and lng/i);
  });

  it('returns 400 when lng is missing', async () => {
    const res = await POST(makeRequest({ lat: 12.9 }), makeCtx());
    expect(res.status).toBe(400);
  });

  it('returns 400 when lat/lng are not numbers', async () => {
    const res = await POST(makeRequest({ lat: '12.9', lng: '77.5' }), makeCtx());
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost:3000/api/checkin/gym_1', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req, makeCtx());
    expect(res.status).toBe(400);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValue(
      new GatewayError(409, { error: 'Already checked in' })
    );
    const res = await POST(makeRequest({ lat: 12.9, lng: 77.5 }), makeCtx());
    expect(res.status).toBe(409);
  });

  it('returns 403 when CSRF check blocks', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await POST(makeRequest({ lat: 12.9, lng: 77.5 }), makeCtx());
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });
});
