'use client';

import { useCallback, useEffect, useState } from 'react';
import GymCard from './GymCard';
import type { Gym } from '@/lib/types';
import { locationHeaders, locationHolder } from '@/lib/locationHolder';

export default function GymBrowseList() {
  const [gyms, setGyms] = useState<Gym[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    setGyms(null);
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        const res = await fetch(`/api/gyms?${params.toString()}`, {
          signal: controller.signal,
          headers: locationHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Could not load gyms');
          return;
        }
        setGyms(data.data ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setError('Network error — please try again');
      }
    }, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  // Loaded, empty, and not a search — explain the *likely* cause from the
  // boot-time GPS outcome (denied/off vs just no fix yet) instead of a
  // dead-end. The empty string falls through to a neutral message.
  const emptyHint = (() => {
    const outcome = locationHolder.outcome;
    if (outcome === 'denied')
      return 'Gym results are ordered by distance, but location permission is off. Turn on site location access (or search a city) to see gyms near you.';
    if (outcome === 'timeout' || outcome === 'error')
      return 'We could not get your location, so distance-based ordering is off. Try again or search a city.';
    return 'No gyms found. Try a city name (like "Gurugram"), or enable location to see gyms near you.';
  })();

  return (
    <div className="section-padding container-custom">
      <h1 className="text-3xl font-bold mb-6">Find a gym</h1>
      <input
        type="search"
        placeholder="Search by gym name or city…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md mb-8 rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {error && (
        <div className="mb-6">
          <p className="text-red-500">{error}</p>
          <button onClick={retry} className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Try again
          </button>
        </div>
      )}

      {!gyms && !error && <p className="text-gray-500 dark:text-gray-400">Loading gyms…</p>}

      {gyms && gyms.length === 0 && (
        <div className="text-gray-500 dark:text-gray-400">
          <p>{search ? `No gyms match "${search}". Try a city name or remove the search.` : emptyHint}</p>
        </div>
      )}

      {/* Only render the grid once a response has arrived — while loading it
          was an empty container, which is what made a slow first request look
          like "no gyms". */}
      {gyms && gyms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} />
          ))}
        </div>
      )}
    </div>
  );
}