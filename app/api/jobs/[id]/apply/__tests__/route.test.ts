import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGatewayFetch = vi.fn();

vi.mock('@/lib/gateway-client', () => ({
  gatewayFetch: (...args: unknown[]) => mockGatewayFetch(...args),
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

function makeFormRequest(fields: Record<string, string | File>) {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    form.set(k, v);
  }
  return new Request('http://localhost:3000/api/jobs/job_1/apply', {
    method: 'POST',
    body: form,
  });
}

function makeCtx(id = 'job_1') {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGatewayFetch.mockResolvedValue({ applied: true });
});

describe('POST /api/jobs/[id]/apply', () => {
  it('calls gateway with form data and returns 201', async () => {
    const res = await POST(
      makeFormRequest({ name: 'Test', email: 'a@b.com', phone: '123', message: 'Hello' }),
      makeCtx()
    );
    expect(res.status).toBe(201);
    expect(mockGatewayFetch).toHaveBeenCalledWith('/api/auth/jobs/job_1/apply', {
      method: 'POST',
      body: expect.any(FormData),
    });
  });

  it('forwards optional fields when present', async () => {
    const form = new FormData();
    form.set('name', 'Test');
    form.set('email', 'a@b.com');
    form.set('phone', '123');
    form.set('message', 'Hello');
    form.set('portfolioUrl', 'https://portfolio.com');
    form.set('linkedinUrl', 'https://linkedin.com/in/test');
    await POST(new Request('http://localhost:3000/api/jobs/job_1/apply', { method: 'POST', body: form }), makeCtx());
    const sentForm = mockGatewayFetch.mock.calls[0][1].body as FormData;
    expect(sentForm.get('portfolioUrl')).toBe('https://portfolio.com');
    expect(sentForm.get('linkedinUrl')).toBe('https://linkedin.com/in/test');
  });

  it('returns 400 when name is missing', async () => {
    const res = await POST(
      makeFormRequest({ email: 'a@b.com', phone: '123', message: 'Hello' }),
      makeCtx()
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/name, email, phone and message/i);
  });

  it('returns 400 when phone is missing', async () => {
    const res = await POST(
      makeFormRequest({ name: 'Test', email: 'a@b.com', message: 'Hello' }),
      makeCtx()
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid form data', async () => {
    const req = new Request('http://localhost:3000/api/jobs/job_1/apply', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=---' },
      body: 'not a form',
    });
    const res = await POST(req, makeCtx());
    expect(res.status).toBe(400);
    expect(mockGatewayFetch).not.toHaveBeenCalled();
  });

  it('returns gateway error status on GatewayError', async () => {
    const { GatewayError } = await import('@/lib/gateway-client');
    mockGatewayFetch.mockRejectedValue(
      new GatewayError(400, { error: 'Applications closed' })
    );
    const res = await POST(
      makeFormRequest({ name: 'Test', email: 'a@b.com', phone: '123', message: 'Hello' }),
      makeCtx()
    );
    expect(res.status).toBe(400);
  });
});
