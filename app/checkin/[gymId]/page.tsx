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
  | 'tooFar'
  | 'locationDenied'
  | 'error';

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
  const [gym, setGym] = useState<Gym | null>(null);

  useEffect(() => {
    window.location.href = appLink;
    const timer = setTimeout(() => setPhase('idle'), 1200);
    return () => clearTimeout(timer);
  }, [appLink]);

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
