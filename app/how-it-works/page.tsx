'use client';

import { motion } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6 },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[0.65rem] font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
      <span>{children}</span>
      <span className="flex-1 h-px bg-emerald-200 dark:bg-emerald-900 max-w-16" />
    </div>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Discover',
    body: 'Browse live gyms near you — filter by price, amenities, and rating. Every listing shows real session prices and real reviews, so the place you see is the place you get.',
  },
  {
    n: '02',
    title: 'Book a slot',
    body: 'Pick a date and time at least an hour ahead and confirm straight from your wallet. Instant confirmation, no waiting, no phone call, no gym staff to track down.',
  },
  {
    n: '03',
    title: 'Get there & check in',
    body: 'Scan your signed QR at reception, or use geofenced self check-in when you are within 300m of the gym. No cards, no kiosks, no membership desk.',
  },
  {
    n: '04',
    title: 'Pay only for that visit',
    body: 'The session is debited from your wallet when it completes — nothing recurring. Change your plans? Cancel with notice for a 30–100% wallet refund.',
  },
];

const WALLET_CARDS = [
  {
    icon: '👛',
    title: 'Top up in fixed presets',
    body: 'Wallet top-ups come in set amounts — ₹200, ₹500, ₹1,000, or ₹2,000. Bookings and subscriptions debit from your wallet; Razorpay is only ever the top-up lane.',
  },
  {
    icon: '⏱️',
    title: 'Cancellation refunds to wallet',
    body: 'Cancel 8+ hours ahead for 100% back, 4–8 hours for 50%, 1–4 hours for 30%. Inside the last hour the session is on you — no fee beyond the session you booked.',
  },
  {
    icon: '🚫',
    title: 'No membership. Ever.',
    body: 'No joining fee, no 12-month contract, no auto-renew. Each session is a single purchase — the only thing a subscription changes is per-session pricing, and even those never auto-renew.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-cream-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
        <StickerBadge color="terracotta" size={54} rotate={10} delay={0} motion="wiggle" className="absolute top-24 right-[7%] hidden md:flex">🥦</StickerBadge>
        <StickerBadge color="mustard" size={46} rotate={-12} delay={0.5} motion="pulse" className="absolute bottom-20 left-[6%] hidden lg:flex">📅</StickerBadge>

        <div className="container-custom max-w-3xl relative z-10">
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
              For Everyone · No Membership
            </p>
            <h1 className="font-display text-6xl md:text-7xl mb-4">
              <PosterOutline>Book</PosterOutline> <PosterFill color="terracotta">A Session</PosterFill>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Four steps between you and a workout — and not one of them involves a sales pitch, a joining fee, or a
              contract you will forget to cancel.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/gyms" className="btn-primary inline-block">
                Browse Gyms
              </motion.a>
              <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/pricing" className="btn-secondary inline-block">
                See Pricing
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The four steps */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">Open the app. Book. Show up. Train.</h2>
          </motion.div>
          <div className="relative">
            <div className="hidden sm:block absolute left-[27px] top-4 bottom-4 w-px bg-emerald-200 dark:bg-emerald-900" />
            <div className="space-y-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex gap-6 items-start"
                >
                  <div className="shrink-0 w-14 h-14 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white font-display text-xl flex items-center justify-center relative z-10">
                    {step.n}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">{step.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The wallet, plainly */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Eyebrow>Money, Without Mystery</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">
              The wallet rules, <span className="gradient-text">simply stated</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6">
            {WALLET_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="sticker !rounded-2xl p-6 bg-cream-50 dark:bg-gray-950"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{card.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp} className="text-center mt-10">
            <a href="/policies/cancellation" className="text-sm text-gray-500 dark:text-gray-400 underline decoration-gray-300 dark:decoration-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400">
              Full cancellation policy →
            </a>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <motion.div {...fadeUp} className="sticker !rounded-3xl bg-cream-100 dark:bg-gray-900 p-10 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-3">Tonight&apos;s session starts with a tap</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              See who is live near you right now, what a session actually costs, and book in under a minute.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/gyms" className="btn-primary inline-block">
                Find a Gym
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="https://wa.me/919354859197"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-block"
              >
                💬 Questions? WhatsApp Us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}