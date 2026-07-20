'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Slot } from '@/lib/types';

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
      {error && <p className="text-red-500">{error}</p>}
      {!slots && !error && <p className="text-gray-500 dark:text-gray-400">Loading slots…</p>}
      {slots && slots.length === 0 && <p className="text-gray-500 dark:text-gray-400">No slots available on this date.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots?.map((slot) => (
          <button
            key={slot.startTime}
            onClick={() => pickSlot(slot)}
            className="card-premium p-3 text-left hover:shadow-md transition-all"
          >
            <div className="font-medium">
              {slot.startTime}–{slot.endTime}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ₹{slot.price} · {slot.available} left
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
