'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';
import PartnerStoryAnimation from '@/components/PartnerStoryAnimation';

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
    title: 'Apply in minutes',
    body: "Tell us about your gym — location, capacity, whatever's relevant — or sign up directly and start the onboarding wizard.",
  },
  {
    n: '02',
    title: 'Add your gym',
    body: 'Photos, verification documents, amenities, and your own per-slot pricing. You decide what a session costs, not us.',
  },
  {
    n: '03',
    title: 'We review and approve',
    body: 'Our team checks your listing and documents before it goes live, so customers can trust every gym on the platform — including yours.',
  },
  {
    n: '04',
    title: 'Get booked, get paid',
    body: 'Customers nearby book open slots, check in by QR or geofenced self check-in, and your share lands in your wallet automatically.',
  },
];

const MODEL_CARDS = [
  {
    icon: '💸',
    title: 'One commission. That’s it.',
    body: 'No listing fee, no monthly subscription, no setup cost. Phool Gobhi takes a single, transparent 20% commission per session — you keep 80% of every booking.',
  },
  {
    icon: '👛',
    title: 'Automatic, transparent payouts',
    body: 'Every completed session credits your Phool Gobhi wallet in real time, already net of commission — no reconciling invoices. When you want it in your bank account, our team processes the payout.',
  },
  {
    icon: '🎛️',
    title: 'You set the price',
    body: 'You control per-slot pricing in your dashboard — peak, off-peak, weekend, whatever fits your gym. We just bring you the customer.',
  },
  {
    icon: '🚪',
    title: 'No lock-in',
    body: "List one gym or five. Pause or deactivate a listing whenever you want — there's no annual contract binding you to the platform.",
  },
];

const FAQS = [
  {
    q: 'How much does Phool Gobhi actually take?',
    a: 'A flat 20% commission on the price of each completed session — you set that price, we don\'t mark it up. There is no separate listing fee or monthly charge on top of that.',
  },
  {
    q: 'How and when do I get paid?',
    a: "Your share of every completed session is credited to your Phool Gobhi wallet automatically, the moment the session closes out. You can watch that balance grow in real time from your partner dashboard. Payouts from wallet to your bank account are currently processed by our team on request — self-serve instant withdrawal is on our roadmap.",
  },
  {
    q: 'Is there a contract or minimum commitment?',
    a: 'No. You can list a gym, pause it, or deactivate it whenever you like. We\'d rather earn your listing every month than lock you into one.',
  },
  {
    q: 'What do I need to get approved?',
    a: 'Basic gym details, a few photos, and a verification document (ownership or authorization proof) under 10MB. Our team reviews every submission before it goes live — we\'d rather move a little slower than let an unverified listing onto the map.',
  },
  {
    q: 'How does check-in and attendance actually work?',
    a: "Customers check in with a signed QR code at your entrance, or via geofenced self check-in on their phone — no extra hardware or front-desk workflow for your staff. You can also verify attendance manually from your dashboard if needed.",
  },
  {
    q: 'Where is Phool Gobhi live right now?',
    a: "We're onboarding gyms in Gurugram first, with Delhi NCR and Bengaluru next. If you're outside those cities, apply anyway — supply is exactly what determines where we expand next.",
  },
  {
    q: 'Can I run more than one gym on the account?',
    a: 'Yes — the partner app and dashboard support multiple gyms under one account, with a switcher to manage schedules, pricing, and bookings for each separately.',
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

export default function PartnershipsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-cream-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
        <StickerBadge color="terracotta" size={54} rotate={10} delay={0} motion="wiggle" className="absolute top-24 right-[7%] hidden md:flex">🤝</StickerBadge>
        <StickerBadge color="emerald" size={46} rotate={-12} delay={0.5} motion="pulse" className="absolute bottom-20 left-[6%] hidden lg:flex">🏋️</StickerBadge>

        <div className="container-custom max-w-3xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
              For Gym Owners &amp; Partners
            </p>
            <h1 className="font-display text-6xl md:text-7xl mb-4">
              <PosterOutline>Partner</PosterOutline> <PosterFill color="terracotta">With Gobhi</PosterFill>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Your gym already has empty hours every day. We fill them with customers who pay per session — you keep
              running your gym exactly the way you already do.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/partner/apply" className="btn-primary inline-block">
                List Your Gym
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="https://calendly.com/partners-phoolgobhi/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-block"
              >
                Book a 30-min Call
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The story, animated */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <motion.div {...fadeUp} className="text-center mb-10">
            <Eyebrow>See It In 18 Seconds</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-3">
              From <span className="gradient-text">empty slot</span> to <span className="gradient-text">wallet credit</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              This is the entire loop, start to finish — no fine print hiding in a PDF.
            </p>
          </motion.div>
          <motion.div {...fadeUp}>
            <PartnerStoryAnimation />
          </motion.div>
        </div>
      </section>

      {/* Why partner */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Eyebrow>Why Gym Owners Partner With Us</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">
              You already paid for the capacity. <span className="gradient-text">Let&apos;s sell it.</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {MODEL_CARDS.map((card, i) => (
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
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">Four steps. No paperwork marathon.</h2>
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

      {/* FAQ */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-3xl">
          <motion.div {...fadeUp} className="text-center mb-10">
            <Eyebrow>The Fine Print, Plainly Stated</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">Questions gym owners actually ask</h2>
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
            <h2 className="font-display text-3xl md:text-4xl mb-3">Let&apos;s figure it out together</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              List your gym, book a call, or just ask a question first — whatever&apos;s easiest.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/partner/apply" className="btn-primary inline-block">
                List Your Gym
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="https://calendly.com/partners-phoolgobhi/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-block"
              >
                Book a Call
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="https://wa.me/919354859197"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-block"
              >
                💬 WhatsApp Us
              </motion.a>
            </div>
            <a href="mailto:partners@phoolgobhi.com" className="text-sm text-gray-500 dark:text-gray-400 underline decoration-gray-300 dark:decoration-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400">
              partners@phoolgobhi.com
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
