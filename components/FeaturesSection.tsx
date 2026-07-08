'use client';

import { PosterFill, PosterOutline } from './Poster';

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
    <section className="section-padding bg-white dark:bg-gray-950 transition-colors">
      <div className="container-custom">
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
              className="sticker !rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-900 dark:to-gray-800 hover:!shadow-[5px_5px_0_currentColor] transition-all duration-300 hover:scale-105 hover:-translate-y-1 group cursor-default"
            >
              <div className="text-4xl mb-4 inline-block group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
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
