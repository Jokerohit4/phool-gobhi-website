'use client';

import { PosterFill, PosterOutline, StickerBadge } from './Poster';

const features = [
  {
    icon: '🔍',
    title: 'Discover Gyms',
    description: 'Browse hundreds of gyms near you with detailed information and ratings.',
  },
  {
    icon: '📅',
    title: 'Flexible Booking',
    description: 'Book sessions as you go. No long-term commitments or hidden fees.',
  },
  {
    icon: '💳',
    title: 'Affordable Pricing',
    description: 'Pay per session or choose monthly plans that fit your budget.',
  },
  {
    icon: '⭐',
    title: 'Top Rated',
    description: 'Connect with verified gyms and read honest reviews from real members.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative section-padding bg-cream-50 dark:bg-gray-950 transition-colors overflow-hidden">
      <StickerBadge color="emerald" size={52} rotate={-14} delay={0.2} motion="pulse" className="absolute top-16 left-[4%] hidden lg:flex">🎯</StickerBadge>
      <StickerBadge color="terracotta" size={46} rotate={10} delay={0.8} motion="wiggle" className="absolute top-24 right-[6%] hidden md:flex">🔥</StickerBadge>
      <StickerBadge color="mustard" size={50} rotate={-8} delay={1.4} className="absolute bottom-10 right-[3%] hidden lg:flex">🏆</StickerBadge>
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-7xl mb-4">
            <PosterOutline>Why Choose</PosterOutline> <PosterFill color="emerald">Phool Gobhi?</PosterFill>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Simple, transparent, and designed for your fitness goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="sticker !rounded-2xl p-6 bg-cream-100 dark:bg-gray-900 hover:shadow-md dark:hover:!shadow-[5px_5px_0_currentColor] transition-all duration-300 hover:scale-105 hover:-translate-y-1 group cursor-default"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
