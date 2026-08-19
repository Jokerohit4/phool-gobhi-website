'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OtpForm from '@/components/auth/OtpForm';
import { useSession } from '@/components/auth/SessionProvider';
import type { Gym } from '@/lib/types';

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
            not the only option. Store links are placeholders: no live store
            listing yet, pre-launch — same as /checkin/[gymId]. */}
        <div className="card-premium p-6 text-center space-y-3">
          <p className="font-medium">📱 Get the app for faster check-ins and attendance tracking</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
              Get it on Google Play
            </span>
            <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
              Download on the App Store
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
