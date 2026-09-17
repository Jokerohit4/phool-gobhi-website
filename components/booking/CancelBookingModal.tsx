'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Booking } from '@/lib/types';

// FR-14. Mirrors the app's cancel_reason_sheet.dart, including its copy — a
// user who cancels on the phone and on the web should not be asked two
// differently-worded questions and have the answers land in the same column.
const REASONS: [string, string][] = [
  ['not_this_time', 'Not this time'],
  ['injury', 'Injury'],
  ['work', 'Work'],
  ['travel', 'Travel'],
  ['other', 'Something else'],
];

const INTENTS: [string, string][] = [
  ['today', 'Today'],
  ['this_week', 'This week'],
  ['this_month', 'This month'],
  ['unsure', 'Not sure yet'],
];

export type CancelFeedback = {
  cancellationReason?: string;
  nextVisitIntent?: string;
};

function Chip({
  label,
  selected,
  onToggle,
  disabled,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors disabled:opacity-60 ${
        selected
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : 'bg-transparent border-cream-200 dark:border-gray-700 hover:border-emerald-400'
      }`}
    >
      {label}
    </button>
  );
}

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
  onConfirm: (feedback: CancelFeedback) => void;
  onClose: () => void;
}) {
  // Two steps in one dialog rather than two dialogs: the second step opens
  // only after the user has already committed, so there is no flicker of one
  // modal closing as another opens.
  const [step, setStep] = useState<'confirm' | 'reason'>('confirm');
  const [reason, setReason] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);

  const feedback: CancelFeedback = {
    ...(reason ? { cancellationReason: reason } : {}),
    ...(intent ? { nextVisitIntent: intent } : {}),
  };

  // Once the user is on the feedback step they have already said "cancel it".
  // From here EVERY exit cancels the booking — Send, Skip, backdrop, Escape.
  // Only Send attaches answers. Anything else would strand them in a state
  // where they think they cancelled and didn't.
  const closeOrCancel = () => {
    if (confirming) return;
    if (step === 'reason') {
      onConfirm(feedback);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeOrCancel}
    >
      <div
        className="card-premium max-w-sm w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeOrCancel();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
      >
        {step === 'confirm' ? (
          <>
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
                onClick={() => setStep('reason')}
                disabled={confirming}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold disabled:opacity-60"
              >
                Cancel booking
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Copy is deliberately non-judgemental (PRD §7.3): "No problem."
                not "Are you sure?", and every row is skippable. */}
            <h2 id="cancel-modal-title" className="text-lg font-semibold">
              No problem.
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your refund is on its way. If you feel like telling us why, it helps us suggest better times — entirely optional.
            </p>

            <div className="flex flex-wrap gap-2">
              {REASONS.map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  selected={reason === value}
                  disabled={confirming}
                  onToggle={() => setReason(reason === value ? null : value)}
                />
              ))}
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 pt-1">When&apos;s your next visit?</p>
            <div className="flex flex-wrap gap-2">
              {INTENTS.map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  selected={intent === value}
                  disabled={confirming}
                  onToggle={() => setIntent(intent === value ? null : value)}
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-1">
              {/* Not "Cancel" — that word already means something else on
                  this screen. Skipping still cancels the booking. */}
              <button
                type="button"
                onClick={() => onConfirm({})}
                disabled={confirming}
                className="flex-1 px-4 py-2 rounded-lg border border-cream-200 dark:border-gray-700 text-sm font-medium disabled:opacity-60"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => onConfirm(feedback)}
                disabled={confirming || (!reason && !intent)}
                className="flex-[2] px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold disabled:opacity-60"
              >
                {confirming ? 'Cancelling…' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
