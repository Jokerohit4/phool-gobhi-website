'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '';
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '';

type Platform = 'android' | 'ios' | 'other';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/i.test(ua)) return 'ios';
  return 'other';
}

// Platform never changes after mount; getSnapshot returns a string so there is
// no reference-instability churn. Server snapshot is always 'other'.
function subscribePlatform(): () => void {
  return () => {};
}

function getPlatformSnapshot(): Platform {
  return detectPlatform();
}

function getPlatformServerSnapshot(): Platform {
  return 'other';
}

export default function AppLanding() {
  const platform = useSyncExternalStore(subscribePlatform, getPlatformSnapshot, getPlatformServerSnapshot);

  // Smart link: the QR prints https://www.phoolgobhi.com/app forever. Once the
  // store listings go live, set NEXT_PUBLIC_PLAY_STORE_URL / NEXT_PUBLIC_APP_STORE_URL
  // and phones scanning the shirt get routed to the right store automatically —
  // no QR reprint needed. Until then the landing page below shows "coming soon".
  const storeUrl = platform === 'android' ? PLAY_STORE_URL : APP_STORE_URL;

  useEffect(() => {
    if (!storeUrl) return;
    window.location.replace(storeUrl);
  }, [storeUrl]);

  const playLive = PLAY_STORE_URL.length > 0;
  const appLive = APP_STORE_URL.length > 0;

  return (
    <section className="relative min-h-[80vh] flex items-center section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <div className="container-custom max-w-3xl relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28">
            <Image
              src="/broc-mascot.png"
              alt="Phool Gobhi mascot, mid-flex"
              width={112}
              height={112}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <p className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
          Fitness, for all.
        </p>
        <h1 className="font-display text-5xl sm:text-6xl mb-4">Get the Phool Gobhi app</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-3">
          Book pay-per-session gym access, check in by QR, and track your streak — all from your phone.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          ₹20 credited to your wallet on sign-up. No membership. No shame.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          {playLive ? (
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block text-center">
              Get it on Google Play
            </a>
          ) : (
            <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
              Get it on Google Play
            </span>
          )}
          {appLive ? (
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block text-center">
              Download on the App Store
            </a>
          ) : (
            <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
              Download on the App Store
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/gyms" className="btn-primary inline-block">
            Browse gyms on the web
          </Link>
          <a href="https://wa.me/919354859197" target="_blank" rel="noopener noreferrer" className="btn-ghost inline-block">
            💬 WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
