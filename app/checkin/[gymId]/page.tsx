'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/components/auth/SessionProvider';
import type { Gym } from '@/lib/types';

type Phase =
  | 'redirecting'
  | 'idle'
  | 'geolocating'
  | 'checking'
  | 'success'
  | 'alreadyVerified'
  | 'noActiveBooking'
  | 'pendingConfirmation'
  | 'sessionNotStarted'
  | 'sessionEnded'
  | 'sessionAlreadyCompleted'
  | 'tooFar'
  | 'locationDenied'
  | 'error';

// The poster QR is a plain https link (no Universal/App Links set up yet —
// see the comment below), so whatever app scans it decides how to open it.
// Many QR-scanner and camera apps open it in their own embedded in-app
// browser instead of the real system browser — an isolated (often
// throwaway) cookie jar that never sees the user's actual logged-in Safari/
// Chrome session, hence a login prompt on every single scan. Both mobile
// OSes expose an escape hatch a plain link tap can trigger from inside most
// embedded WebViews: iOS resolves an `x-safari-https://` URL by handing it
// to real Safari; Android resolves an `intent://` URL by handing it to
// Chrome (falling back to the plain link via browser_fallback_url if Chrome
// isn't installed). Neither is guaranteed — a small number of in-app
// browsers (e.g. Facebook/Instagram in some versions) intercept and block
// exactly this — but it recovers the common case for free.
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

