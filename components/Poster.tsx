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

export function StickerBadge({
  children,
  color = 'emerald',
  size = 64,
  rotate = -8,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  color?: AccentColor;
  size?: number;
  rotate?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`sticker tilt-sticker inline-flex items-center justify-center select-none pointer-events-none ${BADGE_BG[color]} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        transform: `rotate(${rotate}deg)`,
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
