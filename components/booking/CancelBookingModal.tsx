'use client';

import Link from 'next/link';
import type { Booking } from '@/lib/types';

export default function CancelBookingModal({
  booking,
  refundRate,
  refundAmount,
  confirming,
  error,
  onConfirm,
  onClose,
}: {
  booking: Booking;
  refundRate: number;
  refundAmount: number;
  confirming: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="card-premium max-w-sm w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
      >
        <h2 id="cancel-modal-title" className="text-lg font-semibold">
          Cancel this booking?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {booking.gym?.name || `Gym #${booking.gymId}`} ·{' '}
          {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {booking.startTime}
        </p>

        <div className="rounded-lg bg-cream-100 dark:bg-gray-800 p-4 space-y-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You&apos;ll get back <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{refundAmount.toFixed(2)}</span> (
            {Math.round(refundRate * 100)}% of ₹{booking.amount}) to your wallet.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Refund amount depends on how far in advance you cancel.{' '}
            <Link href="/policies/cancellation" className="underline hover:text-emerald-600 dark:hover:text-emerald-400">
              See full cancellation policy
            </Link>
            .
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="flex-1 px-4 py-2 rounded-lg border border-cream-200 dark:border-gray-700 text-sm font-medium disabled:opacity-60"
          >
            Keep booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold disabled:opacity-60"
          >
            {confirming ? 'Cancelling…' : 'Cancel booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
