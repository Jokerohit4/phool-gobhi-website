import Link from 'next/link';
import type { Gym } from '@/lib/types';

export default function BookingSummaryCard({
  gym,
  date,
  startTime,
  endTime,
  isCovered = false,
}: {
  gym: Gym;
  date: string;
  startTime: string;
  endTime: string;
  isCovered?: boolean;
}) {
  return (
    <div className="card-premium p-6 space-y-2">
      <h2 className="text-lg font-semibold">{gym.name}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {gym.address}, {gym.city}
      </p>
      <p className="text-sm">
        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {startTime}–{endTime}
      </p>
      {isCovered ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 line-through">₹{gym.sessionPrice}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Included in your subscription — ₹0</span>
        </div>
      ) : (
        <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹{gym.sessionPrice}</p>
      )}
      <p className="text-xs text-gray-400">Final price is confirmed by the gym at checkout and may reflect a slot-specific rate.</p>
      <p className="text-xs text-gray-400">
        Cancelling later? Refund depends on notice given —{' '}
        <Link href="/policies/cancellation" className="underline hover:text-emerald-600 dark:hover:text-emerald-400">
          see the cancellation policy
        </Link>
        .
      </p>
    </div>
  );
}
