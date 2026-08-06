'use client';

import { useRef, useState } from 'react';

// Swipeable carousel with dot indicators, mirroring the customer app's gym
// detail screen (PageView + dots, no fullscreen viewer — the app doesn't
// have one either). Scroll-snap gives native touch swipe for free.
export default function GymImageGallery({
  images,
  alt,
}: {
  images: { id: number; url: string; mediaType?: 'image' | 'video' }[];
  alt: string;
}) {
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
        {images.map((img) =>
          img.mediaType === 'video' ? (
            <video
              key={img.id}
              src={img.url}
              className="w-full h-full object-cover flex-shrink-0 snap-center"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.id} src={img.url} alt={alt} className="w-full h-full object-cover flex-shrink-0 snap-center" />
          )
        )}
      </div>
      {images.length > 1 && (
        // Dark backdrop pill behind the dots — a photo/video frame can be
        // any color, and dots alone (even white ones) can wash out or blend
        // in depending on what's behind them. The pill guarantees contrast
        // regardless, and the size bump makes "there are more" unmissable.
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur-sm">
            {images.map((img, i) => (
              <span
                key={img.id}
                className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-2 bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
