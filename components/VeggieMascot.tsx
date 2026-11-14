'use client';

import { useEffect, useState } from 'react';

interface VeggieMascotProps {
  size?: number;
  className?: string;
}

export default function VeggieMascot({ size = 72, className = '' }: VeggieMascotProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div
      className={`flex justify-center ${reduceMotion ? '' : 'animate-breathe'} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src="/gobhi/gobhi.png"
        alt=""
        width={size}
        height={size}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(34, 197, 94, 0.3))' }}
      />
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