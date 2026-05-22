'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fullText = 'Book any gym, anytime, anywhere. No commitment. Just flexibility.';

  useEffect(() => {
    setIsLoaded(true);
    
    // Check initial dark mode
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Typewriter effect
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

  const bgGradient = isDarkMode 
    ? 'linear-gradient(to bottom, #000, #1a1a1a)'
    : 'linear-gradient(to bottom, #f9fafb, #ffffff)';

  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-x-hidden pt-20 bg-white dark:bg-gray-950 transition-colors duration-300"
      style={{
        minHeight: '150vh',
      }}
    >
      {/* Background gradient that responds to theme */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: bgGradient,
          transition: 'background 0.3s ease-in-out',
          zIndex: 0,
        }}
      />

      {/* Background with gym image and parallax */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '200%',
          backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=2000&h=1400&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: isDarkMode ? 'brightness(0.6)' : 'brightness(0.4)',
          transform: `translateY(${scrollY * 0.5}px)`,
          willChange: 'transform',
          transition: 'filter 0.3s ease-in-out',
          zIndex: 1,
        }}
      />

      {/* Phool Gobhi Mascot Background - Top Right */}
      <div
        className="absolute top-0 right-0 opacity-10 md:opacity-15 pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          transform: `translateY(${scrollY * 0.3}px)`,
          zIndex: 2,
        }}
      >
        <Image
          src="/broc-mascot.png"
          alt="Phool Gobhi Mascot"
          width={400}
          height={400}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Phool Gobhi Mascot Background - Bottom Left */}
      <div
        className="absolute bottom-0 left-0 opacity-10 md:opacity-15 pointer-events-none"
        style={{
          width: '350px',
          height: '350px',
          transform: `translateY(${scrollY * 0.2}px)`,
          zIndex: 2,
        }}
      >
        <Image
          src="/broc-mascot.png"
          alt="Phool Gobhi Mascot"
          width={350}
          height={350}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 w-full flex-1 flex items-center">
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center w-full">
          {/* Left side */}
          <div className="space-y-6 md:space-y-8 text-gray-900 dark:text-white" style={{ animation: isLoaded ? 'fadeInLeft 1.2s ease-out' : 'none' }}>
            <div className="inline-block px-6 py-3 rounded-full bg-emerald-500/40 dark:bg-emerald-500/30 border border-emerald-400/70 dark:border-emerald-400/60 backdrop-blur-sm">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">✨ Coming Soon</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight text-gray-900 dark:text-white" style={{ 
              textShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.8)' : '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              Fitness Without <span className="text-emerald-600 dark:text-emerald-400">Limits</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-100 max-w-lg leading-relaxed">
              A new way to book gym sessions. Flexible access to premium fitness experiences without long-term commitments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
              <Link
                href="/how-it-works"
                className="px-6 sm:px-8 py-3 md:py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/60"
              >
                Explore Features 🚀
              </Link>

              <Link
                href="/contact"
                className="px-6 sm:px-8 py-3 md:py-4 rounded-xl border-2 border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-300 font-bold text-sm sm:text-base md:text-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/40"
              >
                Get Notified →
              </Link>
            </div>

            {/* Features instead of stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-8 md:pt-12 border-t border-gray-300 dark:border-white/20">
              <div className="hover:scale-105 transition-all duration-300 cursor-default">
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-300 font-semibold mb-2">🏋️ What's Here</p>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">Handpicked premium gyms & flexible booking</p>
              </div>
              <div className="hover:scale-105 transition-all duration-300 cursor-default">
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-300 font-semibold mb-2">🎯 What's Coming</p>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">Personalized recommendations & rewards</p>
              </div>
            </div>
          </div>

          {/* Right card */}
          <div
            className="relative flex items-center justify-center w-full px-0"
            style={{ animation: isLoaded ? 'fadeInRight 1.2s ease-out 0.3s backwards' : 'none' }}
          >
            <div className="w-full max-w-sm bg-gradient-to-br from-white/15 dark:from-white/15 to-white/5 dark:to-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-300 dark:border-white/25 bg-white dark:bg-gray-900/50 shadow-2xl hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500">
              <div className="space-y-4 mb-6 md:mb-8">
                <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-emerald-600 dark:text-emerald-300">Phool Gobhi</h2>
                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-200 font-bold uppercase tracking-widest">Premium Fitness</p>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Coming Soon</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-100 mb-6 md:mb-8">We're building something special. Be among the first to experience the future of gym access.</p>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {['Early Access', 'Zero Commitment', 'Full Flexibility'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm sm:text-base text-gray-800 dark:text-gray-100 hover:translate-x-2 transition-transform duration-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="block w-full py-3 md:py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm sm:text-base hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/60 transition-all duration-300 text-center"
              >
                Get Early Access ✨
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Typewriter Text at Bottom */}
      <div className="relative z-10 w-full pb-8 md:pb-16 px-4">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-lg sm:text-2xl md:text-3xl font-light text-emerald-600 dark:text-emerald-300 leading-relaxed min-h-[3rem] md:min-h-[4rem] flex items-center justify-center">
                {displayedText}
                {displayedText.length < fullText.length && (
                  <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">|</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
