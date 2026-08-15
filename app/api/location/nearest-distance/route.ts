import type { NextRequest } from 'next/server';
import { proxyGatewayGet } from '@/lib/gateway-client';

// Server-side "how far is the nearest gym" for a given lat/lng — unlike
// /api/gyms (which drops any gym beyond MAX_DISTANCE_KM), gym-service's
// /nearest-distance always returns the true nearest distance so
// lib/geolocation.ts can log it via location_resolved even for a visitor
// who'd see an empty gym list.
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat');
  const lng = req.nextUrl.searchParams.get('lng');
  if (!lat || !lng) {
    return Response.json({ error: 'lat and lng are required' }, { status: 400 });
  }
  return proxyGatewayGet('/api/gyms/nearest-distance', { 'x-user-lat': lat, 'x-user-lng': lng });
}
