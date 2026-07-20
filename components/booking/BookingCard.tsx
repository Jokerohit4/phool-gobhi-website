'use client';

import { useState } from 'react';
import type { Booking } from '@/lib/types';

const STATUS_STYLES: Record<Booking['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function BookingCard({ booking, onCancelled }: { booking: Booking; onCancelled: () => void }) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    if (!window.confirm('Cancel this booking? Your wallet will be refunded if eligible.')) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not cancel booking');
        return;
      }
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
      {error && <p className="text-sm text-red-500">{error}</p>}
      {booking.status === 'confirmed' && (
        <button onClick={cancel} disabled={cancelling} className="self-start text-sm text-red-500 hover:underline disabled:opacity-60">
          {cancelling ? 'Cancelling…' : 'Cancel booking'}
        </button>
      )}
    </div>
  );
}
