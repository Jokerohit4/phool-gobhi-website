import type { ReactNode } from 'react';

type AccentColor = 'emerald' | 'mustard' | 'terracotta' | 'ink';

const FILL_CLASS: Record<AccentColor, string> = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  mustard: 'text-mustard-500 dark:text-mustard-400',
  terracotta: 'text-terracotta-500 dark:text-terracotta-400',
  ink: 'text-gray-900 dark:text-white',
};

export function PosterFill({ children, color = 'emerald' }: { children: ReactNode; color?: AccentColor }) {
  return <span className={FILL_CLASS[color]}>{children}</span>;
}

const STROKE_CLASS: Record<AccentColor, string> = {
  emerald: 'stroke-emerald',
  mustard: 'stroke-mustard',
  terracotta: 'stroke-terracotta',
  ink: 'stroke-ink',
};

export function PosterOutline({ children, color = 'ink' }: { children: ReactNode; color?: AccentColor }) {
  return <span className={`text-stroke ${STROKE_CLASS[color]}`}>{children}</span>;
}

const BADGE_BG: Record<AccentColor, string> = {
  emerald: 'bg-emerald-400 dark:bg-emerald-500',
  mustard: 'bg-mustard-400 dark:bg-mustard-500',
  terracotta: 'bg-terracotta-400 dark:bg-terracotta-500',
  ink: 'bg-gray-200 dark:bg-gray-700',
};

const MOTION_CLASS = {
  float: 'tilt-sticker',
  wiggle: 'wiggle-sticker',
  pulse: 'pulse-sticker',
} as const;

export function StickerBadge({
  children,
  color = 'emerald',
  size = 64,
  rotate = -8,
  delay = 0,
  motion = 'float',
  className = '',
}: {
  children: ReactNode;
  color?: AccentColor;
  size?: number;
  rotate?: number;
  delay?: number;
  motion?: keyof typeof MOTION_CLASS;
  className?: string;
}) {
  return (
    <div
      className={`sticker sticker-hover ${MOTION_CLASS[motion]} items-center justify-center select-none cursor-pointer ${BADGE_BG[color]} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        transform: `rotate(${rotate}deg)`,
        animationDelay: `${delay}s`,
        ['--tilt' as string]: `${rotate}deg`,
      }}
    >
      {children}
    </div>
  );
}
