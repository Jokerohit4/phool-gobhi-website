'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/components/auth/SessionProvider';
import { buildAppLaunchHref, getBrowserEscapeLink, subscribeNoop } from '@/lib/appDeepLink';
import AppStoreButtons from '@/components/AppStoreButtons';
import type { Gym } from '@/lib/types';

type Phase =
  | 'idle'
  | 'geolocating'
  | 'checking'
  | 'success'
  | 'alreadyVerified'
  | 'noActiveBooking'
  | 'pendingConfirmation'
  | 'earlyCheckin'
  | 'sessionEnded'
  | 'sessionAlreadyCompleted'
  | 'tooFar'
  | 'locationDenied'
  | 'error';

interface EarlyCheckinConfirmation {
  currentStartTime: string;
  currentEndTime: string;
  newStartTime: string;
  newEndTime: string;
}

// The URL printed on a gym's physical check-in poster. No App Links /
// Universal Links domain verification is set up yet (that needs a settled
// release signing cert), so the poster is a plain https link and the *scanning*
// app decides how to open it.
//
// The web check-in below — same self-checkin endpoint, browser geolocation —
// is the primary path, not a fallback, and stays that way even now that iOS is
// on the App Store. Universal Links aren't verified, so a poster scan is still
// just an https link and iOS has no way to open the app automatically from it.
// The app is offered as progressive enhancement from an explicit tap via
// `buildAppLaunchHref`; see lib/appDeepLink.ts for why auto-launching on mount
// turned this poster into a dead end for anyone without the app installed.
export default function CheckinRedirectPage() {
  const params = useParams<{ gymId: string }>();
  const gymId = params.gymId;
  const { user, loading: sessionLoading } = useSession();

  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [earlyConfirmation, setEarlyConfirmation] = useState<EarlyCheckinConfirmation | null>(null);
  const [slotShifted, setSlotShifted] = useState(false);
  const [gym, setGym] = useState<Gym | null>(null);

  // Render-time, not effect-time: the href must belong to a tap the user
  // actually made. platform and location are both stable by first paint here.
  const appLaunchHref = buildAppLaunchHref(`checkin?gymId=${encodeURIComponent(gymId)}`);

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

  const checkInNow = (confirmEarly = false) => {
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
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, confirmEarly }),
          });
          const json = await res.json();
          if (res.ok) {
            setSlotShifted(!!json.data?.slotShifted);
            setPhase(json.data?.alreadyVerified ? 'alreadyVerified' : 'success');
            return;
          }
          if (json.code === 'NO_ACTIVE_BOOKING') setPhase('noActiveBooking');
          else if (json.code === 'BOOKING_PENDING_CONFIRMATION') setPhase('pendingConfirmation');
          else if (json.code === 'EARLY_CHECKIN') {
            setEarlyConfirmation(json.confirmation ?? null);
            setPhase('earlyCheckin');
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
              <button type="button" onClick={() => checkInNow()} className="btn-primary inline-block">
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
              {phase === 'success' && slotShifted && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Your slot time was adjusted since you checked in early — a warning was added to your account.
                </p>
              )}
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
              <button type="button" onClick={() => checkInNow()} className="btn-secondary inline-block">
                Try again
              </button>
            </>
          )}

          {phase === 'earlyCheckin' && (
            <>
              <h1 className="text-2xl font-bold">A little early</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Check-in opens 15 minutes before your
                {earlyConfirmation ? ` ${earlyConfirmation.currentStartTime}–${earlyConfirmation.currentEndTime}` : ''} session
                {gym ? ` at ${gym.name}` : ''}. You can still check in now — this will shift your session to
                {earlyConfirmation ? ` ${earlyConfirmation.newStartTime}–${earlyConfirmation.newEndTime}` : ' now'} and add a warning to your
                account for checking in early.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button type="button" onClick={() => setPhase('idle')} className="btn-secondary inline-block">
                  Wait a bit longer
                </button>
                <button type="button" onClick={() => checkInNow(true)} className="btn-primary inline-block">
                  Check in now anyway
                </button>
              </div>
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
              <button type="button" onClick={() => checkInNow()} className="btn-secondary inline-block">
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
              <button type="button" onClick={() => checkInNow()} className="btn-secondary inline-block">
                Try again
              </button>
            </>
          )}

          {phase === 'error' && (
            <>
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-gray-600 dark:text-gray-400">{errorMessage}</p>
              <button type="button" onClick={() => checkInNow()} className="btn-secondary inline-block">
                Retry
              </button>
            </>
          )}
        </div>

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

        {/* App-install upsell — a secondary path alongside web check-in (not
            the only option), since in-app QR check-ins and push reminders
            only come with the app. iOS is live; the Play listing is not, so
            that button stays a placeholder until PLAY_STORE_URL is set. */}
        <div className="card-premium p-6 text-center space-y-3">
          <p className="font-medium">
            📱 Get the app &amp; get{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹20</span> credited to your wallet!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Faster QR check-ins, booking reminders, and more.
          </p>
          <AppStoreButtons launchHref={appLaunchHref} />
        </div>
      </div>
    </div>
  );
}
