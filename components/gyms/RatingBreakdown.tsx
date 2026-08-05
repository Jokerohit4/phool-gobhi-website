import type { Gym } from '@/lib/types';

interface Row {
  label: string;
  value: number | null;
  count: number;
}

// Order matters: overall first, then the categories customers actually rate,
// with Google last since it's sourced externally rather than from Phool
// Gobhi reviews. A row is skipped entirely (not shown at 0) when nobody has
// rated that category yet — same "count > 0" guard already used for the
// single overall rating elsewhere (GymCard/GymDetailClient).
function rows(gym: Gym): Row[] {
  return [
    { label: 'Overall', value: gym.rating, count: gym.ratingCount },
    { label: 'Equipment', value: gym.equipmentRating, count: gym.equipmentRatingCount },
    { label: 'Cleanliness', value: gym.cleanlinessRating, count: gym.cleanlinessRatingCount },
    { label: 'Good Trainer', value: gym.trainerRating, count: gym.trainerRatingCount },
    { label: 'Value for Money', value: gym.valueForMoneyRating, count: gym.valueForMoneyRatingCount },
    { label: 'Staff Behaviour', value: gym.staffBehaviourRating, count: gym.staffBehaviourRatingCount },
    { label: 'Crowd Level', value: gym.crowdRating, count: gym.crowdRatingCount },
    { label: 'Google Rating', value: gym.googleRating, count: gym.googleRatingCount ?? 0 },
  ].filter((r) => r.count > 0 && r.value != null);
}

export default function RatingBreakdown({ gym }: { gym: Gym }) {
  const visible = rows(gym);
  if (visible.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Ratings</h2>
      <div className="mt-3 flex flex-col gap-2.5">
        {visible.map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <span className="w-36 shrink-0 text-gray-700 dark:text-gray-300">{row.label}</span>
            <div
              className="h-2 min-w-[4rem] flex-1 overflow-hidden rounded-full bg-cream-100 dark:bg-gray-800"
              role="img"
              aria-label={`${row.label}: ${row.value!.toFixed(1)} out of 5, ${row.count} rating${row.count === 1 ? '' : 's'}`}
            >
              <div
                className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
                style={{ width: `${Math.max((row.value! / 5) * 100, 4)}%` }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-gray-500 dark:text-gray-400">
              {row.value!.toFixed(1)} <span className="text-xs">({row.count})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
