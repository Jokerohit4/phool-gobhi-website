'use client';

import { motion } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6 },
};

export default function TeamPage() {
  return (
    <div className="bg-cream-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
        <StickerBadge color="terracotta" size={54} rotate={10} delay={0} motion="wiggle" className="absolute top-24 right-[7%] hidden md:flex">🥦</StickerBadge>
        <StickerBadge color="emerald" size={46} rotate={-12} delay={0.5} motion="pulse" className="absolute bottom-20 left-[6%] hidden lg:flex">💪</StickerBadge>

        <div className="container-custom max-w-3xl relative z-10">
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
              A Small, Scrappy Team
            </p>
            <h1 className="font-display text-6xl md:text-7xl mb-4">
              <PosterOutline>Meet</PosterOutline> <PosterFill color="terracotta">The Founder</PosterFill>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Phool Gobhi started with one belief — a calendar year of commitment should not be the price of a workout —
              and one person stubborn enough to build it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <motion.div {...fadeUp} className="sticker !rounded-3xl bg-cream-100 dark:bg-gray-900 p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-4xl">
                👨‍💼
              </div>
              <div className="text-center sm:text-left">
                <h2 className="font-display text-2xl text-gray-900 dark:text-white mb-1">Rohitashwa Singh</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-4">Founder</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  A mobile developer turned fitness entrepreneur. Phool Gobhi is his answer to watching talented
                  coaches sit idle and everyday people priced out of gyms by annual memberships — building the
                  marketplace on one side and the partner tools on the other.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
                  He&apos;s also the platform&apos;s Grievance Officer — reach him at{' '}
                  <a href="mailto:hello@phoolgobhi.com" className="font-medium text-emerald-600 dark:text-emerald-400 underline">
                    hello@phoolgobhi.com
                  </a>{' '}
                  or on WhatsApp at +91 93548 59197.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hiring */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-3xl">
          <motion.div {...fadeUp} className="text-center">
            <div className="flex justify-center mb-6">
              <StickerBadge color="mustard" size={56} rotate={6} motion="wiggle">📣</StickerBadge>
            </div>
            <h2 className="font-display text-3xl md:text-4xl mb-3">The team is still growing</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              We&apos;re pre-launch with a lean crew, and we hire for attitude before credentials. If you want to help
              make fitness access a right instead of a contract, we want to hear from you.
            </p>
            <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/careers" className="btn-primary inline-block">
              See Open Roles
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}