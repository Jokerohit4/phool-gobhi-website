'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PhoolGobhiLogo from '@/components/PhoolGobhiLogo';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

export default function AboutPage() {
  return (
    <section className="relative min-h-screen section-padding dot-grid bg-[#F7F3E9] dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="mustard" size={56} rotate={-12} delay={0} className="absolute top-28 left-[8%] hidden md:flex">🌱</StickerBadge>
      <StickerBadge color="terracotta" size={48} rotate={14} delay={0.5} className="absolute top-44 right-[10%] hidden lg:flex">🎯</StickerBadge>

      <div className="container-custom max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6"><PhoolGobhiLogo /></div>
          <h1 className="font-display text-6xl md:text-7xl mb-4">
            <PosterOutline>About</PosterOutline> <PosterFill color="emerald">Phool Gobhi</PosterFill>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The first move toward a fitter India.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed mb-16"
        >
          <p>
            India has spent years telling people to get fit. What nobody built is the everyday product that makes it
            easy to actually start — one that doesn&apos;t ask for a year of commitment before you&apos;ve even tried
            the gym. We think that gap is one of the more interesting problems in Indian consumer tech right now, and
            we&apos;ve gone looking for the data to prove it.
          </p>
          <p>
            Phool Gobhi is our answer: a pay-per-session gym marketplace. Book a session the way you&apos;d book a
            cab — no annual contract, no upfront leap of faith, just show up and pay for that visit. It&apos;s
            deliberately the smallest first move, because the fastest way to get a country moving is to make the very
            first session effortless.
          </p>
          <p>
            We&apos;re a pre-launch startup out of Gurugram. Between the product we&apos;ve built, the gyms
            we&apos;ve already spoken with, and the research behind why this works, there&apos;s a lot more to this
            story than fits on one page.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="sticker !rounded-3xl bg-white dark:bg-gray-900 p-10 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl mb-3">Want the rest of the story?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            The market size, what we found when we asked gyms and customers directly, what&apos;s already built, and
            what we&apos;re raising — we walk through all of it in the full deck, shared privately with investors,
            partners, and anyone else who&apos;s asked.
          </p>
          <Link href="/pitch-deck" className="btn-primary inline-block">
            Request the Pitch Deck
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
