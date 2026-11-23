import type { Metadata } from 'next';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

export const metadata: Metadata = {
  title: 'Delete Your Account | Phool Gobhi',
  description: 'How to request deletion of your Phool Gobhi account and personal data, from inside the app or without it.',
  alternates: { canonical: '/policies/delete-account' },
};

export default function DeleteAccountPage() {
  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="terracotta" size={46} rotate={-8} delay={0.3} motion="pulse" className="absolute top-24 left-[6%] hidden lg:flex">🗑️</StickerBadge>

      <div className="container-custom max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl md:text-6xl mb-4">
            <PosterOutline>Delete Your</PosterOutline> <PosterFill color="emerald">Account</PosterFill>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            You can request deletion of your Phool Gobhi account and personal data at any time, whether or not
            you have the app installed.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Option 1: From inside the app (instant)</h2>
            <p>
              Open the Phool Gobhi app and go to <strong>Profile &rarr; Delete Account</strong>. This permanently
              deletes your account immediately — no waiting period.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Option 2: Without the app, or if you can&apos;t log in
            </h2>
            <p>
              Email{' '}
              <a href="mailto:hello@phoolgobhi.com" className="text-emerald-600 dark:text-emerald-400 underline">
                hello@phoolgobhi.com
              </a>{' '}
              or WhatsApp{' '}
              <a href="https://wa.me/919354859197" className="text-emerald-600 dark:text-emerald-400 underline">
                +91 9354859197
              </a>{' '}
              from the phone number registered on your account, with the subject or message &quot;Delete my
              account&quot;. We verify the request against that phone number and delete your account within{' '}
              <strong>7 days</strong>.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">What gets deleted</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Your profile — name, phone number, email, gender, date of birth, fitness goals, profile photo</li>
              <li>Your Buddy profile, bio, photos, matches, and chat messages</li>
              <li>Your booking history and wallet balance</li>
              <li>Your referral data and connections</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">What we retain, and why</h2>
            <p>
              Some transaction records (bookings, payments, payouts) may be retained after deletion where required
              for accounting, tax, or dispute-resolution obligations under Indian law, even though the rest of your
              profile is removed. See our{' '}
              <a href="/policies/privacy" className="text-emerald-600 dark:text-emerald-400 underline">
                Privacy Policy
              </a>{' '}
              for details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
