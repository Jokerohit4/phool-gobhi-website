'use client';

import { useEffect, useState } from 'react';
import RazorpayCheckoutButton from './RazorpayCheckoutButton';
import { WALLET_TOPUP_AMOUNTS } from '@/lib/walletConstants';
import type { SubscriptionPlan, GymSubscription } from '@/lib/types';

const PLAN_LABELS: Record<SubscriptionPlan['planType'], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

// Smallest preset that covers the shortfall — wallet top-ups are restricted
// to a fixed list (WALLET_TOPUP_AMOUNTS), so this is the "nearest amount"
// that gets the wallet to (at least) the plan price in one top-up. Falls
// back to the largest preset if the shortfall exceeds all of them; the
// purchase retry after that top-up will just re-report INSUFFICIENT_BALANCE
// (with the new, smaller shortfall) if one top-up genuinely isn't enough.
function nearestTopUpAmount(shortfall: number): number {
  return WALLET_TOPUP_AMOUNTS.find((a) => a >= shortfall) ?? WALLET_TOPUP_AMOUNTS[WALLET_TOPUP_AMOUNTS.length - 1];
}

type Phase = 'loading' | 'ready' | 'insufficient' | 'purchasing' | 'success' | 'error';

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
  const [phase, setPhase] = useState<Phase>('loading');
  const [balance, setBalance] = useState<number>(0);
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBalance = async (): Promise<number> => {
    const res = await fetch('/api/wallet/balance', { cache: 'no-store' });
    const json = await res.json();
    return typeof json.data?.balance === 'number' ? json.data.balance : 0;
  };

  // Read-only balance check on open — decides which action to offer
  // ("Buy Now" vs "Add ₹X to Subscribe") without touching any money yet.
  useEffect(() => {
    fetchBalance()
      .then((bal) => {
        setBalance(bal);
        setPhase(bal >= plan.price ? 'ready' : 'insufficient');
      })
      .catch(() => {
        setErrorMsg('Could not check your wallet balance');
        setPhase('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const purchase = async () => {
    setPhase('purchasing');
    try {
      const res = await fetch('/api/wallet/subscriptions/purchase-with-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId, planType: plan.planType }),
      });
      const json = await res.json();
      if (res.ok) {
        setSubscription(json.data?.subscription ?? null);
        setBalance(await fetchBalance());
        setPhase('success');
        return;
      }
      if (json.code === 'INSUFFICIENT_BALANCE') {
        // A race (e.g. the balance check above ran, then another purchase
        // elsewhere spent it down) — re-show the top-up action instead of
        // erroring outright.
        setBalance(await fetchBalance());
        setPhase('insufficient');
        return;
      }
      setErrorMsg(json.error || 'Could not complete purchase');
      setPhase('error');
    } catch {
      setErrorMsg('Network error — please try again');
      setPhase('error');
    }
  };

  const shortfall = Math.max(0, plan.price - balance);
  const topUpAmount = nearestTopUpAmount(shortfall);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={phase === 'purchasing' ? undefined : onClose}>
      <div
        className="card-premium max-w-sm w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-modal-title"
      >
        {(phase === 'loading' || phase === 'purchasing') && (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400">
            {phase === 'purchasing' ? 'Confirming your subscription…' : 'Checking your wallet…'}
          </p>
        )}

        {phase === 'ready' && (
          <>
            <h2 id="subscribe-modal-title" className="text-lg font-semibold">
              Buy the {label} plan?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{plan.price}</span> for {plan.days} days
              of access to this gym (1 free session per day) — paid from your wallet balance of ₹{balance}.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-cream-200 dark:border-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button type="button" onClick={purchase} className="flex-1 btn-primary">
                Buy Now
              </button>
            </div>
          </>
        )}

        {phase === 'insufficient' && (
          <>
            <h2 id="subscribe-modal-title" className="text-lg font-semibold">
              Add funds to subscribe
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The {label} plan costs <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{plan.price}</span>.
              Your wallet balance is ₹{balance} — add ₹{topUpAmount} to cover it, and your subscription will be
              confirmed automatically.
            </p>
            <RazorpayCheckoutButton
              orderEndpoint="/api/wallet/orders"
              orderBody={{ amount: topUpAmount }}
              verifyEndpoint="/api/wallet/verify"
              description={`Wallet top-up — ${label} subscription`}
              label={`Add ₹${topUpAmount} to Subscribe`}
              onSuccess={purchase}
            />
            <button type="button" onClick={onClose} className="w-full text-center text-sm text-gray-500 dark:text-gray-400">
              Cancel
            </button>
          </>
        )}

        {phase === 'success' && (
          <>
            <h2 className="text-lg font-semibold">You&apos;re subscribed! 🎉</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {label} plan active
              {subscription ? ` until ${new Date(subscription.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}.
            </p>
            <p className="text-sm">
              Wallet balance: <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{balance}</span>
            </p>
            <button type="button" onClick={onSuccess} className="btn-primary w-full">
              Done
            </button>
          </>
        )}

        {phase === 'error' && (
          <>
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-red-500">{errorMsg}</p>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-cream-200 dark:border-gray-700 text-sm font-medium">
                Cancel
              </button>
              <button type="button" onClick={purchase} className="flex-1 btn-secondary">
                Retry
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
