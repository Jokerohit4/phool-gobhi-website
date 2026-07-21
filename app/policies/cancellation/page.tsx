import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';

const TIERS = [
  { window: 'Less than 1 hour before your session', refund: 'Cannot be cancelled', highlight: false },
  { window: '1–4 hours before your session', refund: '30% refunded to your wallet', highlight: false },
  { window: '4–8 hours before your session', refund: '50% refunded to your wallet', highlight: false },
  { window: '8 or more hours before your session', refund: '100% refunded to your wallet', highlight: true },
];

export default function CancellationPolicyPage() {
  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="terracotta" size={50} rotate={-10} delay={0.3} motion="pulse" className="absolute top-24 left-[6%] hidden lg:flex">📋</StickerBadge>
      <StickerBadge color="emerald" size={44} rotate={14} delay={0.9} motion="wiggle" className="absolute bottom-16 right-[5%] hidden md:flex">↩️</StickerBadge>

      <div className="container-custom max-w-3xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl mb-4">
            <PosterOutline>Booking &amp;</PosterOutline> <PosterFill color="terracotta">Cancellation Policy</PosterFill>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Straightforward, in plain language. This is the exact policy our system applies automatically —
            nothing here is aspirational.
          </p>
        </div>

        <div className="space-y-10">
          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold">Booking a session</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              A slot can only be booked at least 1 hour before it starts. Payment is deducted from your wallet
              immediately when the booking is confirmed; if your balance is too low, you&apos;ll be prompted to
              add money before the booking goes through.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Cancelling a session</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
              How much comes back to your wallet depends on how much notice you give before your session starts:
            </p>
            <div className="overflow-x-auto rounded-lg border border-cream-200 dark:border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream-100 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">If you cancel…</th>
                    <th className="px-4 py-3 font-semibold">You get back</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((tier) => (
                    <tr
                      key={tier.window}
                      className={`border-t border-cream-200 dark:border-gray-800 ${tier.highlight ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
                    >
                      <td className="px-4 py-3">{tier.window}</td>
                      <td className={`px-4 py-3 font-medium ${tier.highlight ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                        {tier.refund}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Refunds are credited to your Phool Gobhi wallet, not back to your original payment method — you can use
              the balance toward any future booking or add more to it any time.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold">If a gym or partner cancels on you</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              If your session is cancelled by the gym or by us for any reason, you always receive a full 100%
              refund to your wallet, regardless of timing — the tiered policy above only applies when you
              initiate the cancellation.
            </p>
          </div>

          <div className="card-premium p-6 space-y-3">
            <h2 className="text-xl font-bold">Wallet top-ups</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Money can be added to your wallet in fixed amounts of ₹200, ₹500, ₹1,000 or ₹2,000 — there&apos;s no
              option to enter a custom amount. Wallet balances don&apos;t expire and carry forward to future
              bookings.
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            We may update this policy as the product evolves. The version shown here always reflects what the
            system actually does at the time you view this page.
          </p>
        </div>
      </div>
    </section>
  );
}
