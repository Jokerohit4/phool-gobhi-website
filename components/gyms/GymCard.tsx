import Link from 'next/link';
import type { Gym } from '@/lib/types';

export default function GymCard({ gym }: { gym: Gym }) {
  return (
    <Link
      href={`/gyms/${gym.id}`}
      className="card-premium p-5 flex flex-col gap-3 hover:shadow-lg transition-all"
    >
      <div className="aspect-video rounded-lg bg-cream-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-4xl">
        {gym.images?.[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gym.images[0].url} alt={gym.name} className="w-full h-full object-cover" />
        ) : (
          '🏋️'
        )}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{gym.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {gym.city}
          {gym.distanceKm != null && ` · ${gym.distanceKm.toFixed(1)} km away`}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{gym.sessionPrice}/session</span>
        {gym.ratingCount > 0 && (
          <span className="text-gray-500 dark:text-gray-400">★ {gym.rating.toFixed(1)} ({gym.ratingCount})</span>
        )}
      </div>
    </Link>
  );
}
