import { NextResponse } from 'next/server';
import { authedGatewayFetch } from '@/lib/session';
import { GatewayError } from '@/lib/gateway-client';
import { rejectCrossOrigin } from '@/lib/csrf';

interface MeResponse {
  id: number;
}

// Reads go through the existing GET /api/auth/me (auth-service's getMe
// already returns name/dateOfBirth/gender/fitnessGoals) — this route only
// needs to handle the update, which lives on a different service endpoint
// (PUT /api/users/:id, auth-service/controllers/userProfileController.js).
export async function PATCH(req: Request) {
  const blocked = rejectCrossOrigin(req);
  if (blocked) return blocked;

  let body: { name?: unknown; dateOfBirth?: unknown; gender?: unknown; fitnessGoals?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const me = await authedGatewayFetch<MeResponse>('/api/auth/me');
    const updated = await authedGatewayFetch(`/api/users/${me.id}`, {
      method: 'PUT',
      body: {
        name: body.name,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        fitnessGoals: body.fitnessGoals,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof GatewayError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}
