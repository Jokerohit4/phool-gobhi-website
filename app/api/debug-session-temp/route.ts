import { NextResponse } from 'next/server';
import { writeSession } from '@/lib/session';

export async function POST() {
  await writeSession('debug-access-token', 'debug-refresh-token');
  return NextResponse.json({ ok: true });
}
