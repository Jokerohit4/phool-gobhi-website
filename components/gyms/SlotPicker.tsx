'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import type { GymSubscription, Slot } from '@/lib/types';

function todayIso() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function nextDays(n: number) {
  const out: string[] = [];
  const base = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d.toISOString().split('T')[0]);
  }
  return out;
}

export default function SlotPicker({ gymId }: { gymId: string }) {
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<GymSubscription | null>(null);
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    setSlots(null);
    setError(null);
    fetch(`/api/gyms/${gymId}/slots?date=${date}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Could not load slots');
          return;
        }
        setSlots(data.data?.slots ?? []);
      })
      .catch(() => setError('Network error — please try again'));
  }, [gymId, date]);

  // Same active-subscription lookup SubscriptionPlans uses, fetched
  // independently here since it drives per-slot pricing rather than the
  // "Subscribe & Save" section above. Logged-out visitors just never have
  // one to show.
  useEffect(() => {
    if (!user) {
      setActiveSub(null);
      return;
    }
    fetch(`/api/wallet/subscriptions/mine?gymId=${gymId}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const now = Date.now();
        const active = ((data.data ?? []) as GymSubscription[]).find(
          (s) => s.status === 'active' && new Date(s.endDate).getTime() > now
        );
        setActiveSub(active ?? null);
      })
      .catch(() => {});
  }, [gymId, user]);

  // The subscription covers one session per gym per day (reserveBookingSlot's
  // usedToday check) — lastVisitDate matching the currently-picked date means
  // today's (or that day's) covered session is already spent, so every slot
  // shown for that date would actually be charged, same as no subscription.
  const coveredForDate = !!activeSub && activeSub.lastVisitDate !== date;

  const pickSlot = (slot: Slot) => {
    const params = new URLSearchParams({ date, startTime: slot.startTime, endTime: slot.endTime });
    router.push(`/book/${gymId}/confirm?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Pick a date</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {nextDays(7).map((d) => (
          <button
            key={d}
            onClick={() => setDate(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border ${
              d === date
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-cream-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-3">Pick a slot</h2>

      {activeSub && (
        <p className="text-sm mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-emerald-700 dark:text-emerald-300">
          {coveredForDate
            ? 'You have an active subscription — any slot below on this date is included, no wallet debit.'
            : "You've already used this subscription's included session for this date — booking another slot today will be charged normally."}
        </p>
      )}

      {error && <p className="text-red-500">{error}</p>}
      {!slots && !error && <p className="text-gray-500 dark:text-gray-400">Loading slots…</p>}
      {slots && slots.length === 0 && <p className="text-gray-500 dark:text-gray-400">No slots available on this date.</p>}

      {/* Gyms often run a morning + evening shift with a midday closure —
          grouping by time-of-day makes that gap legible instead of the grid
          just jumping from (say) 11:00 to 17:00 with no explanation. */}
      {slots && slots.length > 0 && (
        <div className="space-y-6">
          {(() => {
            const morning = slots.filter((s) => s.startTime < '12:00');
            const evening = slots.filter((s) => s.startTime >= '12:00');
            const groups = [
              { label: 'Morning', items: morning },
              { label: 'Evening', items: evening },
            ].filter((g) => g.items.length > 0);
            // Only one non-empty group (no real gap that day) — skip the
            // label, same flat grid as before.
            const showLabels = groups.length > 1;
            return groups.map((group) => (
              <div key={group.label}>
                {showLabels && (
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{group.label}</h3>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.items.map((slot) => (
                    <button
                      key={slot.startTime}
                      onClick={() => pickSlot(slot)}
                      className="card-premium p-3 text-left hover:shadow-md transition-all"
                    >
                      <div className="font-medium">
                        {slot.startTime}–{slot.endTime}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {coveredForDate ? (
                          <>
                            <span className="line-through">₹{slot.price}</span>{' '}
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Included</span>
                          </>
                        ) : (
                          <>₹{slot.price}</>
                        )}{' '}
                        · {slot.available} left
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
