'use client';

import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/appDeepLink';

/**
 * Store/install buttons for the printed-QR pages (`/join/[gymId]`,
 * `/checkin/[gymId]`).
 *
 * Three states, in priority order, so a scanned poster is never a dead end:
 *
 *  1. `launchHref` — a user-initiated hand-off to an *already installed* app.
 *     Rendered first because it's the shortest path for the people most likely
 *     to already have the app.
 *  2. A real store link, for whoever doesn't have it yet. Which store is shown
 *     depends on `platform`: showing a dead "Coming soon" for the Play listing
 *     on an iPhone (and vice versa) wastes the one chance to convert.
 *  3. A disabled placeholder for the store that hasn't shipped yet, so the UI
 *     doesn't imply a listing that doesn't exist.
 *
 * `attributionUri` is the gym-scoped deep link whose whole point is to survive
 * an app install (iOS has no free deferred-deep-link equivalent, so the URI is
 * parked in the clipboard and read back once on first launch — see
 * GymJoinAttributionService in the app). Only the App Store button needs it,
 * because the Play listing passes the same value via the Install Referrer.
 */
export default function AppStoreButtons({
  launchHref,
  attributionUri,
}: {
  launchHref: string | null;
  attributionUri?: string;
}) {
  const openAppStore = async () => {
    // Best-effort: a clipboard write can fail (permissions, non-secure
    // context) and must never block the store navigation that actually
    // converts. A silent failure just means the installer lands as an
    // unlinked marketplace customer.
    if (attributionUri) {
      try {
        await navigator.clipboard.writeText(attributionUri);
      } catch {
        /* ignore — see above */
      }
    }
    window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {launchHref ? (
        <a href={launchHref} className="btn-primary inline-block text-center">
          Open in the Phool Gobhi app
        </a>
      ) : null}

      {PLAY_STORE_URL ? (
        <a
          href={
            attributionUri
              ? `${PLAY_STORE_URL}${PLAY_STORE_URL.includes('?') ? '&' : '?'}referrer=${encodeURIComponent(attributionUri)}`
              : PLAY_STORE_URL
          }
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-block text-center"
        >
          Get it on Google Play
        </a>
      ) : (
        <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
          Get it on Google Play
        </span>
      )}

      {APP_STORE_URL ? (
        <button type="button" onClick={openAppStore} className="btn-secondary inline-block text-center">
          Download on the App Store
        </button>
      ) : (
        <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
          Download on the App Store
        </span>
      )}
    </div>
  );
}
