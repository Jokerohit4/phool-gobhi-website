import Link from 'next/link';
import type { Gym, GymClass } from '@/lib/types';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassBookingSummaryCard({
  gym,
  gymClass,
  date,
  isCovered = false,
}: {
  gym: Gym;
  gymClass: GymClass;
  date: string;
  isCovered?: boolean;
}) {
  const included = gymClass.price == null;
  return (
    <div className="card-premium p-6 space-y-2">
      <h2 className="text-lg font-semibold">{gymClass.name}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {gym.name} · {gym.address}, {gym.city}
      </p>
      <p className="text-sm">
        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} ·{' '}
        {gymClass.startTime}–{gymClass.endTime} · {DAY_LABELS[gymClass.dayOfWeek]}
      </p>
      {included ? (
        isCovered ? (
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">Included in your subscription — ₹0</p>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Included with an active subscription at this gym — you&apos;ll need one to book this class.
          </p>
        )
      ) : (
        <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹{gymClass.price} (always charged, regardless of subscription)</p>
      )}
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
