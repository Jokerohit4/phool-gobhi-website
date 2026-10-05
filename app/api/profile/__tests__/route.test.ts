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

import { PATCH } from '../route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/profile', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRejectCrossOrigin.mockReturnValue(null);
  mockAuthedGatewayFetch.mockImplementation(async (path: string) => {
    if (path === '/api/auth/me') return { id: 42 };
    return { updated: true };
  });
});

describe('PATCH /api/profile', () => {
  it('fetches user id then updates profile', async () => {
    const res = await PATCH(makeRequest({ name: 'Rohit' }));
    expect(res.status).toBe(200);
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/auth/me');
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/users/42', {
      method: 'PUT',
      body: { name: 'Rohit', dateOfBirth: undefined, gender: undefined, fitnessGoals: undefined },
    });
  });

  it('forwards all fields', async () => {
    const body = {
      name: 'Test',
      dateOfBirth: '1995-01-01',
      gender: 'male',
      fitnessGoals: ['strength'],
    };
    await PATCH(makeRequest(body));
    expect(mockAuthedGatewayFetch).toHaveBeenCalledWith('/api/users/42', {
      method: 'PUT',
      body,
    });
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost:3000/api/profile', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on first call failure', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch.mockRejectedValueOnce(
      new GatewayError(401, { error: 'Not authenticated' })
    );
    const res = await PATCH(makeRequest({ name: 'Test' }));
    expect(res.status).toBe(401);
  });

  it('returns gateway error status on second call failure', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockAuthedGatewayFetch
      .mockResolvedValueOnce({ id: 42 })
      .mockRejectedValueOnce(
        new GatewayError(400, { error: 'Invalid data' })
      );
    const res = await PATCH(makeRequest({ name: 'Test' }));
    expect(res.status).toBe(400);
  });

  it('returns 403 when CSRF check blocks', async () => {
    const { NextResponse } = await import('next/server');
    mockRejectCrossOrigin.mockReturnValue(
      NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
    );
    const res = await PATCH(makeRequest({ name: 'Test' }));
    expect(res.status).toBe(403);
    expect(mockAuthedGatewayFetch).not.toHaveBeenCalled();
  });
});
