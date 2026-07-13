import { NextRequest, NextResponse } from 'next/server';

interface VerifyRequestBody {
  contact?: unknown;
}

const GATEWAY_URL = process.env.GATEWAY_URL;

export async function POST(req: NextRequest) {
  let body: VerifyRequestBody;
  try {
    body = (await req.json()) as VerifyRequestBody;
  } catch {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }

  const contact = typeof body.contact === 'string' ? body.contact : '';

  try {
    const res = await fetch(`${GATEWAY_URL}/api/auth/pitch-access/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact }),
    });
    const data = await res.json();
    return NextResponse.json({ allowed: !!data.allowed });
  } catch {
    // Backend unreachable — fail closed, same as a malformed request above.
    return NextResponse.json({ allowed: false }, { status: 502 });
  }
}
