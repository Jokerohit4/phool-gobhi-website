import Link from 'next/link';
import type { Gym } from '@/lib/types';

export default function GymCard({ gym }: { gym: Gym }) {
  // A card thumbnail needs a static image — pick the first actual photo,
  // skipping past any video, rather than always using images[0] (which
  // would try to render a video file through an <img> tag and just show a
  // broken-image icon).
  const thumbnail = gym.images?.find((img) => img.mediaType !== 'video');
  return (
    <Link
      href={`/gyms/${gym.id}`}
      className="card-premium p-5 flex flex-col gap-3 hover:shadow-lg transition-all"
    >
      <div className="aspect-video rounded-lg bg-cream-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-4xl">
        {thumbnail?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail.url} alt={gym.name} className="w-full h-full object-cover" />
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
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          {gym.ratingCount > 0 && <span>★ {gym.rating.toFixed(1)} ({gym.ratingCount})</span>}
          {gym.googleRatingCount != null && gym.googleRatingCount > 0 && (
            <span title={`${gym.googleRatingCount} Google ratings`}>G {gym.googleRating?.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
