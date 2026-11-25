'use client';

import { WHATSAPP_URL } from '@/lib/contact';
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
    <div className="flex items-center gap-3 text-[0.75rem] font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
      <span>{children}</span>
      <span className="flex-1 h-px bg-emerald-200 dark:bg-emerald-900 max-w-16" />
    </div>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Tell Gobhi your goal',
    body: 'Pick what you are working toward: fitness at home or at your gym, building better habits, or looking after your wellbeing. Gobhi builds a weekly plan that fits your routine, with room for rest.',
  },
  {
    n: '02',
    title: 'Log your day, the easy way',
    body: 'Water, meals, workouts and more, each in a tap or two. Snap a photo of your food, and connect Apple Health or Google Fit so your activity and sleep can come in without typing. Every little log counts.',
  },
  {
    n: '03',
    title: 'Add your health records',
    body: 'Upload your lab reports to your health vault. Gobhi reads out the numbers, and you check them before they are saved, so nothing counts until you say so.',
  },
  {
    n: '04',
    title: 'See how you are really doing',
    body: 'Your health score, trends over time and a weekly recap show how things are changing, with context around each reading instead of one number on its own. Streaks, gym buddies and Gobhi coins keep you coming back.',
  },
];

const CONTROL_CARDS = [
  {
    icon: '🔒',
    title: 'You choose what to share',
    body: 'Features that use your health information, like the Gobhi assistant, ask for your consent first. Read how your data is handled in our privacy policy, and delete your account whenever you like.',
  },
  {
    icon: '🩺',
    title: 'A companion, not a doctor',
    body: 'Phool Gobhi does not diagnose conditions or estimate your odds of getting a disease. It helps you make everyday choices and organise your information for a conversation with your doctor.',
  },
  {
    icon: '🤝',
    title: 'Better together',
    body: 'Find a gym buddy, chat with your matches and share your wins. Showing up is easier when someone is showing up with you.',
  },
];

const COMING_CARDS = [
  {
    title: 'Useful early signals',
    body: 'When something drifts from your usual pattern, a practical next step to consider that week.',
  },
  {
    title: 'Regular check-ins',
    body: 'Planned lab tests and doctor reviews, so you can check in on your health even when you feel well.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-cream-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
        <StickerBadge color="terracotta" size={54} rotate={10} delay={0} motion="wiggle" className="absolute top-24 right-[7%] hidden md:flex">🥦</StickerBadge>
        <StickerBadge color="mustard" size={46} rotate={-12} delay={0.5} motion="pulse" className="absolute bottom-20 left-[6%] hidden lg:flex">📈</StickerBadge>

        <div className="container-custom max-w-3xl relative z-10">
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
              A health companion for everyday life
            </p>
            <h1 className="font-display text-6xl md:text-7xl mb-4">
              <PosterOutline>Set a goal.</PosterOutline> <PosterFill color="terracotta">Gobhi keeps track.</PosterFill>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Four steps from &ldquo;I want to feel better&rdquo; to a clearer picture of your health, one little win at a time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/#join" className="btn-primary inline-block">
                Get the app
              </motion.a>
              <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/about" className="btn-secondary inline-block">
                About Phool Gobhi
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
            <h2 className="text-3xl sm:text-4xl font-display">Open the app. Log a little. See the picture.</h2>
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
                  <div className="shrink-0 w-14 h-14 rounded-full bg-emerald-600 dark:bg-emerald-600 text-white font-display text-xl flex items-center justify-center relative z-10">
                    {step.n}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{step.title}</h3>
                    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">{step.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Control, honesty, company */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Eyebrow>Your Health, Your Call</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">
              Built to be <span className="gradient-text">trusted</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6">
            {CONTROL_CARDS.map((card, i) => (
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
          <motion.div {...fadeUp} className="text-center mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="/policies/privacy" className="text-sm text-gray-600 dark:text-gray-400 underline decoration-gray-300 dark:decoration-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400">
              Privacy policy
            </a>
            <a href="/policies/delete-account" className="text-sm text-gray-600 dark:text-gray-400 underline decoration-gray-300 dark:decoration-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400">
              Delete your account
            </a>
          </motion.div>
        </div>
      </section>

      {/* On the way */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-10">
            <Eyebrow>On The Way</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display">What we are building next</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The steps above are in the app. These are the next pieces, and we will say so plainly when each one is ready.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {COMING_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="sticker !rounded-2xl p-6 bg-cream-100 dark:bg-gray-900"
              >
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{card.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <motion.div {...fadeUp} className="sticker !rounded-3xl bg-cream-100 dark:bg-gray-900 p-10 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-3">Your first little win starts with a tap</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Meet Gobhi, set a goal and log your first glass of water. It takes about a minute.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} href="/#join" className="btn-primary inline-block">
                Get the app
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href={WHATSAPP_URL}
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
