'use client';

import { useEffect, useState } from 'react';

interface Props {
  launchAt: string;
}

function formatRemaining(launchAt: string): string | null {
  const diff = new Date(launchAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Compact single-line variant of LaunchCountdown, sized for a top-of-page
// banner strip rather than the full countdown card grid on /coming-soon.
export default function LaunchBannerCountdown({ launchAt }: Props) {
  const [remaining, setRemaining] = useState<string | null>(() => formatRemaining(launchAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = formatRemaining(launchAt);
      setRemaining(next);
      if (!next) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [launchAt]);

  if (!remaining) return null;

  return <span className="font-display tabular-nums tracking-wide">{remaining}</span>;
}
