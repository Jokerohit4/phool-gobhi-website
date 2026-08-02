'use client';

import { useEffect, useState } from 'react';

interface Props {
  launchAt: string | null;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getRemaining(launchAt: string): Remaining | null {
  const diff = new Date(launchAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// Reloads the page once the countdown hits zero so the server-side redirect
// in app/coming-soon/page.tsx (and proxy.ts on /gyms) picks up the flipped
// launch-status without the visitor having to refresh manually.
export default function LaunchCountdown({ launchAt }: Props) {
  const [remaining, setRemaining] = useState<Remaining | null>(() => (launchAt ? getRemaining(launchAt) : null));

  useEffect(() => {
    if (!launchAt) return;
    const interval = setInterval(() => {
      const next = getRemaining(launchAt);
      setRemaining(next);
      if (!next) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [launchAt]);

  if (!launchAt || !remaining) {
    return <p className="text-lg text-gray-700 dark:text-gray-300">We&apos;re putting the finishing touches on things — check back soon.</p>;
  }

  const units: Array<[string, number]> = [
    ['Days', remaining.days],
    ['Hours', remaining.hours],
    ['Minutes', remaining.minutes],
    ['Seconds', remaining.seconds],
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {units.map(([label, value]) => (
        <div key={label} className="card-premium flex flex-col items-center justify-center w-20 sm:w-24 py-4 sm:py-5">
          <span className="font-display text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400 tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}
