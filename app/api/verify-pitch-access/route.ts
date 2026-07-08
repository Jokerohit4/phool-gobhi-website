import { NextRequest, NextResponse } from 'next/server';
import { isAllowedContact } from '@/lib/pitchAccessList';

interface VerifyRequestBody {
  contact?: unknown;
}

export async function POST(req: NextRequest) {
  let body: VerifyRequestBody;
  try {
    body = (await req.json()) as VerifyRequestBody;
  } catch {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }

  const contact = typeof body.contact === 'string' ? body.contact : '';
  const allowed = isAllowedContact(contact);

  return NextResponse.json({ allowed });
}
