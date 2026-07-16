'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from './Poster';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'No membership. No shame. Just show up.';

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

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.13, delayChildren: 0.1 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE },
    },
  };

  const word: Variants = {
    hidden: { opacity: 0, y: 34, scale: 0.92, rotate: -2 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  const card: Variants = {
    hidden: { opacity: 0, scale: 0.85, y: 40, rotate: -3 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: 0,
      transition: { type: 'spring', stiffness: 140, damping: 16, delay: 0.4 },
    },
  };

  return (
    <section className="relative w-full overflow-hidden dot-grid bg-cream-50 dark:bg-gray-950 pt-16 pb-20 transition-colors duration-300">
      {/* Scattered stickers */}
      <StickerBadge color="mustard" size={64} rotate={-10} delay={0} className="absolute top-24 left-[6%] hidden sm:flex">🥦</StickerBadge>
      <StickerBadge color="terracotta" size={56} rotate={12} delay={0.6} motion="wiggle" className="absolute top-40 right-[10%] hidden md:flex">🏋️</StickerBadge>
      <StickerBadge color="emerald" size={60} rotate={-6} delay={1.2} motion="pulse" className="absolute bottom-24 left-[12%] hidden lg:flex">💪</StickerBadge>
      <StickerBadge color="mustard" size={48} rotate={16} delay={0.3} motion="wiggle" className="absolute bottom-40 right-[6%] hidden sm:flex">📅</StickerBadge>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div className="space-y-7 min-w-0" variants={container} initial="hidden" animate="visible">
            <motion.div variants={item} className="sticker inline-flex px-5 py-2 bg-cream-100 dark:bg-gray-900">
              <span className="font-bold text-sm text-gray-900 dark:text-white">🥦 Cooking Soon</span>
            </motion.div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight break-words">
              <motion.span variants={word} className="inline-block break-words"><PosterOutline>Flex</PosterOutline></motion.span>
              <br />
              <motion.span variants={word} className="inline-block break-words"><PosterFill color="mustard">Without</PosterFill></motion.span>{' '}
              <motion.span variants={word} className="inline-block break-words"><PosterFill color="emerald">Commitment</PosterFill></motion.span>
            </h1>

            <motion.p variants={item} className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed">
              Pay per session. Skip the 12-month guilt trip. Gobhi&apos;s done the math — he&apos;s a vegetable, math is the only thing he&apos;s sure of. (He&apos;s still working on feelings.)
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/how-it-works" className="btn-primary text-center block">
                  Convince Me 🥦
                </Link>
              </motion.span>
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/contact" className="btn-secondary text-center block">
                  Fine, I&apos;m In →
                </Link>
              </motion.span>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t-2 border-gray-900/10 dark:border-white/10">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">🥦 What&apos;s Here</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Real gyms, real slots, zero paperwork. Gobhi hates forms too.</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">🎯 What&apos;s Coming</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Gym buddies, perks &amp; whatever chaos Gobhi cooks up next. He doesn&apos;t have a kitchen. He&apos;s a vegetable.</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right card */}
          <motion.div
            className="relative flex justify-center"
            variants={card}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="sticker w-full max-w-sm bg-cream-100 dark:bg-gray-900 p-8 sm:p-10 !rounded-3xl !border-4"
            >
              <h2 className="font-display text-5xl sm:text-6xl text-emerald-600 dark:text-emerald-400 mb-1">Phool Gobhi</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">Certified Floret. Uncertified Abs.</p>

              <h3 className="text-2xl font-bold mb-3">Coming Soon</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Gobhi&apos;s still warming up before launch — florets take a while to stretch. Get in early, skip the line, brag about it later.
              </p>

              <ul className="space-y-3 mb-8">
                {['Early Access (no queue)', 'Zero Guilt (patented)', 'Pay As You Go (revolutionary, we know)'].map((thing, i) => (
                  <motion.li
                    key={thing}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.12, duration: 0.4, ease: EASE }}
                    className="flex items-center gap-3 text-sm font-medium"
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
                    {thing}
                  </motion.li>
                ))}
              </ul>

              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="block"
              >
                <Link href="/contact" className="btn-primary w-full text-center block">
                  Count Me In, Gobhi 🥦
                </Link>
              </motion.span>
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg sm:text-2xl font-medium text-emerald-700 dark:text-emerald-400 min-h-[2.5rem] flex items-center justify-center">
            {displayedText}
            {displayedText.length < fullText.length && <span className="ml-1 font-bold animate-pulse">|</span>}
          </p>
        </div>
      </div>
    </section>
  );
}
