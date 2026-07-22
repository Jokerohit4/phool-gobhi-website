'use client';

import { motion } from 'framer-motion';
import PhoolGobhiLogo from './PhoolGobhiLogo';
import PitchStoryAnimation from './PitchStoryAnimation';

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

function Stat({ label, value, desc, link }: { label: string; value: string; desc: string; link?: { href: string; text: string } }) {
  return (
    <div className="card-premium p-6 text-center">
      <div className="text-[0.65rem] font-bold tracking-wide uppercase text-emerald-600 dark:text-emerald-400 mb-2">{label}</div>
      <div className="text-3xl font-black mb-2 tabular-nums">{value}</div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {desc}
        {link && (
          <>
            {' '}
            (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="underline decoration-gray-300 dark:decoration-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400">
              {link.text}
            </a>
            )
          </>
        )}
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-gradient p-6 border-t-4 border-t-emerald-500">
      <h3 className="text-xs font-bold tracking-wide uppercase text-emerald-600 dark:text-emerald-400 mb-3">{title}</h3>
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

export default function PitchDeckContent() {
  return (
    <div className="bg-cream-50 dark:bg-gray-950">
      {/* Cover */}
      <section className="min-h-[80vh] flex items-center section-padding dot-grid bg-cream-50 dark:bg-gray-950">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6"><PhoolGobhiLogo /></div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
              Phool Gobhi · Pre-Seed Proposal · Updated July 2026
            </p>
            <h1 className="text-5xl sm:text-7xl font-display leading-[0.95] tracking-tight mb-6">
              Fitness,<br /><span className="gradient-text">for all.</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl">
              The first move toward a fitter India: removing the friction that keeps half a billion people from ever starting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Part 1 */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>The Problem · Part 1 of 3</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              India is moving less, <span className="gradient-text">not more.</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <Stat label="Physical Inactivity" value="49.4%" desc="of Indian adults — up from 22.3% in 2000, projected ~60% by 2030" link={{ href: 'https://www.indiatvnews.com/health/nearly-50-adults-in-india-insufficiently-physically-active-lancet-study-2024-06-26-938938', text: 'Lancet Global Health, 2024' }} />
              <Stat label="Diabetes Capital" value="~90M+" desc="Indians living with diabetes — among the world's largest diabetic populations" link={{ href: 'https://www.freepressjournal.in/amp/mumbai/world-diabetes-day-2025-india-faces-alarming-rise-with-nearly-90-million-diabetics-experts-warn-of-perfect-storm', text: 'source' }} />
              <Stat label="Rising Obesity" value="~23–24%" desc="of adults overweight or obese, rising fastest in children under 5" link={{ href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11867824/', text: 'NFHS-5' }} />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Inactivity isn&apos;t shared equally — <strong className="text-gray-900 dark:text-white">57% of women</strong> are physically inactive versus <strong className="text-gray-900 dark:text-white">42% of men</strong>. The{' '}
              <a href="https://www.theweek.in/news/health/2026/02/10/economic-survey-2025-26-flags-rising-obesity-diabetes-and-digital-addiction-in-india.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 dark:hover:text-emerald-400">
                Economic Survey 2025–26
              </a>{' '}
              now flags obesity and diabetes as a workforce productivity risk, not just a health one.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Part 2 */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>The Problem · Part 2 of 3</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              Even the people who try <span className="gradient-text">don&apos;t stay.</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <Stat label="Gym Penetration" value="12.3M" desc="fitness facility members nationally (2024) — under 1% of 1.4B people" link={{ href: 'https://www.deloitte.com/in/en/about/press-room/indias-fitness-market-to-double-by-2030-per-a-deloitte-and-hfa-report.html', text: 'Deloitte/HFA 2025' }} />
              <Stat label="Annual Dropout" value="70–80%" desc="of Indian gym members don't renew past year one — ~30% annual retention" link={{ href: 'https://wifitalents.com/india-fitness-industry-statistics/', text: 'industry data' }} />
              <Stat label="Paid Conversion" value="~15%" desc="of India's physically active population pays for any fitness activity at all" link={{ href: 'https://www.healthclubmanagement.co.uk/health-club-management-features/India-rising/38088', text: 'HCM 2025' }} />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              And it&apos;s an uneven sliver:{' '}
              <a href="https://www.indiaspend.com/health/9-in-10-indians-do-not-exercise-977727" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 dark:hover:text-emerald-400">
                among urban men, 19.5% exercise versus 11.4% in rural areas; among women, 8.1% urban versus just 3.1% rural
              </a>
              . <strong className="text-gray-900 dark:text-white">The problem isn&apos;t only inactivity — the paid model itself pushes people back out.</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Part 3 */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>The Problem · Part 3 of 3</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              The demand is proven. <span className="gradient-text">The delivery isn&apos;t built.</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">18.8 Cr</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  cumulative participants in the government&apos;s{' '}
                  <a href="https://grokipedia.com/page/Fit_India_Movement" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 dark:hover:text-emerald-400">
                    Fit India Freedom Run, 2020–2025
                  </a>{' '}
                  — proof Indians will show up for a fitness moment.
                </p>
              </div>
              <div>
                <div className="text-3xl font-black mb-2 tabular-nums">2019 / 2017</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <a href="https://yas.nic.in/sports/khelo-india-national-programme-development-sports-0" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 dark:hover:text-emerald-400">
                    Fit India Movement and Khelo India
                  </a>{' '}
                  launched — the national goal has been named and funded for years.
                </p>
              </div>
              <div>
                <div className="text-3xl font-black text-red-500 mb-2">0</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  consumer products that turn a one-day run or cycling Sunday into an everyday, accessible fitness habit.
                </p>
              </div>
            </div>
            <div className="card-premium p-6 text-center font-bold text-gray-700 dark:text-gray-300">
              The government has shown 188 million people will show up once.{' '}
              <span className="text-emerald-600 dark:text-emerald-400">Nobody has built the product that gets them to come back.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* At a Glance */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>At a Glance</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              Getting India fit, <span className="gradient-text">one friction point at a time.</span>
            </h2>
            <ul className="space-y-4 text-gray-700 dark:text-gray-300">
              {[
                <><strong className="text-gray-900 dark:text-white">The mission:</strong> close the gap between India&apos;s national fitness goal and the 49.4% of adults who are physically inactive.</>,
                <><strong className="text-gray-900 dark:text-white">The first move:</strong> remove the #1 barrier — rigid, upfront memberships — with pay-per-session gym access.</>,
                <><strong className="text-gray-900 dark:text-white">Built:</strong> MVP live end-to-end — customer + partner apps, payments, booking, check-in.</>,
                <><strong className="text-gray-900 dark:text-white">Validated:</strong> 30 Gurugram gyms surveyed directly — 9 ready to onboard now, 14 more interested pending an MVP demo.</>,
                <><strong className="text-gray-900 dark:text-white">Launching:</strong> August 1, 2026 — Delhi NCR.</>,
                <><strong className="text-gray-900 dark:text-white">Raising:</strong> ₹50 Lakhs for 8% equity — ₹15L already promised by friends &amp; family.</>,
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-emerald-500 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Executive Summary</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-6">
              A flexible fitness marketplace — <span className="gradient-text">and a first step.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Phool Gobhi is a flexible fitness marketplace that lets users discover and access gyms and fitness centers in their locality without the hassle of long-term memberships. Users pay per session, explore different workout styles, and build a fitness habit without a financial leap of faith.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              As the previous sections show, this is our first move in a larger mission: closing the gap between India&apos;s national fitness ambitions and the reality that nearly half its adults don&apos;t move enough. We are seeking pre-seed investment to scale an MVP that is already built, onboard partner gyms already validated through direct outreach, and build traction through a focused Delhi NCR launch on{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">August 1, 2026</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Business Overview */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Business Overview</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-6">
              The access layer for <span className="gradient-text">a fitter India.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Phool Gobhi addresses the modern urban individual&apos;s need for flexibility and variety in fitness. Unlike traditional gym memberships, we provide a zero-commitment model where users only pay when they use a service — the first, most tractable layer of a much bigger problem.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card title="Company Vision">To be the access layer for a fitter India — making the first gym session effortless, then building habit, community, and intelligence on top.</Card>
              <Card title="Business Model">B2C aggregator app with transactional monetization and optional value-add subscriptions — built to become a well-rounded, community-centric, data-driven platform.</Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Approach + Story Animation */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Our Approach</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-4">
              Book a gym session the way you&apos;d book <span className="gradient-text">a cab.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The previous sections laid out the problem in full — inactivity, dropout, and a government-proven appetite with nowhere to land. Here&apos;s our answer, dramatized in 30 seconds:
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="mb-10">
            <PitchStoryAnimation />
          </motion.div>
          <motion.div {...fadeUp} className="grid sm:grid-cols-2 gap-4">
            <Card title="Aggregated Access">
              <ul className="space-y-2">
                <li>— Discover nearby gyms with transparent, pay-per-session pricing</li>
                <li>— Instant, real-time slot booking — no lock-in, no upfront leap of faith</li>
              </ul>
            </Card>
            <Card title="Aligned Incentives">
              <ul className="space-y-2">
                <li>— Gyms earn from idle off-peak capacity instead of losing it</li>
                <li>— Users pay only for sessions they actually attend</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Market Opportunity</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              A growing market, <span className="gradient-text">barely reaching anyone.</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Stat label="TAM" value="₹7.2L Cr" desc="50M fitness-aware urban Indians · ₹14,400 avg annual spend" />
              <Stat label="SAM" value="₹7,200 Cr" desc="Metro & Tier 1 cities · 5M early adopters" />
              <Stat label="SOM" value="₹36 Cr" desc="25,000 initial users · 0.5% market capture" />
            </div>
            <div className="space-y-3 mb-4">
              {[
                { label: 'TAM', pct: 100, val: '₹7.2L Cr', color: 'from-emerald-600 to-emerald-500' },
                { label: 'SAM', pct: 66, val: '₹7,200 Cr', color: 'from-emerald-500 to-emerald-400' },
                { label: 'SOM (initial)', pct: 27, val: '₹36 Cr', color: 'from-amber-500 to-amber-400' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-600 dark:text-gray-400 text-right shrink-0">{b.label}</div>
                  <div className="flex-1 h-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${b.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${b.color}`}
                    />
                  </div>
                  <div className="w-24 text-sm font-bold shrink-0">{b.val}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Bar widths shown on a log scale to visualize relative order of magnitude. Formal fitness market penetration is projected at just 1.7% by 2030 (
              <a href="https://www.deloitte.com/in/en/about/press-room/indias-fitness-market-to-double-by-2030-per-a-deloitte-and-hfa-report.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 dark:hover:text-emerald-400">
                Deloitte/HFA
              </a>
              ) — the addressable headroom sits almost entirely outside the current membership model.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Proof of Concept */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Proof of Concept</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-6">
              We didn&apos;t guess. <span className="gradient-text">We asked.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We surveyed 30 gyms directly, across Gurugram:</p>
            <div className="flex h-11 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 mb-4 text-white text-xs sm:text-sm font-bold">
              <motion.div initial={{ width: 0 }} whileInView={{ width: '30%' }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="bg-emerald-500 flex items-center justify-center overflow-hidden whitespace-nowrap">9 · Ready to onboard</motion.div>
              <motion.div initial={{ width: 0 }} whileInView={{ width: '46.7%' }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 }} className="bg-emerald-700 flex items-center justify-center overflow-hidden whitespace-nowrap">14 · Interested, want MVP demo</motion.div>
              <motion.div initial={{ width: 0 }} whileInView={{ width: '23.3%' }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 }} className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center overflow-hidden whitespace-nowrap">7 · Not yet confident</motion.div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              <strong className="text-emerald-600 dark:text-emerald-400">77% of gyms surveyed showed real interest</strong> — driven by the promise of new footfall and a digital presence most don&apos;t currently have.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card title="Customer Signal">In parallel customer conversations, response has been close to unanimous — the flexibility and independence of pay-per-session access resonates immediately, with no meaningful pushback on the model.</Card>
              <Card title="Product Readiness">MVP is built and live end-to-end — customer + partner Android apps, Razorpay-powered wallet payments, gym discovery, slot booking, and QR check-in, on a backend already deployed on Railway.</Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Product — What&apos;s Built</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              Pre-launch. <span className="gradient-text">MVP complete.</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Card title="Customer App (Android)">
                <ul className="space-y-2">
                  <li>— Phone + OTP authentication</li>
                  <li>— Gym browse &amp; search</li>
                  <li>— Slot booking with Razorpay wallet</li>
                  <li>— QR-based gym check-in</li>
                  <li>— Reviews + push notifications</li>
                </ul>
              </Card>
              <Card title="Partner App (Android)">
                <ul className="space-y-2">
                  <li>— Gym onboarding wizard</li>
                  <li>— Sales dashboard — daily / weekly / monthly</li>
                  <li>— Slot &amp; booking management</li>
                  <li>— Document upload for verification</li>
                  <li>— FCM push notifications</li>
                </ul>
              </Card>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              <strong className="text-emerald-600 dark:text-emerald-400">Backend:</strong> 5 microservices, live on Railway. This is a working end-to-end flow today — not a mockup.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Data & AI */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>The Platform Layer</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-6">
              Not tech-enabled. <span className="gradient-text">Tech-based.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              A booking app with a backend is tech-enabled. What we&apos;re building is tech-based: every session, booking, cancellation, and check-in becomes structured behavioral data from day one, feeding a growing intelligence layer.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8 text-gray-700 dark:text-gray-300">
              <p>— <strong className="text-gray-900 dark:text-white">Personalized recommendations</strong> — the right gym, the right workout, for the right person</p>
              <p>— <strong className="text-gray-900 dark:text-white">Predictive dynamic pricing</strong> — forecast demand, don&apos;t just react to it</p>
              <p>— <strong className="text-gray-900 dark:text-white">Churn prediction</strong> — catch the drift before it happens</p>
              <p>— <strong className="text-gray-900 dark:text-white">Predictive crowd intelligence, gym-buddy &amp; streak layers</strong> — built on the same dataset</p>
            </div>
            <div className="card-premium p-6 text-center font-bold text-gray-700 dark:text-gray-300">
              No competitor in India&apos;s fitness market is building around session-level behavioral data.{' '}
              <span className="text-emerald-600 dark:text-emerald-400">That dataset is the moat.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GTM */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Go-To-Market Strategy</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              Gurugram first — <span className="gradient-text">de-risked by design.</span>
            </h2>
            <div className="space-y-6">
              {[
                { n: '01', name: 'Launch: Gurugram / Delhi NCR', desc: 'De-risked by direct relationships with the 9 gyms already validated as ready to onboard from our own survey.' },
                { n: '02', name: 'Expansion', desc: 'Bengaluru and wider Delhi NCR next, then Tier 2/3 cities based on waitlist demand, partner inquiries, and a city-readiness score (gym density × population × digital penetration).' },
                { n: '03', name: 'Acquisition', desc: 'Local influencer partnerships, gym-partner co-promotions, and community events drive early, low-CAC acquisition.' },
              ].map((row) => (
                <div key={row.n} className="flex gap-6 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-none last:pb-0">
                  <div className="text-2xl font-black text-gray-300 dark:text-gray-700 w-12 shrink-0">{row.n}</div>
                  <div>
                    <div className="font-bold mb-1">{row.name}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Revenue */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Revenue Model</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              Multiple lines, <span className="gradient-text">one core loop.</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card title="Core">Platform commission per session (5–20%), depending on the booking cycle.</Card>
              <Card title="Add-on">Subscription revenue for priority features and bundled sessions.</Card>
              <Card title="Ecosystem">Sponsored listings and local brand integrations.</Card>
              <Card title="Future">Corporate wellness partnerships.</Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Risk */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Risk &amp; Mitigation</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">
              What could go wrong, <span className="gradient-text">and what we do about it.</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ['Slow gym onboarding', 'Incentivized trials, no-integration sign-up flow'],
                    ['Low user retention', 'Community streaks, gamified progression, wallets, workshops, meetups'],
                    ['Pricing pressure', 'Dynamic pricing, bundled discounts'],
                    ['High CAC', 'Referral programs, local partnerships'],
                    ['Operational hazard', 'Prediction of user behaviour via real-time data collection and analysis, backed by strong data governance'],
                    ['Inconsistent user experience', 'Clear SLAs, quality assurance visits, ratings-based fines and rewards'],
                  ].map((row) => (
                    <tr key={row[0]} className="border border-gray-200 dark:border-gray-800">
                      <td className="p-3 font-bold uppercase text-xs text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-800 w-56 align-top">{row[0]}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 align-top">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ask */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <Eyebrow>
              <span className="mx-auto">Financial Ask</span>
            </Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-display mb-8">Closing the round.</h2>
            <div className="card-gradient p-8">
              <div className="text-5xl font-black mb-2">₹50 Lakhs</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">for 8% equity · 12–14 month runway</p>
              <div className="inline-block px-4 py-2 rounded-lg bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold text-sm mb-6">
                ₹15L already promised by friends &amp; family — ₹35L open
              </div>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {['5,000 users within 6 months of launch', '100 partner gyms across 2 cities', '₹10–15L monthly GMV by Month 10'].map((m) => (
                  <div key={m} className="px-4 py-2 bg-cream-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">{m}</div>
                ))}
              </div>
              <div className="flex justify-center gap-8">
                {[['40%', 'Product'], ['30%', 'Marketing'], ['20%', 'Gym Onboarding'], ['10%', 'Team']].map(([pct, lbl]) => (
                  <div key={lbl}>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-500 tabular-nums">{pct}</div>
                    <div className="text-[0.65rem] uppercase tracking-wide text-gray-500 dark:text-gray-500">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">Friends &amp; family commitment is verbal at this stage, not yet formalized.</p>
          </motion.div>
        </div>
      </section>

      {/* Sources */}
      <section className="section-padding bg-cream-100 dark:bg-gray-900">
        <div className="container-custom max-w-5xl">
          <motion.div {...fadeUp}>
            <Eyebrow>Sources</Eyebrow>
            <h2 className="text-2xl sm:text-3xl font-display mb-8">Research referenced in this deck.</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
              {[
                ['Physical inactivity trend (49.4%, gender split)', 'https://www.indiatvnews.com/health/nearly-50-adults-in-india-insufficiently-physically-active-lancet-study-2024-06-26-938938', 'indiatvnews.com — Lancet Global Health study coverage, 2024'],
                ['Gym dropout / annual retention rates', 'https://wifitalents.com/india-fitness-industry-statistics/', 'wifitalents.com — India Fitness Industry statistics'],
                ['Diabetes burden (~90M+)', 'https://www.freepressjournal.in/amp/mumbai/world-diabetes-day-2025-india-faces-alarming-rise-with-nearly-90-million-diabetics-experts-warn-of-perfect-storm', 'freepressjournal.in — World Diabetes Day 2025 coverage'],
                ['Paid fitness conversion (~15%)', 'https://www.healthclubmanagement.co.uk/health-club-management-features/India-rising/38088', 'healthclubmanagement.co.uk — India Fitness Market Report 2025'],
                ['Obesity rates, NFHS-5', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11867824/', 'pmc.ncbi.nlm.nih.gov — obesity cohort study citing NFHS-5'],
                ['Urban/rural & gender exercise gap', 'https://www.indiaspend.com/health/9-in-10-indians-do-not-exercise-977727', 'indiaspend.com — exercise participation data'],
                ['Economic Survey 2025–26 productivity risk', 'https://www.theweek.in/news/health/2026/02/10/economic-survey-2025-26-flags-rising-obesity-diabetes-and-digital-addiction-in-india.html', 'theweek.in — Economic Survey coverage'],
                ['Fit India Freedom Run participation (18.8 Cr)', 'https://grokipedia.com/page/Fit_India_Movement', 'grokipedia.com — Fit India Movement overview'],
                ['Gym membership penetration, market size & CAGR', 'https://www.deloitte.com/in/en/about/press-room/indias-fitness-market-to-double-by-2030-per-a-deloitte-and-hfa-report.html', 'deloitte.com — India Fitness Market Report 2025 (Deloitte/HFA)'],
                ['Fit India Movement & Khelo India, official', 'https://yas.nic.in/sports/khelo-india-national-programme-development-sports-0', 'yas.nic.in — Ministry of Youth Affairs and Sports'],
              ].map(([title, href, label]) => (
                <div key={href}>
                  <div className="font-bold text-gray-900 dark:text-white mb-0.5">{title}</div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline break-all">
                    {label}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="section-padding text-center">
        <div className="container-custom">
          <motion.div {...fadeUp}>
            <div className="flex justify-center mb-4"><PhoolGobhiLogo /></div>
            <Eyebrow><span className="mx-auto">For Inquiries</span></Eyebrow>
            <h2 className="text-3xl font-display mb-4">Contact <span className="gradient-text">Us</span></h2>
            <p className="text-gray-600 dark:text-gray-400">
              <a href="https://www.phoolgobhi.com/" className="hover:text-emerald-600 dark:hover:text-emerald-400">www.phoolgobhi.com</a>
              {' · '}
              <a href="mailto:me@rohitashwa.co.in" className="hover:text-emerald-600 dark:hover:text-emerald-400">me@rohitashwa.co.in</a>
              {' · '}
              <a href="https://wa.me/919354859197" className="hover:text-emerald-600 dark:hover:text-emerald-400">+91 9354859197</a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
