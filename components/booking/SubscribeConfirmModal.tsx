'use client';

import RazorpayCheckoutButton from './RazorpayCheckoutButton';
import type { SubscriptionPlan } from '@/lib/types';

const PLAN_LABELS: Record<SubscriptionPlan['planType'], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export default function SubscribeConfirmModal({
  gymId,
  plan,
  onSuccess,
  onClose,
}: {
  gymId: number;
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const label = PLAN_LABELS[plan.planType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="card-premium max-w-sm w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-modal-title"
      >
        <h2 id="subscribe-modal-title" className="text-lg font-semibold">
          Buy the {label} plan?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You&apos;ll be charged <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{plan.price}</span> for{' '}
          {plan.days} days of access to this gym (1 free session per day). Paid directly via Razorpay, not from your
          wallet balance.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-cream-200 dark:border-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <div className="flex-1">
            <RazorpayCheckoutButton
              orderEndpoint="/api/wallet/subscriptions/orders"
              orderBody={{ gymId, planType: plan.planType }}
              verifyEndpoint="/api/wallet/subscriptions/verify"
              description={`Gym Subscription - ${plan.planType}`}
              label="Buy Now"
              onSuccess={onSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
