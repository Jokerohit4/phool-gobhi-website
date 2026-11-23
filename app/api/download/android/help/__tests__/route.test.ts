import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GatewayError, gatewayFetch } from '@/lib/gateway-client';
import { POST } from '../route';

vi.mock('@/lib/gateway-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/gateway-client')>()),
  gatewayFetch: vi.fn(),
}));

const gateway = vi.mocked(gatewayFetch);
const email = 'player@example.com';
const phone = '+91 98765 43210';

function submit(body: unknown) {
  return POST(new Request('http://localhost/api/download/android/help', {
    method: 'POST',
    body: JSON.stringify(body),
  }));
}

beforeEach(() => {
  gateway.mockReset();
  gateway.mockResolvedValue({ data: { email, message: phone } });
});

describe('Android download help', () => {
  it('routes both details to the admin contact inbox without echoing them', async () => {
    const response = await submit({ email: ` ${email} `, phone, name: 'Ignored' });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ sent: true });
    expect(gateway).toHaveBeenCalledWith('/api/auth/contact', {
      method: 'POST',
      body: { name: 'Android download help', email, message: `Contact number: ${phone}` },
    });
  });

  it.each([null, { email: 'invalid', phone }, { email }, { email, phone: 'abcd 9876543210' }, { email, phone: '123' }])(
    'rejects invalid submission %j', async (body) => {
      expect((await submit(body)).status).toBe(400);
      expect(gateway).not.toHaveBeenCalled();
    },
  );

  it('reports gateway failures without exposing the upstream response', async () => {
    gateway.mockRejectedValueOnce(new GatewayError(500, { error: phone }));
    const response = await submit({ email, phone });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'Could not submit your request.' });
  });

  it('passes through the gateway rate limit status', async () => {
    gateway.mockRejectedValueOnce(new GatewayError(429, null));
    expect((await submit({ email, phone })).status).toBe(429);
  });
});
