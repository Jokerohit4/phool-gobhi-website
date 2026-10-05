import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const mockProxyGatewayGet = vi.fn();
const mockPickLocationHeaders = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  proxyGatewayGet: (...args: unknown[]) => mockProxyGatewayGet(...args),
  pickLocationHeaders: (...args: unknown[]) => mockPickLocationHeaders(...args),
}));

import { GET as getGyms } from '../route';
import { GET as getGymById } from '../[id]/route';
import { GET as getSlots } from '../[id]/slots/route';
import { GET as getAvailability } from '../[id]/availability/route';
import { GET as getReviews } from '../[id]/reviews/route';
import { GET as getSubscriptionPlans } from '../[id]/subscription-plans/route';
import { GET as getClasses } from '../[id]/classes/route';
import { GET as getOccurrences } from '../[id]/classes/[classId]/occurrences/route';

function makeReq(url: string, search = '') {
  return {
    nextUrl: { search },
    headers: new Headers(),
  } as unknown as NextRequest;
}

function makeCtx<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPickLocationHeaders.mockReturnValue({});
});

describe('GET /api/gyms', () => {
  it('forwards to gateway with correct path', async () => {
    await getGyms(makeReq('http://localhost:3000/api/gyms'));
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms', {});
  });

  it('appends query params', async () => {
    await getGyms(makeReq('http://localhost:3000/api/gyms', '?date=2026-09-20'));
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms?date=2026-09-20', {});
  });

  it('calls pickLocationHeaders', async () => {
    const req = makeReq('http://localhost:3000/api/gyms');
    await getGyms(req);
    expect(mockPickLocationHeaders).toHaveBeenCalledWith(req);
  });
});

describe('GET /api/gyms/[id]', () => {
  it('forwards to gateway with gym id', async () => {
    await getGymById(makeReq('http://localhost:3000/api/gyms/g1'), makeCtx({ id: 'g1' }));
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1', {});
  });

  it('appends query params', async () => {
    await getGymById(
      makeReq('http://localhost:3000/api/gyms/g1', '?include=reviews'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1?include=reviews', {});
  });

  it('calls pickLocationHeaders', async () => {
    const req = makeReq('http://localhost:3000/api/gyms/g1');
    await getGymById(req, makeCtx({ id: 'g1' }));
    expect(mockPickLocationHeaders).toHaveBeenCalledWith(req);
  });
});

describe('GET /api/gyms/[id]/slots', () => {
  it('forwards to gateway with correct path', async () => {
    await getSlots(makeReq('http://localhost:3000/api/gyms/g1/slots'), makeCtx({ id: 'g1' }));
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/slots');
  });

  it('appends query params', async () => {
    await getSlots(
      makeReq('http://localhost:3000/api/gyms/g1/slots', '?date=2026-09-20'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/slots?date=2026-09-20');
  });

  it('does not call pickLocationHeaders', async () => {
    await getSlots(makeReq('http://localhost:3000/api/gyms/g1/slots'), makeCtx({ id: 'g1' }));
    expect(mockPickLocationHeaders).not.toHaveBeenCalled();
  });
});

describe('GET /api/gyms/[id]/availability', () => {
  it('forwards to gateway with correct path', async () => {
    await getAvailability(
      makeReq('http://localhost:3000/api/gyms/g1/availability'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/availability');
  });

  it('appends query params', async () => {
    await getAvailability(
      makeReq('http://localhost:3000/api/gyms/g1/availability', '?date=2026-09-20'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/availability?date=2026-09-20');
  });

  it('does not call pickLocationHeaders', async () => {
    await getAvailability(
      makeReq('http://localhost:3000/api/gyms/g1/availability'),
      makeCtx({ id: 'g1' })
    );
    expect(mockPickLocationHeaders).not.toHaveBeenCalled();
  });
});

describe('GET /api/gyms/[id]/reviews', () => {
  it('forwards to gateway with correct path', async () => {
    await getReviews(
      makeReq('http://localhost:3000/api/gyms/g1/reviews'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/reviews');
  });

  it('appends query params', async () => {
    await getReviews(
      makeReq('http://localhost:3000/api/gyms/g1/reviews', '?limit=10'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/reviews?limit=10');
  });

  it('does not call pickLocationHeaders', async () => {
    await getReviews(
      makeReq('http://localhost:3000/api/gyms/g1/reviews'),
      makeCtx({ id: 'g1' })
    );
    expect(mockPickLocationHeaders).not.toHaveBeenCalled();
  });
});

describe('GET /api/gyms/[id]/subscription-plans', () => {
  it('forwards to gateway with correct path', async () => {
    await getSubscriptionPlans(
      makeReq('http://localhost:3000/api/gyms/g1/subscription-plans'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/subscription-plans');
  });

  it('appends query params', async () => {
    await getSubscriptionPlans(
      makeReq('http://localhost:3000/api/gyms/g1/subscription-plans', '?active=true'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith(
      '/api/gyms/g1/subscription-plans?active=true'
    );
  });

  it('does not call pickLocationHeaders', async () => {
    await getSubscriptionPlans(
      makeReq('http://localhost:3000/api/gyms/g1/subscription-plans'),
      makeCtx({ id: 'g1' })
    );
    expect(mockPickLocationHeaders).not.toHaveBeenCalled();
  });
});

describe('GET /api/gyms/[id]/classes', () => {
  it('forwards to gateway with correct path', async () => {
    await getClasses(
      makeReq('http://localhost:3000/api/gyms/g1/classes'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/classes');
  });

  it('appends query params', async () => {
    await getClasses(
      makeReq('http://localhost:3000/api/gyms/g1/classes', '?day=monday'),
      makeCtx({ id: 'g1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/classes?day=monday');
  });

  it('does not call pickLocationHeaders', async () => {
    await getClasses(
      makeReq('http://localhost:3000/api/gyms/g1/classes'),
      makeCtx({ id: 'g1' })
    );
    expect(mockPickLocationHeaders).not.toHaveBeenCalled();
  });
});

describe('GET /api/gyms/[id]/classes/[classId]/occurrences', () => {
  it('forwards to gateway with correct path', async () => {
    await getOccurrences(
      makeReq('http://localhost:3000/api/gyms/g1/classes/c1/occurrences'),
      makeCtx({ id: 'g1', classId: 'c1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith('/api/gyms/g1/classes/c1/occurrences');
  });

  it('appends query params', async () => {
    await getOccurrences(
      makeReq(
        'http://localhost:3000/api/gyms/g1/classes/c1/occurrences',
        '?from=2026-09-20&to=2026-09-27'
      ),
      makeCtx({ id: 'g1', classId: 'c1' })
    );
    expect(mockProxyGatewayGet).toHaveBeenCalledWith(
      '/api/gyms/g1/classes/c1/occurrences?from=2026-09-20&to=2026-09-27'
    );
  });

  it('does not call pickLocationHeaders', async () => {
    await getOccurrences(
      makeReq('http://localhost:3000/api/gyms/g1/classes/c1/occurrences'),
      makeCtx({ id: 'g1', classId: 'c1' })
    );
    expect(mockPickLocationHeaders).not.toHaveBeenCalled();
  });
});
