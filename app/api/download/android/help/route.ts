import { GatewayError, gatewayFetch } from '@/lib/gateway-client';

export async function POST(request: Request) {
  let body: { email?: unknown; phone?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Enter a valid Google Play email address.' }, { status: 400 });
  }

  if (phone.length > 32 || !/^\+?[\d(). -]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) {
    return Response.json({ error: 'Enter a valid contact number, including the country code if needed.' }, { status: 400 });
  }

  try {
    await gatewayFetch('/api/auth/contact', {
      method: 'POST',
      body: { name: 'Android download help', email, message: `Contact number: ${phone}` },
    });
    return Response.json({ sent: true }, { status: 201 });
  } catch (error) {
    if (error instanceof GatewayError && error.status === 429) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    return Response.json({ error: 'Could not submit your request.' }, { status: 502 });
  }
}
