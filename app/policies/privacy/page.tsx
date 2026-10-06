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
            Last updated 6 October 2026.
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
              <li><strong>Gym-linked attendance data:</strong> if you sign up through a specific gym&apos;s QR code or join link (for example, an existing gym member registering for attendance tracking), we record which gym you&apos;re linked to and your check-in history there, in addition to the booking data above.</li>
              <li><strong>Referral data:</strong> a referral code if you redeem one, so the person who invited you can be credited.</li>
              <li><strong>Usage data:</strong> app and website interactions (screens viewed, buttons tapped, searches, bookings, top-ups, check-ins) via our own first-party analytics — no third party receives this data.</li>
              <li><strong>IP address:</strong> captured automatically alongside the usage data above, to support aggregate, approximate location reporting (e.g. by city or country). We do not use it to pinpoint your exact location, and it is never shared with a third party.</li>
              <li><strong>Device data:</strong> app version, device model and OS, language and theme settings, and a push-notification token (Firebase Cloud Messaging) so we can notify you about your bookings.</li>
              <li><strong>Partner business details:</strong> if you run a partner gym, we collect your business name, contact details, and the bank account or UPI details you give us, so we can pay you what you have earned and complete statutory withholding.</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. How we use it</h2>
            <p>
              To operate the core service: creating your account, showing nearby gyms, processing bookings,
              payments and top-ups, verifying check-ins, running Buddy matching and chat, showing your
              booking/wallet history, and sending transactional notifications (booking confirmed, cancelled,
              completed). If you registered through a specific gym&apos;s join link, we also use your attendance
              data to show that gym its own members&apos; check-in records, and, in aggregate, to measure and
              improve this feature. We also use aggregated, non-identifying usage data to understand and improve
              the product, and we review user reports of other users&apos; profiles or chat messages to keep the
              community safe. We do not use your attendance data for advertising or third-party marketing, and
              will not do so in future without asking for your separate, explicit consent first.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Who we share it with</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Partner gyms</strong> see your name and profile photo for bookings at their gym, so they can recognize you at check-in — they never see your phone number or email. If you registered directly with a gym through its join link, that gym can also see your check-in/attendance history with them specifically (not with any other gym).</li>
              <li><strong>Other Buddy users</strong> see the buddy profile and chat content you choose to share. Please do not share personal contact details with people you have just met.</li>
              <li><strong>Razorpay</strong> processes payments directly; we share only what&apos;s needed to complete a transaction.</li>
              <li><strong>Firebase (Google)</strong> delivers push notifications and verifies your phone number for sign-in. Sign-in codes are sent over an SMS provider we have contracted for that purpose.</li>
              <li>We do not sell your personal data to anyone, or share it with advertisers.</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3 border-l-4 border-amber-400">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Draft — pending legal review
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Health &amp; fitness data (Health+)</h2>
            <p>
              Some features let you record health information: workouts, steps and heart rate from Apple Health or
              Health Connect, body measurements you type in, food logs, period dates, medical documents you upload,
              and conversations with our AI fitness coach. We treat all of this as sensitive personal data.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Each of these is switched on separately, with its own consent, and you can switch any of them off again in the app.</li>
              <li>Health+ features are only available to people aged 18 and over.</li>
              <li>Phool Gobhi is a general wellness app. It does not diagnose, treat or manage any medical condition, and the AI coach is not a doctor.</li>
              <li>We never share your health data with gyms, trainers, employers or insurers. If we ever offer a way to share something with them, it will only ever be a summary you choose to send, with a separate consent each time.</li>
              <li>Data read from Apple Health or Health Connect is never used for advertising, and never used to decide insurance or credit.</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3 border-l-4 border-amber-400">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Draft — pending legal review
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Where your data is processed</h2>
            <p>
              Our servers run in India (Google Cloud, Mumbai). Some of your data is stored or processed outside India
              by the service providers we use:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Database:</strong> your account, booking, wallet and health records are stored in a managed Postgres database provided by Neon, a third party that hosts data outside India on our behalf under a processor agreement.</li>
              <li><strong>AI fitness coach:</strong> the messages you send the coach, and the workout context it needs to answer, are processed by our AI model provider, Groq, in the United States. We keep what we send to the minimum needed to answer.</li>
              <li><strong>Food photos:</strong> meal photo logging is currently switched off and not available in the app. If we ever turn it on, the photo will be analysed by a third-party vision model provider and we will tell you before it does anything with your image.</li>
              <li><strong>Photos and files:</strong> profile and gym photos are stored with Cloudinary.</li>
            </ul>
            <p>
              These providers process data only to deliver the service to you, under contract with us.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Data retention &amp; deletion</h2>
            <p>
              We keep account and transaction data for as long as your account is active, and for a reasonable
              period afterward as needed for accounting, dispute resolution, and legal compliance. You can
              request deletion of your account and associated personal data at any time — see{' '}
              <Link href="/policies/delete-account" className="text-emerald-600 dark:text-emerald-400 underline">
                how to delete your account
              </Link>{' '}
              for the in-app and without-the-app options. This removes your profile, buddy profile, bookings,
              wallet balance and referrals. Some transaction records may be retained where required by law
              (e.g. financial record-keeping obligations).
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">8. Your rights</h2>
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

          <div className="card-premium p-6 space-y-3 border-l-4 border-amber-400">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Draft — pending legal review
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">9. Grievances &amp; privacy contact</h2>
            <p>
              If you have a question or complaint about how we handle your personal data, write to our grievance
              officer, Rohitashwa Singh (Founder), at{' '}
              <a href="mailto:hello@phoolgobhi.com" className="text-emerald-600 dark:text-emerald-400 underline">
                hello@phoolgobhi.com
              </a>{' '}
              with &quot;Privacy&quot; in the subject line. We aim to resolve every complaint within one month.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">10. Cookies (website)</h2>
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">11. Children&apos;s privacy</h2>
            <p>
              Phool Gobhi is for users aged 18 and over. We do not knowingly collect data from anyone under 18.
              If you believe a child has provided us personal data, contact us and we will delete it.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">12. Changes to this policy</h2>
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
