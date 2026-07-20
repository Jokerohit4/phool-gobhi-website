'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from './Poster';

const plans = [
  {
    name: 'Pay As You Go',
    description: "One session. No paperwork. No drama. Gobhi checked twice, there's really no fine print.",
    features: ['Single session pass', 'Book same day', 'Zero commitment'],
    status: 'Available Now',
  },
  {
    name: 'Regular Round',
    description: 'For people who actually show up weekly. A rare breed. Gobhi respects you.',
    features: ['Unlimited weekly access', 'Priority bookings', 'Bonus perks'],
    status: 'Launching Soon',
  },
  {
    name: "Gobhi's Favourite",
    description: "All the access, none of the guilt. Gobhi picked this one himself — totally unbiased, he's a vegetable.",
    features: ['24/7 access', 'Exclusive venues', 'Actual human support'],
    status: 'In Development',
    highlighted: true,
  },
  {
    name: 'Team Plan',
    description: "For offices that want fitter people, fewer sick days, and one very earnest HR email about 'wellness culture.'",
    features: ['Bulk access', 'Custom setups', 'Admin dashboard'],
    status: 'Coming Later',
  },
];

export default function PricingSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const reduceMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Straightforward pricing. Zero annual commitment ceremonies. Zero sacrifices required.';

  // Typewriter effect when section comes into view
  useEffect(() => {
    if (!isInView) return;

    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="relative section-padding bg-cream-50 dark:bg-gray-950 transition-colors overflow-hidden">
      <StickerBadge color="mustard" size={54} rotate={12} delay={0.4} motion="wiggle" className="absolute top-20 left-[5%] hidden lg:flex">💰</StickerBadge>
      <StickerBadge color="emerald" size={48} rotate={-10} delay={1.0} motion="pulse" className="absolute bottom-24 right-[4%] hidden md:flex">✅</StickerBadge>
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-7xl mb-6">
            <PosterOutline>Plans &amp;</PosterOutline> <PosterFill color="mustard">Not Memberships</PosterFill>
          </h2>

          {/* Typewriter text */}
          <p className="text-xl text-emerald-600 dark:text-emerald-400 max-w-2xl mx-auto min-h-[3rem] flex items-center justify-center font-light">
            {displayedText}
            {displayedText.length < fullText.length && (
              <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">|</span>
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.92 }}
              animate={reduceMotion || isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 22,
                delay: 0.15 + index * 0.12,
              }}
              className={`group relative p-8 rounded-2xl border overflow-hidden ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-2xl border-transparent hover:shadow-2xl hover:shadow-emerald-500/50'
                  : 'bg-cream-100 dark:bg-gray-900 border-cream-200 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-2xl dark:hover:shadow-emerald-500/40'
              } transition-[border-color,box-shadow] duration-300`}
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                plan.highlighted
                  ? 'bg-gradient-to-t from-white to-transparent'
                  : 'bg-gradient-to-br from-emerald-500 to-green-600'
              }`} />

              <div className="relative z-10">
                {/* Status badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 border ${
                  plan.highlighted
                    ? 'bg-white/20 text-white border-white/30'
                    : plan.status === 'Available Now'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600'
                }`}>
                  {plan.status}
                </span>

                <h3 className="text-lg font-bold mb-2 transition-transform duration-300 group-hover:translate-y-1">
                  {plan.name}
                </h3>

                <p className={`text-sm mb-6 font-light ${
                  plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <span className={`font-bold transition-transform duration-300 group-hover:scale-125 ${
                        plan.highlighted ? 'text-white' : 'text-emerald-500'
                      }`}>
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.status === 'Available Now' ? '/gyms' : '/contact'}
                  className={`block w-full py-3 rounded-lg font-bold transition-shadow duration-300 hover:shadow-2xl relative overflow-hidden group/btn text-center ${
                    plan.highlighted
                      ? 'bg-white text-emerald-600 hover:shadow-emerald-500/40'
                      : 'bg-emerald-600 dark:bg-emerald-600 text-white hover:shadow-emerald-500/50'
                  }`}
                >
                  <span className="relative z-10">{plan.status === 'Available Now' ? 'Book a Session' : 'Get Notified'}</span>
                  <div
                    className={`absolute inset-0 transition-all duration-500 opacity-0 group-hover/btn:opacity-100 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-gray-200 to-gray-100'
                        : 'bg-gradient-to-r from-emerald-700 to-green-700'
                    }`}
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Exact pricing dropping soon. Early supporters get first dibs, bragging rights, and Gobhi&apos;s eternal gratitude — it&apos;s all he has to give, he&apos;s a vegetable. 🥦
          </p>
        </div>
      </div>
    </section>
  );
}
