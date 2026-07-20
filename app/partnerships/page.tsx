'use client';

import { motion } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

export default function PartnershipsPage() {
  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="terracotta" size={54} rotate={10} delay={0} motion="wiggle" className="absolute top-24 right-[7%] hidden md:flex">🤝</StickerBadge>
      <StickerBadge color="emerald" size={46} rotate={-12} delay={0.5} motion="pulse" className="absolute bottom-20 left-[6%] hidden lg:flex">🏋️</StickerBadge>

      <div className="container-custom max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-6xl md:text-7xl mb-4">
            <PosterOutline>Partner</PosterOutline> <PosterFill color="terracotta">With Gobhi</PosterFill>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Own a gym? Run a wellness brand? Have an idea worth exploring together? Let&apos;s talk.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-2 gap-6 mb-12"
        >
          <div className="sticker !rounded-2xl p-6 bg-cream-100 dark:bg-gray-900">
            <div className="text-3xl mb-3">🏋️</div>
            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">List Your Gym</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fill unused off-peak capacity, reach customers who&apos;d never sign up for a 12-month membership, and
              get paid per session — no new front desk workflow required.
            </p>
          </div>
          <div className="sticker !rounded-2xl p-6 bg-cream-100 dark:bg-gray-900">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Brand &amp; Business Partnerships</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Wellness brands, corporate fitness perks, sponsorships — if it gets more people moving without a
              guilt-trip membership, we&apos;re probably interested.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="sticker !rounded-3xl bg-cream-100 dark:bg-gray-900 p-10 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl mb-3">Let&apos;s figure it out together</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Tell us about your gym or your idea — city, capacity, whatever&apos;s relevant — and we&apos;ll get back
            to you.
          </p>
          <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
            <a href="mailto:partners@phoolgobhi.com" className="btn-primary inline-block">
              partners@phoolgobhi.com
            </a>
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
