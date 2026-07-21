'use client';

import { useState } from 'react';
import type { Booking } from '@/lib/types';
import { hoursUntilSlot, cancellationTier } from '@/lib/cancellationPolicy';
import CancelBookingModal from './CancelBookingModal';

const STATUS_STYLES: Record<Booking['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function BookingCard({ booking, onCancelled }: { booking: Booking; onCancelled: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoursUntil = hoursUntilSlot(booking.date, booking.startTime);
  const tier = cancellationTier(hoursUntil);
  const refundAmount = Math.round(booking.amount * tier.refundRate * 100) / 100;

  const confirmCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not cancel booking');
        return;
      }
      setShowModal(false);
      onCancelled();
    } catch {
      setError('Network error — please try again');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="card-premium p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{booking.gym?.name || `Gym #${booking.gymId}`}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{booking.gym?.address}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
      </div>
      <p className="text-sm">
        {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {booking.startTime}–{booking.endTime}
      </p>
      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{booking.amount}</p>
      {error && !showModal && <p className="text-sm text-red-500">{error}</p>}
      {booking.status === 'confirmed' &&
        (tier.blocked ? (
          <p className="text-sm text-gray-400">Cannot cancel within 1 hour of the session</p>
        ) : (
          <button onClick={() => setShowModal(true)} className="self-start text-sm text-red-500 hover:underline">
            Cancel booking
          </button>
        ))}

      {showModal && (
        <CancelBookingModal
          booking={booking}
          refundRate={tier.refundRate}
          refundAmount={refundAmount}
          confirming={cancelling}
          error={error}
          onConfirm={confirmCancel}
          onClose={() => {
            setShowModal(false);
            setError(null);
          }}
        />
      )}
    </div>
  );
}
