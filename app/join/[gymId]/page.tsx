'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OtpForm from '@/components/auth/OtpForm';
import { useSession } from '@/components/auth/SessionProvider';
import type { Gym } from '@/lib/types';

const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '';
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '';

// Same in-app-browser escape hatch as /checkin/[gymId] — see that page for
// the full rationale. Duplicated rather than shared since that page doesn't
// export it either (both are small, self-contained, page-local helpers).
function getBrowserEscapeLink(): { href: string; label: string } | null {
  const ua = navigator.userAgent;
  const currentUrl = window.location.href;
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return { href: currentUrl.replace(/^https?:\/\//, 'x-safari-https://'), label: 'Open in Safari' };
  }
  if (/Android/i.test(ua)) {
    const url = new URL(currentUrl);
    const fallback = encodeURIComponent(currentUrl);
    return {
      href: `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`,
      label: 'Open in Chrome',
    };
  }
  return null;
}

// The URL printed on a gym's "join us on Phool Gobhi" poster — the
// attendance-SaaS wedge's entry point for a gym's existing members. Tries
// the native app first (phoolgobhi://join — no App Links/Universal Links
// domain verification set up yet, same caveat as /checkin/[gymId]), then
// falls back to registering right here in the browser: the website already
// has the full OTP signup + gym-subscription-purchase flow, so there's no
// need to gate this behind an app install.
export default function JoinGymPage() {
  const params = useParams<{ gymId: string }>();
  const gymId = params.gymId;
  const numericGymId = Number(gymId);
  const appLink = `phoolgobhi://join?gymId=${encodeURIComponent(gymId)}`;
  const { user, loading: sessionLoading } = useSession();

  const [redirected, setRedirected] = useState(false);
  const [gym, setGym] = useState<Gym | null>(null);
  const [escapeLink, setEscapeLink] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    window.location.href = appLink;
    const timer = setTimeout(() => setRedirected(true), 1200);
    return () => clearTimeout(timer);
  }, [appLink]);

  useEffect(() => {
    setEscapeLink(getBrowserEscapeLink());
  }, []);

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
        {!redirected ? (
          <div className="card-premium p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold">Opening Phool Gobhi&hellip;</h1>
            <p className="text-gray-600 dark:text-gray-400">
              If you have the app installed, it&apos;ll open automatically.
            </p>
          </div>
        ) : sessionLoading ? null : user ? (
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

        {/* Same in-app-browser escape hatch as /checkin/[gymId] — see that
            page for the full rationale. */}
        {redirected && escapeLink && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Stuck in an app browser?{' '}
            <a href={escapeLink.href} className="text-emerald-600 dark:text-emerald-400 underline">
              {escapeLink.label}
            </a>
          </p>
        )}

        {/* App-install upsell — a secondary path alongside browser signup,
            not the only option. Buttons go live the moment the store env
            vars are set (same convention as /app's AppLanding), and stay
            disabled placeholders until then — same as /checkin/[gymId].
            The Play Store link carries this gym's id via the Play Install
            Referrer mechanism (Android-only — see GymJoinAttributionService
            in the app): a deferred deep link, so someone who installs from
            THIS link still lands linked to this gym on first launch,
            without ever tapping phoolgobhi://join. iOS has no free
            equivalent (no Universal Links domain verification set up), so
            the App Store button instead copies the same phoolgobhi://join
            URI to the clipboard before opening the store — the app reads it
            back once, right after a fresh install (see
            GymJoinAttributionService.captureFromClipboard). iOS shows a
            one-time "pasted from Safari" notice the first time the app
            reads it back — expected, not a bug, and only ever fires once
            per install. */}
        <div className="card-premium p-6 text-center space-y-3">
          <p className="font-medium">📱 Get the app for faster check-ins and attendance tracking</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {PLAY_STORE_URL || APP_STORE_URL ? '' : 'Coming soon.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {PLAY_STORE_URL ? (
              <a
                href={`${PLAY_STORE_URL}${PLAY_STORE_URL.includes('?') ? '&' : '?'}referrer=${encodeURIComponent(`join_gym_id=${gymId}`)}`}
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
              <button
                type="button"
                onClick={async () => {
                  // Best-effort — clipboard write can fail (permissions,
                  // non-secure context) and must never block the store
                  // redirect that actually matters.
                  try {
                    await navigator.clipboard.writeText(appLink);
                  } catch {
                    // Nothing to carry over; the installer just lands as an
                    // unlinked marketplace customer, same as before this
                    // existed.
                  }
                  window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer');
                }}
                className="btn-secondary inline-block text-center"
              >
                Download on the App Store
              </button>
            ) : (
              <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
                Download on the App Store
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
