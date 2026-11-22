import { gatewayFetch, GatewayError } from '@/lib/gateway-client';

// Public, unauthenticated write — same no-CSRF-surface reasoning as
// app/api/contact/route.ts (no cookie/session involved, nothing to forge
// someone else's identity into). Rate-limited at the gateway.
// multipart/form-data (not JSON) because the form carries an optional resume
// file — parsed here with req.formData() and re-packed into a fresh FormData
// so gatewayFetch can forward it with its own multipart boundary.
// Upper bounds mirror auth-service's own limits (resume 10 MB) with headroom;
// anything larger is a 400 here instead of being streamed to the gateway.
const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const JOB_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!JOB_ID_RE.test(id)) {
    return Response.json({ error: 'Invalid job id' }, { status: 400 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const name = form.get('name');
  const email = form.get('email');
  const phone = form.get('phone');
  const message = form.get('message');
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof phone !== 'string' ||
    typeof message !== 'string'
  ) {
    return Response.json({ error: 'Name, email, phone and message are required' }, { status: 400 });
  }

  if (
    name.length > 200 ||
    email.length > 254 ||
    phone.length > 30 ||
    message.length > 5000
  ) {
    return Response.json({ error: 'One or more fields are too long' }, { status: 400 });
  }

  const gatewayForm = new FormData();
  gatewayForm.set('name', name);
  gatewayForm.set('email', email);
  gatewayForm.set('phone', phone);
  gatewayForm.set('message', message);
  // Optional — only forwarded if the visitor filled them in.
  const portfolioUrl = form.get('portfolioUrl');
  if (typeof portfolioUrl === 'string' && portfolioUrl.length > 500) {
    return Response.json({ error: 'portfolioUrl is too long' }, { status: 400 });
  }
  if (typeof portfolioUrl === 'string' && portfolioUrl.trim()) gatewayForm.set('portfolioUrl', portfolioUrl);
  const linkedinUrl = form.get('linkedinUrl');
  if (typeof linkedinUrl === 'string' && linkedinUrl.length > 500) {
    return Response.json({ error: 'linkedinUrl is too long' }, { status: 400 });
  }
  if (typeof linkedinUrl === 'string' && linkedinUrl.trim()) gatewayForm.set('linkedinUrl', linkedinUrl);

  const resume = form.get('resume');
  if (resume instanceof File && resume.size > MAX_RESUME_SIZE) {
    return Response.json({ error: 'Resume must be 10 MB or smaller' }, { status: 400 });
  }
  if (resume instanceof File && resume.size > 0) {
    gatewayForm.set('resume', resume, resume.name);
  }

  try {
    const data = await gatewayFetch(`/api/auth/jobs/${encodeURIComponent(id)}/apply`, {
      method: 'POST',
      body: gatewayForm,
    });
    return Response.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof GatewayError) return Response.json(err.body, { status: err.status });
    return Response.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
