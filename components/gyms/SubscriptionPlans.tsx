'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import SubscribeConfirmModal from '@/components/booking/SubscribeConfirmModal';
import type { SubscriptionPlan, GymSubscription } from '@/lib/types';

const PLAN_LABELS: Record<SubscriptionPlan['planType'], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export default function SubscriptionPlans({ gymId }: { gymId: number }) {
  const { user } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[] | null>(null);
  const [activeSub, setActiveSub] = useState<GymSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const load = useCallback(async () => {
    try {
      const plansRes = await fetch(`/api/gyms/${gymId}/subscription-plans`);
      const plansData = await plansRes.json();
      if (!plansRes.ok) {
        setError(plansData.error || 'Could not load plans');
        return;
      }
      setPlans(plansData.data?.plans ?? []);

      // "mine" requires a session — subscription plans themselves are public
      // browsing, so a logged-out visitor still sees the plan cards, just
      // can't have an active subscription to show instead.
      if (user) {
        const mineRes = await fetch(`/api/wallet/subscriptions/mine?gymId=${gymId}`, { cache: 'no-store' });
        if (mineRes.ok) {
          const mineData = await mineRes.json();
          const now = Date.now();
          const active = ((mineData.data ?? []) as GymSubscription[]).find(
            (s) => s.status === 'active' && new Date(s.endDate).getTime() > now
          );
          setActiveSub(active ?? null);
        }
      } else {
        setActiveSub(null);
      }
    } catch {
      setError('Network error — please try again');
    }
  }, [gymId, user]);

  useEffect(() => {
    load();
  }, [load]);

  // Subscriptions are an enhancement to the booking flow, not a requirement —
  // never block the rest of the gym page on this failing or still loading.
  if (error || !plans || plans.length === 0) return null;

  const handleSubscribeClick = (plan: SubscriptionPlan) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/gyms/${gymId}`)}`);
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Subscribe &amp; Save</h2>

      {activeSub ? (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-3">
          <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Active {PLAN_LABELS[activeSub.planType as SubscriptionPlan['planType']]} subscription until{' '}
            {new Date(activeSub.endDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <div key={plan.planType} className="card-premium p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{PLAN_LABELS[plan.planType]}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{plan.price}</span>
                  {plan.discountPercent > 0 && (
                    <>
                      <span className="text-xs text-gray-400 line-through">₹{plan.comparablePrice}</span>
                      <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
                        {plan.discountPercent}% off
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleSubscribeClick(plan)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPlan && (
        <SubscribeConfirmModal
          gymId={gymId}
          plan={selectedPlan}
          onSuccess={() => {
            setSelectedPlan(null);
            load();
          }}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
