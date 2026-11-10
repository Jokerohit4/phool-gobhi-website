import { describe, it, expect, vi, beforeEach } from 'vitest';

const { gateway, csrf } = vi.hoisted(() => ({ gateway: vi.fn(), csrf: vi.fn() }));
vi.mock('@/lib/session', () => ({ authedGatewayFetch: gateway }));
vi.mock('@/lib/csrf', () => ({ rejectCrossOrigin: csrf }));
import { GatewayError } from '@/lib/gateway-client';
import { POST } from '../route';

const ctx = (gymId = '2') => ({ params: Promise.resolve({ gymId }) });
const request = () => new Request('https://dev.phoolgobhi.com/api/checkin/2/membership', {
  method: 'POST', body: JSON.stringify({ userId: 999, approved: true, gymId: 999 }),
});

beforeEach(() => {
  vi.clearAllMocks();
  csrf.mockReturnValue(null);
  gateway.mockResolvedValue({ link: { gymId: 2, status: 'pending' } });
});

describe('entrance membership request', () => {
  it('uses the session and URL gym rather than accepting claimed identity or approval', async () => {
    const res = await POST(request(), ctx());
    expect(res.status).toBe(200);
    expect(gateway).toHaveBeenCalledWith('/api/auth/gym-links/entrance-request', {
      method: 'POST', body: { gymId: 2 },
    });
    expect((await res.json()).link.status).toBe('pending');
  });

  it('rejects cross-origin requests before writing', async () => {
    csrf.mockReturnValue(new Response('Forbidden', { status: 403 }));
    expect((await POST(request(), ctx())).status).toBe(403);
    expect(gateway).not.toHaveBeenCalled();
  });

  it('rejects invalid gym IDs before writing', async () => {
    for (const id of ['0', '-2', '2abc']) expect((await POST(request(), ctx(id))).status).toBe(400);
    expect(gateway).not.toHaveBeenCalled();
  });

  it('preserves authentication and membership errors from the backend', async () => {
    gateway.mockRejectedValue(new GatewayError(409, { code: 'ALREADY_LINKED', error: 'Leave your current gym first' }));
    const res = await POST(request(), ctx());
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('ALREADY_LINKED');
  });

  it('reports service outages without claiming the request succeeded', async () => {
    gateway.mockRejectedValue(new Error('unavailable'));
    expect((await POST(request(), ctx())).status).toBe(502);
  });
});
