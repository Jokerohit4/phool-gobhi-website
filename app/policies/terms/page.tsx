import type { Metadata } from 'next';
import Link from 'next/link';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

export const metadata: Metadata = {
  title: 'Terms of Service | Phool Gobhi',
  description: 'The terms that apply when you use the Phool Gobhi app or website.',
  alternates: { canonical: '/policies/terms' },
};

export default function TermsPage() {
  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="terracotta" size={46} rotate={-8} delay={0.3} motion="pulse" className="absolute top-24 left-[6%] hidden lg:flex">📜</StickerBadge>

      <div className="container-custom max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl md:text-6xl mb-4">
            <PosterOutline>Terms of</PosterOutline> <PosterFill color="terracotta">Service</PosterFill>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Last updated 15 August 2026.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. What Phool Gobhi is</h2>
            <p>
              Phool Gobhi (&quot;we&quot;, &quot;us&quot;, &quot;the platform&quot;) is a marketplace that connects
              customers with independent, third-party gyms (&quot;partner gyms&quot;) for pay-per-session access.
              We are not a gym operator. Partner gyms are independently owned and operated businesses — we do not
              control, supervise, or take responsibility for the condition of their premises, equipment, staff, or
              instruction. Your use of any partner gym&apos;s facilities is at your own risk and subject to that
              gym&apos;s own house rules.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Accounts</h2>
            <p>
              You must be at least 18 years old to create an account. Accounts are created via phone number and OTP
              verification. You are responsible for keeping your account credentials secure and for all activity
              under your account. Gym partner accounts are subject to our approval and may be rejected or removed at
              our discretion (e.g. for incomplete verification documents or policy violations).
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Wallet, payments &amp; refunds</h2>
            <p>
              Sessions are paid for out of your Phool Gobhi wallet balance, which you top up via Razorpay in fixed
              amounts. Wallet balances do not expire and carry forward, but are not currently redeemable for cash —
              see our{' '}
              <Link href="/policies/cancellation" className="text-emerald-600 dark:text-emerald-400 underline">
                Cancellation Policy
              </Link>{' '}
              for how much is refunded to your wallet when you cancel a session, and on what notice.
              Subscriptions are purchased upfront from your wallet balance for a fixed period and do not
              auto-renew — you choose to purchase again when a subscription ends.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Create multiple accounts to circumvent limits, promotions, or bans.</li>
              <li>Post fake, defamatory, or abusive reviews, or otherwise misuse the review system.</li>
              <li>Attempt to book, complete, or check in to a session you did not genuinely attend.</li>
              <li>Use the platform for any unlawful purpose, or interfere with its normal operation.</li>
            </ul>
            <p>
              We may suspend or terminate any account that violates these terms, with or without notice, at our
              discretion.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Buddy matching &amp; meeting other users</h2>
            <p>
              Buddy lets you match and chat with other users to work out together. We do not run background,
              identity, or criminal-record checks on users, and we cannot guarantee the conduct, identity, or
              intentions of anyone you match with. Use the same judgment you would with any stranger you meet
              online: verify who you&apos;re meeting, meet at the partner gym itself for a first session, and never
              share financial details, passwords, or OTPs with another user. Report or block anyone who behaves
              inappropriately from within the app — we review reports and may suspend accounts as a result, but we
              are not responsible for another user&apos;s conduct, on or off the platform.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Intellectual property</h2>
            <p>
              The Phool Gobhi name, logo, app, and website — including their design, text, and underlying code —
              belong to us or our licensors and are protected by applicable intellectual property law. We grant you
              a personal, non-transferable, revocable licence to use the app and website for their intended purpose.
              Content you upload (profile photos, buddy bio, reviews, chat messages) remains yours, but you grant us
              a licence to display it back to you and to other relevant users (e.g. a partner gym seeing your
              profile photo at check-in, or a Buddy match seeing your buddy profile) as needed to run the service.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Disclaimer &amp; limitation of liability</h2>
            <p>
              The platform is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any
              kind, express or implied, including as to uninterrupted availability or fitness for a particular
              purpose. To the maximum extent permitted by law, Phool Gobhi is not liable for injury, loss, or damage
              arising from your use of a partner gym&apos;s premises or equipment, from any act or omission of a
              partner gym or its staff, or from your interactions with other users (including Buddy matches). Our
              total liability to you for any claim arising from your use of the platform is limited to the amount
              you paid us in the three months preceding the claim.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">8. Indemnity</h2>
            <p>
              You agree to indemnify and hold Phool Gobhi harmless from any claim, loss, or liability (including
              reasonable legal costs) arising from your violation of these terms, your misuse of the platform, or
              your interactions with a partner gym or another user.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">9. Changes to these terms</h2>
            <p>
              We may update these terms as the product evolves. Continued use of the platform after an update
              constitutes acceptance of the revised terms. Material changes will be reflected by the &quot;last
              updated&quot; date above.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">10. Grievances &amp; contact</h2>
            <p>
              Grievance Officer: Rohitashwa Singh, Founder. For questions, complaints, or grievances, contact us at{' '}
              <a href="mailto:hello@phoolgobhi.com" className="text-emerald-600 dark:text-emerald-400 underline">
                hello@phoolgobhi.com
              </a>{' '}
              or WhatsApp{' '}
              <a href="https://wa.me/919354859197" className="text-emerald-600 dark:text-emerald-400 underline">
                +91 9354859197
              </a>
              . We will acknowledge your complaint within 48 hours and aim to resolve it within one month, as
              required under Indian consumer protection rules for e-commerce platforms.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">11. Governing law</h2>
            <p>
              These terms are governed by the laws of India. Courts in Gurugram, Haryana have exclusive jurisdiction
              over any dispute arising from these terms, subject to applicable consumer protection law giving you
              the right to approach a forum closer to you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
