'use client';

import { useCallback, useEffect, useState } from 'react';
import BookingCard from './BookingCard';
import type { Booking } from '@/lib/types';

export default function BookingHistoryList() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings/mine', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load bookings');
        return;
      }
      setBookings(data.data ?? []);
    } catch {
      setError('Network error — please try again');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!bookings) return <p className="text-gray-500 dark:text-gray-400">Loading…</p>;
  if (bookings.length === 0) return <p className="text-gray-500 dark:text-gray-400">No bookings yet.</p>;

  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} onCancelled={load} />
      ))}
    </div>
  );
}
