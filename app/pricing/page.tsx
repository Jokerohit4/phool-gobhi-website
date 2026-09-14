'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const PRICE_CARDS = [
  {
    icon: '🏋️',
    title: 'Sessions are priced by the gym',
    body: 'Every gym sets its own per-session price — today they range from ₹99 to ₹399 across our Gurugram partners. We never mark the price up: the number you see is what you pay.',
  },
  {
    icon: '👛',
    title: 'Wallet top-ups in fixed presets',
    body: 'Top up ₹200, ₹500, ₹1,000, or ₹2,000. Bookings and subscriptions debit from your wallet — Razorpay is only ever the lane that fills it.',
  },
  {
    icon: '↩️',
    title: 'Cancellation refunds to wallet',
    body: 'Cancel 8+ hours ahead: 100% back. 4–8 hours: 50%. 1–4 hours: 30%. Inside the last hour the session is booked and paid. Refunds always land back in your wallet.',
  },
  {
    icon: '📆',
    title: 'Subscriptions are per-gym, optional',
    body: 'Some gyms offer weekly, monthly, or quarterly plans with per-session discounts — prices vary by gym. Bought from your wallet, never auto-renewing.',
  },
  {
    icon: '🤝',
    title: 'Where our money comes from',
    body: "We take a flat commission from the gym on each session. You are never charged a platform fee, a joining fee, or a markup on top of the gym's own price.",
  },
];

const FAQS = [
  {
    q: 'Is there any joining fee or annual contract?',
    a: 'No. Pay-per-session means exactly that — no joining fee, no 12-month commitment. The only way you ever pay is by booking a session (or buying a per-gym plan, which you re-buy only if you want it again).',
  },
  {
    q: 'Why does the price change between gyms?',
    a: 'Each gym sets its own price per session, the same way two restaurants set their own menu prices. A ₹99 crossfit box and a ₹399 boutique studio charge differently because they run differently — the platform takes the same flat commission from the gym either way.',
  },
  {
    q: 'What if I book and cannot make it?',
    a: 'Cancel at least 8 hours before your session for a full refund to your wallet, 4–8 hours for 50%, and 1–4 hours for 30%. Inside the final hour the slot is yours — it can no longer be resold, so no refund is possible.',
  },
  {
    q: 'How do subscriptions work if there are no memberships?',
    a: 'Gyms that offer plans sell discounted weekly, monthly, or quarterly passes. They are paid from your wallet in one go, valid for that gym only, and never auto-renew — when the period ends, you decide whether to buy again.',
  },
  {
    q: 'Do you ever charge me a platform fee on top of the session?',
    a: 'Never. Our commission is taken from the gym, out of your sight. The session price you see on the listing is the complete price you pay.',
  },
];

function FaqItem({ q, a, index, openIndex, setOpenIndex }: { q: string; a: string; index: number; openIndex: number | null; setOpenIndex: (i: number | null) => void }) {
  const isOpen = openIndex === index;
  return (
    <div className="card-premium overflow-hidden">
      <button
        type="button"
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900 dark:text-white">{q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-2xl text-emerald-600 dark:text-emerald-400 shrink-0 leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-cream-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
        <StickerBadge color="mustard" size={54} rotate={12} delay={0} motion="wiggle" className="absolute top-24 right-[7%] hidden md:flex">💰</StickerBadge>
        <StickerBadge color="emerald" size={46} rotate={-12} delay={0.5} motion="pulse" className="absolute bottom-20 left-[6%] hidden lg:flex">✅</StickerBadge>

        <div className="container-custom max-w-3xl relative z-10">
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
              The Honest Numbers
            </p>
            <h1 className="font-display text-6xl md:text-7xl mb-4">
              <PosterOutline>Pay For</PosterOutline> <PosterFill color="terracotta">The Session</PosterFill>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              No membership tiers, no seat counts, no fine-print pricing. Here is exactly how money moves — every number
              on this page is live on the platform today.
            </p>
            <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/gyms" className="btn-primary inline-block">
              See Live Gym Prices
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* The facts */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Eyebrow>What You Actually Pay</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">
              Five rules. <span className="gradient-text">No asterisks.</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PRICE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="sticker !rounded-2xl p-6 bg-cream-100 dark:bg-gray-900"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{card.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-3xl">
          <motion.div {...fadeUp} className="text-center mb-10">
            <Eyebrow>Questions, Answered</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">Everything people ask before booking</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} openIndex={openIndex} setOpenIndex={setOpenIndex} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <motion.div {...fadeUp} className="sticker !rounded-3xl bg-cream-100 dark:bg-gray-900 p-10 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-3">Check a real gym&apos;s price</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Every listing shows its exact session price up front. Go see what training costs near you.
            </p>
            <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/gyms" className="btn-primary inline-block">
              Browse Gyms
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}