'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PosterFill, PosterOutline } from './Poster';

const plans = [
  {
    name: 'Basic Access',
    description: 'Perfect for trying it out',
    features: ['Day pass to gyms', 'Flexible booking', 'No commitment'],
    status: 'Available Now',
  },
  {
    name: 'Member Tier',
    description: 'For regular fitness enthusiasts',
    features: ['Unlimited weekly access', 'Priority bookings', 'Member perks'],
    status: 'Launching Soon',
  },
  {
    name: 'Premium Plus',
    description: 'Maximum flexibility and benefits',
    features: ['24/7 access', 'Exclusive venues', 'Premium support'],
    status: 'In Development',
    highlighted: true,
  },
  {
    name: 'Corporate Plans',
    description: 'For teams and organizations',
    features: ['Bulk access', 'Custom solutions', 'Admin dashboard'],
    status: 'Coming Later',
  },
];

export default function PricingSection() {
  const [isInView, setIsInView] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Flexible plans designed for every fitness journey';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.querySelector('[data-pricing-section]');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

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
    <section className="section-padding bg-white dark:bg-gray-950 transition-colors" data-pricing-section>
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-7xl mb-6">
            <PosterOutline>Plans &amp;</PosterOutline> <PosterFill color="mustard">What&apos;s Available</PosterFill>
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
            <div
              key={index}
              className={`group relative p-8 rounded-2xl border transition-all duration-500 hover:scale-105 overflow-hidden ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-2xl border-transparent hover:shadow-2xl hover:shadow-emerald-500/50'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-2xl dark:hover:shadow-emerald-500/40'
              }`}
              style={{
                animation: isInView
                  ? `slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.2 + index * 0.12}s forwards`
                  : 'none',
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              }}
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

                <h3 className="text-lg font-bold mb-2 transition-all duration-300 group-hover:translate-y-1">
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
                      className="flex items-center gap-3 text-sm transition-all duration-300 group-hover:translate-x-1"
                    >
                      <span className={`font-bold transition-all duration-300 group-hover:scale-125 ${
                        plan.highlighted ? 'text-white' : 'text-emerald-500'
                      }`}>
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`block w-full py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group/btn text-center ${
                    plan.highlighted
                      ? 'bg-white text-emerald-600 hover:shadow-emerald-500/40'
                      : 'bg-emerald-600 dark:bg-emerald-600 text-white hover:shadow-emerald-500/50'
                  }`}
                >
                  <span className="relative z-10">{plan.status === 'Available Now' ? 'Learn More' : 'Get Notified'}</span>
                  <div
                    className={`absolute inset-0 transition-all duration-500 opacity-0 group-hover/btn:opacity-100 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-gray-200 to-gray-100'
                        : 'bg-gradient-to-r from-emerald-700 to-green-700'
                    }`}
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Pricing details and exact launch dates will be announced soon. Early supporters get exclusive benefits. 🎉
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
