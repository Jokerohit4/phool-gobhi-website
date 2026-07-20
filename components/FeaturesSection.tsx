'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from './Poster';

const features = [
  {
    icon: '🔍',
    title: 'Discover Gyms',
    description: "Hundreds of gyms near you, zero stalking required. Ratings included, unlike Gobhi's dating profile.",
  },
  {
    icon: '📅',
    title: 'Flexible Booking',
    description: "Book today, skip tomorrow. No one's judging. Definitely not Gobhi (he skipped Tuesday too).",
  },
  {
    icon: '💳',
    title: 'Affordable Pricing',
    description: "Pay only for the days you actually show up. Gobhi called this 'basic math' and got weirdly smug about it.",
  },
  {
    icon: '⭐',
    title: 'Top Rated',
    description: 'Real reviews from real humans who actually went. Gobhi tried to leave one too. Gobhi cannot type. Gobhi is a vegetable.',
  },
];

export default function FeaturesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative section-padding bg-cream-50 dark:bg-gray-950 transition-colors overflow-hidden">
      <StickerBadge color="emerald" size={52} rotate={-14} delay={0.2} motion="pulse" className="absolute top-16 left-[4%] hidden lg:flex">🎯</StickerBadge>
      <StickerBadge color="terracotta" size={46} rotate={10} delay={0.8} motion="wiggle" className="absolute top-24 right-[6%] hidden md:flex">🔥</StickerBadge>
      <StickerBadge color="mustard" size={50} rotate={-8} delay={1.4} className="absolute bottom-10 right-[3%] hidden lg:flex">🏆</StickerBadge>
      <div className="container-custom relative z-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-7xl mb-4">
            <PosterOutline>Okay But</PosterOutline> <PosterFill color="emerald">Why Gobhi?</PosterFill>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            No memberships. No forms. No guilt trips. Just gym, on your terms (and occasionally Gobhi&apos;s, but mostly yours).
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="sticker !rounded-2xl p-6 bg-cream-100 dark:bg-gray-900 hover:shadow-md dark:hover:!shadow-[5px_5px_0_currentColor] transition-shadow duration-300 group cursor-default"
            >
              <div className="text-4xl mb-4 inline-block transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-12 group-active:scale-100">
                {feature.icon}
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Divider contained in overflow wrapper */}
              <div className="mt-4 overflow-hidden rounded-full">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-600 origin-left group-hover:scale-x-125 transition-transform duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mt-14"
        >
          <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
            <Link href="/gyms" className="btn-primary inline-block">
              See Gyms Near You 🏋️
            </Link>
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
