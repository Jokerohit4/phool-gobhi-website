import { locationHolder } from './locationHolder';

// Silent, best-effort GPS grab — same contract as the apps' fetchAndStore():
// never throws, never surfaces an error, just no-ops if geolocation is
// unavailable, denied, or times out. Runs once at app boot from
// LocationBootstrap; nothing else calls this on demand.
export function fetchAndStoreLocation(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationHolder.update(position.coords.latitude, position.coords.longitude);
        resolve();
      },
      () => resolve(),
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
