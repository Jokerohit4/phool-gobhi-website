import { locationHolder } from './locationHolder';
import { track } from './analytics';

type LocationOutcome = 'granted' | 'denied' | 'unsupported' | 'timeout' | 'error';

// Reports every outcome (not just 'granted') so the admin's Location Reach
// view can tell "visitor's nearest gym is 60km away" apart from "visitor
// never shared location" — both currently look like an empty gym list with
// no way to distinguish them. On success, also resolves the TRUE nearest-gym
// distance (no MAX_DISTANCE_KM cutoff) via a dedicated endpoint rather than
// the regular gym list, since a visitor outside that cutoff would otherwise
// show zero results and no distance at all.
async function reportLocationResolved(outcome: LocationOutcome, lat?: number, lng?: number) {
  const properties: Record<string, unknown> = { permission: outcome };
  if (lat != null && lng != null) {
    properties.lat = lat;
    properties.lng = lng;
    try {
      const res = await fetch(`/api/location/nearest-distance?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const body = await res.json();
        const nearestDistanceKm = body?.data?.nearestDistanceKm;
        const nearestGymId = body?.data?.nearestGymId;
        if (nearestDistanceKm != null) properties.nearest_gym_distance_km = nearestDistanceKm;
        if (nearestGymId != null) properties.nearest_gym_id = nearestGymId;
      }
    } catch {
      // best-effort — still report the permission outcome even if this fails
    }
  }
  track('location_resolved', properties);
}

// Silent, best-effort GPS grab — same contract as the apps' fetchAndStore():
// never throws, never surfaces an error, just no-ops if geolocation is
// unavailable, denied, or times out. Runs once at app boot from
// LocationBootstrap; nothing else calls this on demand.
export function fetchAndStoreLocation(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reportLocationResolved('unsupported');
      resolve();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        locationHolder.update(latitude, longitude);
        reportLocationResolved('granted', latitude, longitude);
        resolve();
      },
      (err) => {
        const outcome: LocationOutcome =
          err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'error';
        reportLocationResolved(outcome);
        resolve();
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
