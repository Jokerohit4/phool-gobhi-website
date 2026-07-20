'use client';

import { motion } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

export default function CareersPage() {
  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="mustard" size={54} rotate={-10} delay={0} motion="wiggle" className="absolute top-24 left-[7%] hidden md:flex">🚀</StickerBadge>
      <StickerBadge color="emerald" size={46} rotate={12} delay={0.5} motion="pulse" className="absolute bottom-20 right-[6%] hidden lg:flex">💼</StickerBadge>

      <div className="container-custom max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-6xl md:text-7xl mb-4">
            <PosterOutline>Build</PosterOutline> <PosterFill color="mustard">With Gobhi</PosterFill>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We&apos;re small, scrappy, and pre-launch — which means whoever joins next shapes a lot more than a job description.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed mb-12"
        >
          <p>
            We don&apos;t have a fixed list of open roles right now — we&apos;re a tiny team building the product,
            gym network, and everything in between. If you&apos;re excited about pay-per-session fitness in India and
            think you can help us move faster (engineering, growth, operations, whatever you&apos;re good at), we want
            to hear from you.
          </p>
          <p>
            Tell us what you&apos;d want to work on and why — a resume helps, but a good pitch for yourself matters
            more at this stage.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="sticker !rounded-3xl bg-cream-100 dark:bg-gray-900 p-10 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl mb-3">No open roles listed? Doesn&apos;t matter.</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Send us what you&apos;ve got — a resume, a portfolio, a one-line pitch, whatever gets the point across.
          </p>
          <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
            <a href="mailto:career@phoolgobhi.com" className="btn-primary inline-block">
              career@phoolgobhi.com
            </a>
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
