import type { Metadata } from 'next';
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
            Last updated 29 July 2026.
          </p>
        </div>

        <div className="card-premium p-5 mb-8 border-2 border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Draft — pending legal review.
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            This page is a placeholder describing what the app and website actually collect today, so
            there&apos;s a disclosure surface before real users sign up. It has not been reviewed by a
            lawyer for compliance with India&apos;s Digital Personal Data Protection Act (DPDP) and should
            not be relied on as a final legal document.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. What we collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Account details:</strong> phone number (for OTP login), name, date of birth, email (optional), profile photo (optional).</li>
              <li><strong>Booking &amp; payment data:</strong> booking history, wallet balance and transaction history. Card/UPI details are handled entirely by our payment processor, Razorpay — we never see or store your card number, CVV, or UPI PIN.</li>
              <li><strong>Location:</strong> used only at check-in time, to confirm you&apos;re actually at the gym you booked (geofence check) — not tracked continuously or stored as a location history.</li>
              <li><strong>Usage data:</strong> app/website interactions (screens viewed, buttons tapped, session events) via our own first-party analytics — no third party receives this data.</li>
              <li><strong>Device data:</strong> a push-notification token (Firebase Cloud Messaging) so we can notify you about your bookings.</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. How we use it</h2>
            <p>To operate the core service: creating your account, processing bookings and payments, verifying check-ins, showing your booking/wallet history, and sending transactional notifications (booking confirmed, cancelled, completed). We also use aggregated, non-identifying usage data to understand and improve the product.</p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Who we share it with</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Partner gyms</strong> see your name and profile photo for bookings at their gym, so they can recognize you at check-in — they never see your phone number or email.</li>
              <li><strong>Razorpay</strong> processes payments directly; we share only what&apos;s needed to complete a transaction.</li>
              <li><strong>Firebase (Google)</strong> delivers push notifications and, for the partner app, crash/analytics data.</li>
              <li>We do not sell your personal data to anyone, or share it with advertisers.</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Data retention</h2>
            <p>
              We keep account and transaction data for as long as your account is active, and for a reasonable
              period afterward as needed for accounting, dispute resolution, and legal compliance. You can request
              deletion of your account and associated personal data at any time (see below) — some transaction
              records may be retained where required by law (e.g. financial record-keeping obligations).
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Your rights</h2>
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Cookies (website)</h2>
            <p>
              The website uses a session cookie to keep you logged in, and a local preference for light/dark theme.
              We do not use third-party advertising or tracking cookies.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Changes to this policy</h2>
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
