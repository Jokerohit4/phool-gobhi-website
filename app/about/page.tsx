'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PhoolGobhiLogo from '@/components/PhoolGobhiLogo';

export default function AboutPage() {
  return (
    <section className="min-h-screen section-padding bg-white dark:bg-gray-950">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6"><PhoolGobhiLogo /></div>
          <h1 className="text-5xl font-black mb-4">
            About <span className="gradient-text">Phool Gobhi</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The first move toward a fitter India.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed mb-16"
        >
          <p>
            Nearly half of Indian adults are physically inactive today — a number that has more than doubled since
            2000 and keeps climbing. The government has already named getting India fit as a national priority. What
            it hasn&apos;t built is the everyday product that turns that ambition into a habit for the average person.
          </p>
          <p>
            Phool Gobhi is that product. We&apos;re a pay-per-session gym marketplace — book a session the way you&apos;d
            book a cab, with no long-term membership and no upfront leap of faith. It&apos;s a small, deliberate first
            step: remove the single biggest barrier to starting, then build the habit, community, and intelligence
            layers on top.
          </p>
          <p>
            We&apos;re a pre-launch startup based in Gurugram, building toward an August 2026 launch, backed by an
            MVP that&apos;s already live end-to-end and gyms who&apos;ve already told us they&apos;re ready to onboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card-gradient p-10 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Curious about the business behind the app?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            We share the full investor story — the problem, the market, our traction, and what we&apos;re raising —
            with people we&apos;ve shared this link with directly.
          </p>
          <Link href="/pitch-deck" className="btn-primary inline-block">
            Refer to Pitch Deck
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
