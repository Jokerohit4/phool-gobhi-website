'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking } from '@/lib/types';
import { hoursUntilSlot, cancellationTier, isSlotOver } from '@/lib/cancellationPolicy';
import CancelBookingModal from './CancelBookingModal';

const STATUS_STYLES: Record<Booking['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function BookingCard({ booking, onCancelled }: { booking: Booking; onCancelled: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoursUntil = hoursUntilSlot(booking.date, booking.startTime);
  const tier = cancellationTier(hoursUntil);
  const refundAmount = Math.round(booking.amount * tier.refundRate * 100) / 100;
  const canShowQr = booking.status === 'confirmed' && !isSlotOver(booking.date, booking.endTime);

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

      {booking.slotShiftWarning && (
        <span className="self-start text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          ⚠ Slot time was adjusted after check-in.
        </span>
      )}

      {canShowQr && (
        <button
          onClick={() => setShowQr((v) => !v)}
          className="self-start text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
        >
          {showQr ? 'Hide QR code' : 'Show QR code'}
        </button>
      )}

      {canShowQr && showQr && (
        <div className="flex flex-col items-center gap-2 py-3">
          {booking.qrToken ? (
            <QRCodeSVG
              value={booking.qrToken}
              size={180}
              bgColor="transparent"
              fgColor="currentColor"
              className="text-gray-900 dark:text-white"
            />
          ) : (
            <p className="text-sm text-red-500">QR code unavailable — please refresh and try again</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Show this to the gym partner at check-in
          </p>
        </div>
      )}

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