// The URL printed on a gym's physical check-in poster. Tries the native app
// first (phoolgobhi://checkin — no App Links/Universal Links domain
// verification set up yet, that needs a settled release signing cert we
// don't have pre-launch), then falls back to a real browser check-in using
// the same self-checkin endpoint + geolocation, for anyone without the app
// installed.
export default function CheckinRedirectPage() {
  const params = useParams<{ gymId: string }>();
  const gymId = params.gymId;
  const appLink = `phoolgobhi://checkin?gymId=${encodeURIComponent(gymId)}`;
  const { user, loading: sessionLoading } = useSession();

  const [phase, setPhase] = useState<Phase>('redirecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [escapeLink, setEscapeLink] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    window.location.href = appLink;
    const timer = setTimeout(() => setPhase('idle'), 1200);
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

  const checkInNow = () => {
    setErrorMessage(null);
    setPhase('geolocating');
    if (!navigator.geolocation) {
      setPhase('locationDenied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setPhase('checking');
        try {
          const res = await fetch(`/api/checkin/${gymId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          const json = await res.json();
          if (res.ok) {
            setPhase(json.data?.alreadyVerified ? 'alreadyVerified' : 'success');
            return;
          }
          if (json.code === 'NO_ACTIVE_BOOKING') setPhase('noActiveBooking');
          else if (json.code === 'BOOKING_PENDING_CONFIRMATION') setPhase('pendingConfirmation');
          else if (json.code === 'SESSION_NOT_STARTED') {
            setSessionStartTime(json.startTime ?? null);
            setPhase('sessionNotStarted');
          } else if (json.code === 'SESSION_ENDED') setPhase('sessionEnded');
          else if (json.code === 'SESSION_ALREADY_COMPLETED') setPhase('sessionAlreadyCompleted');
          else if (json.code === 'TOO_FAR') setPhase('tooFar');
          else {
            setErrorMessage(json.error || 'Check-in failed');
            setPhase('error');
          }
        } catch {
          setErrorMessage('Network error — please try again');
          setPhase('error');
        }
      },
      () => setPhase('locationDenied'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="section-padding container-custom flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="card-premium p-8 text-center space-y-4">
          {phase === 'redirecting' && (
            <>
              <h1 className="text-2xl font-bold">Opening Phool Gobhi&hellip;</h1>
              <p className="text-gray-600 dark:text-gray-400">
                If you have the app installed, it&apos;ll open automatically.
              </p>
            </>
          )}

          {phase === 'idle' && !sessionLoading && !user && (
            <>
              <h1 className="text-2xl font-bold">Log in to check in</h1>
              <p className="text-gray-600 dark:text-gray-400">
                You&apos;ll need to be logged in to mark your attendance{gym ? ` at ${gym.name}` : ''}.
              </p>
              <Link href={`/login?redirect=/checkin/${gymId}`} className="btn-primary inline-block">
                Log in
              </Link>
            </>
          )}

          {phase === 'idle' && !sessionLoading && user && (
            <>
              <h1 className="text-2xl font-bold">Check in{gym ? ` at ${gym.name}` : ''}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Don&apos;t have the app? Check in here instead — we&apos;ll use your location to confirm you&apos;re at the gym.
              </p>
              <button type="button" onClick={checkInNow} className="btn-primary inline-block">
                Check in now
              </button>
            </>
          )}

          {(phase === 'geolocating' || phase === 'checking') && (
            <>
              <h1 className="text-2xl font-bold">Checking you in&hellip;</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {phase === 'geolocating' ? 'Getting your location.' : 'Confirming with the gym.'}
              </p>
            </>
          )}

          {(phase === 'success' || phase === 'alreadyVerified') && (
            <>
              <h1 className="text-2xl font-bold">You&apos;re checked in! 🎉</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {phase === 'alreadyVerified' ? 'Looks like you already checked in for this session.' : 'Enjoy your session!'}
              </p>
            </>
          )}

          {phase === 'noActiveBooking' && (
            <>
              <h1 className="text-2xl font-bold">No session right now</h1>
              <p className="text-gray-600 dark:text-gray-400">
                You don&apos;t have a booking{gym ? ` at ${gym.name}` : ''} happening right now.
              </p>
              <Link href={`/gyms/${gymId}`} className="btn-primary inline-block">
                Browse available slots
              </Link>
            </>
          )}

          {phase === 'pendingConfirmation' && (
            <>
              <h1 className="text-2xl font-bold">Almost there</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your booking{gym ? ` at ${gym.name}` : ''} is still awaiting the gym&apos;s confirmation —
                check back in a moment, or ask the front desk to confirm it.
              </p>
              <button type="button" onClick={checkInNow} className="btn-secondary inline-block">
                Try again
              </button>
            </>
          )}

          {phase === 'sessionNotStarted' && (
            <>
              <h1 className="text-2xl font-bold">A little early</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Check-in opens 15 minutes before your{sessionStartTime ? ` ${sessionStartTime}` : ''} session
                {gym ? ` at ${gym.name}` : ''} — come back shortly.
              </p>
              <button type="button" onClick={checkInNow} className="btn-secondary inline-block">
                Try again
              </button>
            </>
          )}

          {phase === 'sessionEnded' && (
            <>
              <h1 className="text-2xl font-bold">Session ended</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Today&apos;s session{gym ? ` at ${gym.name}` : ''} has already ended.
              </p>
              <Link href="/account/bookings" className="btn-primary inline-block">
                View my bookings
              </Link>
            </>
          )}

          {phase === 'sessionAlreadyCompleted' && (
            <>
              <h1 className="text-2xl font-bold">Already done! 🎉</h1>
              <p className="text-gray-600 dark:text-gray-400">
                You&apos;ve already completed today&apos;s session{gym ? ` at ${gym.name}` : ''}.
              </p>
              <Link href="/account/bookings" className="btn-primary inline-block">
                View my bookings
              </Link>
            </>
          )}

          {phase === 'tooFar' && (
            <>
              <h1 className="text-2xl font-bold">Move a bit closer</h1>
              <p className="text-gray-600 dark:text-gray-400">
                You don&apos;t seem to be at the gym yet — try again once you&apos;re inside.
              </p>
              <button type="button" onClick={checkInNow} className="btn-secondary inline-block">
                Retry
              </button>
            </>
          )}

          {phase === 'locationDenied' && (
            <>
              <h1 className="text-2xl font-bold">Location needed</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please allow location access in your browser to check in, then try again.
              </p>
              <button type="button" onClick={checkInNow} className="btn-secondary inline-block">
                Try again
              </button>
            </>
          )}

          {phase === 'error' && (
            <>
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-gray-600 dark:text-gray-400">{errorMessage}</p>
              <button type="button" onClick={checkInNow} className="btn-secondary inline-block">
                Retry
              </button>
            </>
          )}
        </div>

        {/* Shown from 'idle' onward, not during the initial app-link
            attempt — if this loaded inside an in-app browser (a QR-scanner
            or camera app's own embedded WebView rather than the real
            system browser), that WebView usually doesn't share cookies with
            the browser the user is actually logged in on, so every scan
            re-prompts a login. One tap here hands the same URL to the real
            browser, which does have that session. */}
        {phase !== 'redirecting' && escapeLink && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Stuck in an app browser?{' '}
            <a href={escapeLink.href} className="text-emerald-600 dark:text-emerald-400 underline">
              {escapeLink.label}
            </a>
          </p>
        )}

        {/* App-install upsell — a secondary path alongside web check-in
            (not the only option), since faster QR-scan check-ins and
            push notifications only come with the app. Store links are
            placeholders: no live store listing yet, pre-launch. */}
        <div className="card-premium p-6 text-center space-y-3">
          <p className="font-medium">
            📱 Get the app &amp; get <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹20</span> credited to your wallet!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Faster QR check-ins, booking reminders, and more — coming soon.
          </p>
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
