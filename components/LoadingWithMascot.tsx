'use client';

import { useEffect, useState } from 'react';
import {
  bootstrapLoaderFacts,
  nextLoaderFact,
  type LoaderAudience,
  type LoaderFact as Fact,
} from '@/lib/loader-facts';
import VeggieMascot from './VeggieMascot';

interface LoadingWithMascotProps {
  audience?: LoaderAudience;
  minVisibleMs?: number;
  rotateMs?: number;
  mascotSize?: number;
  /** Optional message above the mascot (e.g., "Loading gyms…"). */
  message?: string;
  className?: string;
}

export default function LoadingWithMascot({
  audience = 'customer',
  minVisibleMs = 400,
  rotateMs = 3200,
  mascotSize = 72,
  message,
  className = '',
}: LoadingWithMascotProps) {
  const [fact, setFact] = useState<Fact | null>(null);

  useEffect(() => {
    let cancelled = false;
    let ticker: ReturnType<typeof setInterval> | undefined;

    const start = setTimeout(async () => {
      if (cancelled) return;
      await bootstrapLoaderFacts(audience);
      if (cancelled) return;
      setFact(nextLoaderFact());

      ticker = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
        setFact(nextLoaderFact());
      }, rotateMs);
    }, minVisibleMs);

    return () => {
      cancelled = true;
      clearTimeout(start);
      if (ticker) clearInterval(ticker);
    };
  }, [audience, minVisibleMs, rotateMs]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`} aria-live="polite">
      {message && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
          {message}
        </p>
      )}
      <VeggieMascot size={mascotSize} />
      <p
        aria-hidden="true"
        className="mx-auto min-h-[2.5rem] max-w-md text-balance text-center text-sm leading-5 text-gray-500 dark:text-gray-400"
      >
        {fact?.text ?? ''}
      </p>
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .animate-breathe {
          animation: breathe 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}