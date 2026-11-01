'use client';

import { useCallback, useEffect, useState } from 'react';
import BookingCard from './BookingCard';
import type { Booking } from '@/lib/types';
import { appendUnique, readMeta, type PageMeta } from '@/lib/pagination';

const PAGE_SIZE = 50;

export default function BookingHistoryList() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PageMeta>({ nextCursor: null, hasMore: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/mine?limit=${PAGE_SIZE}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load bookings');
        return;
      }
      setBookings(data.data ?? []);
      setMeta(readMeta(data));
      setMoreError(null);
    } catch {
      setError('Network error — please try again');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !meta.hasMore || meta.nextCursor === null) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const res = await fetch(`/api/bookings/mine?limit=${PAGE_SIZE}&cursor=${meta.nextCursor}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setMoreError(data.error || 'Could not load more bookings');
        return;
      }
      setBookings((held) => appendUnique(held ?? [], data.data ?? []));
      setMeta(readMeta(data));
    } catch {
      setMoreError('Network error — please try again');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, meta]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!bookings) return <p className="text-gray-500 dark:text-gray-400">Loading…</p>;
  if (bookings.length === 0) return <p className="text-gray-500 dark:text-gray-400">No bookings yet.</p>;

  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} onCancelled={load} />
      ))}
      {moreError && <p className="text-center text-sm text-red-500">{moreError}</p>}
      {meta.hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg border border-cream-200 px-4 py-2 text-sm font-semibold transition hover:bg-cream-100 disabled:opacity-60 dark:border-gray-800 dark:hover:bg-gray-800/50"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
