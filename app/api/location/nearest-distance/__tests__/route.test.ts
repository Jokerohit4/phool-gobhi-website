import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockProxyGatewayGet = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  proxyGatewayGet: (...args: unknown[]) => mockProxyGatewayGet(...args),
}));

import { GET } from '../route';

function makeNextRequest(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return new NextRequest(`http://localhost:3000/api/location/nearest-distance?${qs}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockProxyGatewayGet.mockResolvedValue({ distance: 1.2 });
});

describe('GET /api/location/nearest-distance', () => {
  it('calls proxyGatewayGet with location headers', async () => {
    const res = await GET(makeNextRequest({ lat: '12.9', lng: '77.5' }));
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/nearest-distance', {
      'x-user-lat': '12.9',
      'x-user-lng': '77.5',
    });
    expect(res).toEqual({ distance: 1.2 });
  });

  it('returns 400 when lat is missing', async () => {
    const res = await GET(makeNextRequest({ lng: '77.5' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/lat and lng/i);
  });

  it('returns 400 when lng is missing', async () => {
    const res = await GET(makeNextRequest({ lat: '12.9' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when both are missing', async () => {
    const res = await GET(makeNextRequest({}));
    expect(res.status).toBe(400);
  });
});
