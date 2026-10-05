'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OtpForm from '@/components/auth/OtpForm';
import { useSession } from '@/components/auth/SessionProvider';
import { buildAppLaunchHref, getBrowserEscapeLink, subscribeNoop } from '@/lib/appDeepLink';
import AppStoreButtons from '@/components/AppStoreButtons';
import type { Gym } from '@/lib/types';

// The URL printed on a gym's "join us on Phool Gobhi" poster — the
// attendance-SaaS wedge's entry point for a gym's existing members.
//
// This page is the poster's primary destination, not a fallback: the website
// already has the full OTP signup + gym-subscription-purchase flow, so there
// is no reason to gate registration behind an app install. The native app is
// offered as progressive enhancement from an explicit tap via
// `buildAppLaunchHref`; see lib/appDeepLink.ts for why auto-launching on mount
// turned this poster into a dead end for anyone without the app installed.
export default function JoinGymPage() {
  const params = useParams<{ gymId: string }>();
  const gymId = params.gymId;
  const numericGymId = Number(gymId);
  const appLink = `phoolgobhi://join?gymId=${encodeURIComponent(gymId)}`;
  const { user, loading: sessionLoading } = useSession();

  const [gym, setGym] = useState<Gym | null>(null);

  // Render-time, not effect-time: the href must belong to a tap the user
  // actually made. platform and location are both stable by first paint here.
  const appLaunchHref = buildAppLaunchHref(`join?gymId=${encodeURIComponent(gymId)}`);

  // useSyncExternalStore rather than setState-in-an-effect: the embedded-
  // browser test is a pure read of a value that can never change during the
  // page's life, and the server snapshot (null) keeps the markup identical
  // across server and client so hydration can't mismatch.
  const escapeLink = useSyncExternalStore(
    subscribeNoop,
    getBrowserEscapeLink,
    () => null,
  );

  useEffect(() => {
    fetch(`/api/gyms/${gymId}`)
      .then((res) => res.json())
      .then((json) => setGym(json.data ?? null))
      .catch(() => {});
  }, [gymId]);

  const gymName = gym?.name ?? 'your gym';

  return (
    <div className="section-padding container-custom flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {sessionLoading ? null : user ? (
          <div className="card-premium p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold">You&apos;re already logged in 🎉</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Head over to {gymName} to check your membership and check in.
            </p>
            <Link href={`/gyms/${gymId}`} className="btn-primary inline-block">
              View {gymName}
            </Link>
          </div>
        ) : (
          <>
            <div className="card-premium p-6 text-center space-y-2">
              <h1 className="text-2xl font-bold">Join {gymName} on Phool Gobhi</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Register once to track your attendance and manage your membership online — takes less than a minute.
              </p>
            </div>
            <OtpForm redirectTo={`/gyms/${gymId}`} linkedGymId={Number.isFinite(numericGymId) ? numericGymId : undefined} />
          </>
        )}

        {/* Escape hatch when the page loaded inside an in-app browser (a
            QR-scanner or camera app's own embedded WebView rather than the
            real system browser) — that WebView usually doesn't share cookies
            with the browser the user is actually logged in on, so every scan
            re-prompts a login. One tap hands the same URL to the real browser,
            which does have that session. Always rendered now that the page
            survives the scan (previously it was hidden behind an app-link
            redirect that killed the page before it could show). */}
        {escapeLink && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Stuck in an app browser?{' '}
            <a href={escapeLink.href} className="text-emerald-600 dark:text-emerald-400 underline">
              {escapeLink.label}
            </a>
          </p>
        )}
        {/* App-install upsell — a secondary path alongside browser signup
            (not the only option). The Play Store link carries this gym's id
            via the Play Install Referrer (Android-only — see
            GymJoinAttributionService in the app), so someone who installs from
            THIS link still lands linked to this gym on first launch, without
            ever tapping phoolgobhi://join. iOS has no free equivalent, so the
            App Store button parks the same URI in the clipboard before opening
            the store; the app reads it back once, right after a fresh install
            (see GymJoinAttributionService.captureFromClipboard). iOS shows a
            one-time "pasted from Safari" notice the first time the app reads it
            back — expected, not a bug, and only ever fires once per install. */}
        <div className="card-premium p-6 text-center space-y-3">
          <p className="font-medium">📱 Get the app for faster check-ins and attendance tracking</p>
          <AppStoreButtons launchHref={appLaunchHref} attributionUri={appLink} />
        </div>
      </div>
    </div>
  );
}