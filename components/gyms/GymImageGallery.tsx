'use client';

import { useRef, useState } from 'react';

// Swipeable carousel with dot indicators, mirroring the customer app's gym
// detail screen (PageView + dots, no fullscreen viewer — the app doesn't
// have one either). Scroll-snap gives native touch swipe for free.
export default function GymImageGallery({ images, alt }: { images: { id: number; url: string }[]; alt: string }) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video rounded-2xl bg-cream-100 dark:bg-gray-800 flex items-center justify-center text-6xl">
        🏋️
      </div>
    );
  }

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl aspect-video [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.id} src={img.url} alt={alt} className="w-full h-full object-cover flex-shrink-0 snap-center" />
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((img, i) => (
            <span key={img.id} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
