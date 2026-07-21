'use client';

import { useEffect, useState } from 'react';
import GymCard from './GymCard';
import type { Gym } from '@/lib/types';
import { locationHeaders } from '@/lib/locationHolder';

export default function GymBrowseList() {
  const [gyms, setGyms] = useState<Gym[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
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
  }, [search]);

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

      {error && <p className="text-red-500">{error}</p>}
      {!gyms && !error && <p className="text-gray-500 dark:text-gray-400">Loading gyms…</p>}
      {gyms && gyms.length === 0 && <p className="text-gray-500 dark:text-gray-400">No gyms found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms?.map((gym) => <GymCard key={gym.id} gym={gym} />)}
      </div>
    </div>
  );
}
