'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PosterFill, PosterOutline, StickerBadge } from './Poster';

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Book any gym, anytime, anywhere. No commitment. Just flexibility.';

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [isLoaded]);

  return (
    <section className="relative w-full overflow-hidden dot-grid bg-[#F7F3E9] dark:bg-gray-950 pt-16 pb-20 transition-colors duration-300">
      {/* Scattered stickers */}
      <StickerBadge color="mustard" size={64} rotate={-10} delay={0} className="absolute top-24 left-[6%] hidden sm:flex">🥦</StickerBadge>
      <StickerBadge color="terracotta" size={56} rotate={12} delay={0.6} className="absolute top-40 right-[10%] hidden md:flex">🏋️</StickerBadge>
      <StickerBadge color="emerald" size={60} rotate={-6} delay={1.2} className="absolute bottom-24 left-[12%] hidden lg:flex">💪</StickerBadge>
      <StickerBadge color="mustard" size={48} rotate={16} delay={0.3} className="absolute bottom-40 right-[6%] hidden sm:flex">📅</StickerBadge>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-7" style={{ animation: isLoaded ? 'fadeInLeft 1s ease-out' : 'none' }}>
            <div className="sticker inline-flex px-5 py-2 bg-white dark:bg-gray-900">
              <span className="font-bold text-sm text-gray-900 dark:text-white">✨ Coming Soon</span>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight">
              <PosterOutline>Fitness</PosterOutline>
              <br />
              <PosterFill color="mustard">Without</PosterFill>{' '}
              <PosterFill color="emerald">Limits</PosterFill>
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed">
              A new way to book gym sessions. Flexible access to premium fitness experiences without long-term commitments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/how-it-works" className="btn-primary text-center">
                Explore Features 🚀
              </Link>
              <Link href="/contact" className="btn-secondary text-center">
                Get Notified →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t-2 border-gray-900/10 dark:border-white/10">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">🏋️ What&apos;s Here</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Handpicked premium gyms &amp; flexible booking</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">🎯 What&apos;s Coming</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Personalized recommendations &amp; rewards</p>
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="relative flex justify-center" style={{ animation: isLoaded ? 'fadeInRight 1s ease-out 0.2s backwards' : 'none' }}>
            <div className="sticker w-full max-w-sm bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl !border-4">
              <h2 className="font-display text-5xl sm:text-6xl text-emerald-600 dark:text-emerald-400 mb-1">Phool Gobhi</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Premium Fitness</p>

              <h3 className="text-2xl font-bold mb-3">Coming Soon</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                We&apos;re building something special. Be among the first to experience the future of gym access.
              </p>

              <ul className="space-y-3 mb-8">
                {['Early Access', 'Zero Commitment', 'Full Flexibility'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/contact" className="btn-primary w-full text-center block">
                Get Early Access ✨
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg sm:text-2xl font-medium text-emerald-700 dark:text-emerald-400 min-h-[2.5rem] flex items-center justify-center">
            {displayedText}
            {displayedText.length < fullText.length && <span className="ml-1 font-bold animate-pulse">|</span>}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
