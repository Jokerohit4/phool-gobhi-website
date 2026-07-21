'use client';

import { useEffect, useState } from 'react';
import GymImageGallery from './GymImageGallery';
import SubscriptionPlans from './SubscriptionPlans';
import SlotPicker from './SlotPicker';
import type { Gym } from '@/lib/types';
import { locationHeaders } from '@/lib/locationHolder';

export default function GymDetailClient({ gymId }: { gymId: string }) {
  const [gym, setGym] = useState<Gym | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/gyms/${gymId}`, { headers: locationHeaders() })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Gym not found');
          return;
        }
        setGym(data.data);
      })
      .catch(() => setError('Network error — please try again'));
  }, [gymId]);

  if (error) {
    return (
      <div className="section-padding container-custom">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="section-padding container-custom">
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="section-padding container-custom space-y-8">
      <GymImageGallery images={gym.images} alt={gym.name} />

      <div>
        <h1 className="text-3xl font-bold">{gym.name}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {gym.address}, {gym.city}
          {gym.distanceKm != null && ` · ${gym.distanceKm.toFixed(1)} km away`}
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{gym.sessionPrice}/session</span>
          <span className="text-gray-500 dark:text-gray-400">{gym.openTime} – {gym.closeTime}</span>
          {gym.ratingCount > 0 && (
            <span className="text-gray-500 dark:text-gray-400">★ {gym.rating.toFixed(1)} ({gym.ratingCount} reviews)</span>
          )}
        </div>
        {gym.description && <p className="mt-4 text-gray-700 dark:text-gray-300">{gym.description}</p>}
        {gym.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {gym.amenities.map((a) => (
              <span key={a} className="text-xs bg-cream-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-700 dark:text-gray-300">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      <SubscriptionPlans gymId={gym.id} />

      <SlotPicker gymId={gymId} />
    </div>
  );
}
