'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import ProfileCompletionGate from './ProfileCompletionGate';
import BookingSummaryCard from './BookingSummaryCard';
import WalletTopUpForm from '@/components/wallet/WalletTopUpForm';
import type { Gym } from '@/lib/types';

type Status = 'idle' | 'booking' | 'needs-topup' | 'success' | 'error';

export default function BookingConfirmClient({
  gymId,
  date,
  startTime,
  endTime,
}: {
  gymId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/gyms/${gymId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setLoadError(data.error || 'Could not load gym details');
          return;
        }
        setGym(data.data);
      })
      .catch(() => setLoadError('Network error — please try again'));
  }, [gymId]);

  useEffect(() => {
    if (!sessionLoading && !user) {
      const redirect = encodeURIComponent(`/book/${gymId}/confirm?date=${date}&startTime=${startTime}&endTime=${endTime}`);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [sessionLoading, user, router, gymId, date, startTime, endTime]);

  const attemptBooking = async () => {
    setStatus('booking');
    setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId: Number(gymId), date, startTime, endTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message: string = data.error || 'Could not create booking';
        // "Wallet not found" happens for a customer who has never had a
        // wallet auto-provisioned (that only happens on a wallet read, e.g.
        // visiting /account/wallet) — functionally the same as insufficient
        // balance from the booker's point of view: they need to add money.
        if (/insufficient|wallet not found/i.test(message)) {
          setStatus('needs-topup');
          return;
        }
        setError(message);
        setStatus('error');
        return;
      }
      setBookingId(data.data?.id ?? null);
      setStatus('success');
    } catch {
      setError('Network error — please try again');
      setStatus('error');
    }
  };

  if (sessionLoading || !user) return <p className="text-gray-500 dark:text-gray-400">Loading…</p>;
  if (loadError) return <p className="text-red-500">{loadError}</p>;
  if (!gym) return <p className="text-gray-500 dark:text-gray-400">Loading…</p>;

  if (status === 'success') {
    return (
      <div className="card-premium p-6 max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Booking confirmed!</h2>
        {bookingId && <p className="text-sm text-gray-500 dark:text-gray-400">Booking #{bookingId}</p>}
        <a
          href="/account/bookings"
          className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold"
        >
          View my bookings
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md">
      <BookingSummaryCard gym={gym} date={date} startTime={startTime} endTime={endTime} />

      <ProfileCompletionGate>
        {status === 'needs-topup' ? (
          <div className="space-y-4">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Your wallet balance is too low for this booking. Add money below and we&apos;ll retry the booking automatically.
            </p>
            <WalletTopUpForm onTopUpSuccess={attemptBooking} />
          </div>
        ) : (
          <>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={attemptBooking}
              disabled={status === 'booking'}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold disabled:opacity-60"
            >
              {status === 'booking' ? 'Booking…' : 'Confirm booking'}
            </button>
          </>
        )}
      </ProfileCompletionGate>
    </div>
  );
}
