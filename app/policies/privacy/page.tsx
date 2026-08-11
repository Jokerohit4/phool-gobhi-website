import type { Metadata } from 'next';
import Link from 'next/link';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

export const metadata: Metadata = {
  title: 'Privacy Policy | Phool Gobhi',
  description: 'What data Phool Gobhi collects, why, and how it is used.',
  alternates: { canonical: '/policies/privacy' },
};

export default function PrivacyPage() {
  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="emerald" size={46} rotate={10} delay={0.3} motion="wiggle" className="absolute top-24 right-[6%] hidden lg:flex">🔒</StickerBadge>

      <div className="container-custom max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl md:text-6xl mb-4">
            <PosterOutline>Privacy</PosterOutline> <PosterFill color="emerald">Policy</PosterFill>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Last updated 11 August 2026.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Who we are</h2>
            <p>
              Phool Gobhi (&quot;we&quot;, &quot;us&quot;) operates a marketplace that lets you book gym
              sessions and memberships, and match with workout buddies. This policy explains what personal
              data we collect, why we collect it, and the choices you have.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. What we collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Contact and identity:</strong> your phone number (required for OTP sign-in), name, email address (optional), gender, date of birth, and fitness goals.</li>
              <li><strong>Profile content:</strong> a profile photo you choose to add, and — if you use Buddy matching — your buddy bio, buddy photos, social media link, and chat messages.</li>
              <li><strong>Booking &amp; payment data:</strong> booking history, wallet balance and transaction history, and subscription purchases. Card/UPI details are handled entirely by our payment processor, Razorpay — we never see or store your card number, CVV, or UPI PIN.</li>
              <li><strong>Location:</strong> used to show gyms near you, and at check-in time to confirm you&apos;re actually at the gym you booked (geofence check). With your consent, your location is also used to rank Buddy discovery candidates. It is not tracked continuously or stored as a location history.</li>
              <li><strong>Referral data:</strong> a referral code if you redeem one, so the person who invited you can be credited.</li>
              <li><strong>Usage data:</strong> app and website interactions (screens viewed, buttons tapped, searches, bookings, top-ups, check-ins) via our own first-party analytics — no third party receives this data.</li>
              <li><strong>Device data:</strong> app version, device model and OS, and a push-notification token (Firebase Cloud Messaging) so we can notify you about your bookings.</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. How we use it</h2>
            <p>
              To operate the core service: creating your account, showing nearby gyms, processing bookings,
              payments and top-ups, verifying check-ins, running Buddy matching and chat, showing your
              booking/wallet history, and sending transactional notifications (booking confirmed, cancelled,
              completed). We also use aggregated, non-identifying usage data to understand and improve the
              product, and we review user reports of other users&apos; profiles or chat messages to keep the
              community safe.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Who we share it with</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Partner gyms</strong> see your name and profile photo for bookings at their gym, so they can recognize you at check-in — they never see your phone number or email.</li>
              <li><strong>Other Buddy users</strong> see the buddy profile and chat content you choose to share. Please do not share personal contact details with people you have just met.</li>
              <li><strong>Razorpay</strong> processes payments directly; we share only what&apos;s needed to complete a transaction.</li>
              <li><strong>Firebase (Google)</strong> delivers push notifications; Fast2SMS delivers OTPs.</li>
              <li>We do not sell your personal data to anyone, or share it with advertisers.</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Data retention &amp; deletion</h2>
            <p>
              We keep account and transaction data for as long as your account is active, and for a reasonable
              period afterward as needed for accounting, dispute resolution, and legal compliance. You can
              request deletion of your account and associated personal data at any time from inside the app
              (Profile &rarr; Delete Account) or by emailing us — this removes your profile, buddy profile,
              bookings, wallet balance and referrals. Some transaction records may be retained where required
              by law (e.g. financial record-keeping obligations).
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Your rights</h2>
            <p>
              Under India&apos;s Digital Personal Data Protection Act, you have the right to access, correct, and
              request deletion of your personal data, and to withdraw consent for processing that relies on it. To
              exercise any of these, contact us at{' '}
              <a href="mailto:hello@phoolgobhi.com" className="text-emerald-600 dark:text-emerald-400 underline">
                hello@phoolgobhi.com
              </a>
              . We&apos;ll respond within a reasonable time and, where legally required, notify you of any data
              breach affecting your information.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Cookies (website)</h2>
            <p>
              The website uses a session cookie to keep you logged in, and a local preference for light/dark theme.
              We do not use third-party advertising or tracking cookies. See our{' '}
              <Link href="/policies/terms" className="text-emerald-600 dark:text-emerald-400 underline">
                Terms of Service
              </Link>{' '}
              for more.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">8. Children&apos;s privacy</h2>
            <p>
              Phool Gobhi is for users aged 18 and over. We do not knowingly collect data from anyone under 13.
              If you believe a child has provided us personal data, contact us and we will delete it.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">9. Changes to this policy</h2>
            <p>
              We may update this policy as the product evolves. Material changes will be reflected by the
              &quot;last updated&quot; date above.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
