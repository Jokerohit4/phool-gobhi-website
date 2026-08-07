'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GymClass, ClassOccurrence } from '@/lib/types';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassesSection({ gymId }: { gymId: string }) {
  const [classes, setClasses] = useState<GymClass[] | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/gyms/${gymId}/classes`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) return;
        setClasses(((data.data ?? []) as GymClass[]).filter((c) => c.isActive));
      })
      // Non-critical section — a failed fetch just hides it rather than
      // showing an error block on the gym page.
      .catch(() => {});
  }, [gymId]);

  if (!classes || classes.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Classes</h2>
      <div className="space-y-3">
        {classes.map((c) => (
          <ClassRow
            key={c.id}
            gymId={gymId}
            gymClass={c}
            expanded={expandedId === c.id}
            onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ClassRow({
  gymId,
  gymClass,
  expanded,
  onToggle,
}: {
  gymId: string;
  gymClass: GymClass;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [occurrences, setOccurrences] = useState<ClassOccurrence[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!expanded || occurrences) return;
    fetch(`/api/gyms/${gymId}/classes/${gymClass.id}/occurrences`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) setOccurrences(data.data ?? []);
      })
      .catch(() => {});
  }, [expanded, occurrences, gymId, gymClass.id]);

  const pickDate = (date: string) => {
    router.push(`/book/${gymId}/confirm?classId=${gymClass.id}&date=${date}`);
  };

  return (
    <div className="card-premium p-4">
      <button onClick={onToggle} className="w-full text-left flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">{gymClass.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {gymClass.instructor && `${gymClass.instructor} · `}
            {DAY_LABELS[gymClass.dayOfWeek]} · {gymClass.startTime}–{gymClass.endTime}
          </div>
        </div>
        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          {gymClass.price != null ? `₹${gymClass.price}` : 'Included with subscription'}
        </div>
      </button>
      {gymClass.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{gymClass.description}</p>
      )}
      {expanded && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {occurrences === null && <p className="text-sm text-gray-500 dark:text-gray-400">Loading dates…</p>}
          {occurrences?.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming dates available.</p>
          )}
          {occurrences?.map((o) => (
            <button
              key={o.date}
              onClick={() => pickDate(o.date)}
              disabled={o.available === 0}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap border text-left ${
                o.available === 0
                  ? 'opacity-40 cursor-not-allowed border-cream-200 dark:border-gray-700'
                  : 'border-cream-200 dark:border-gray-700 hover:border-emerald-500'
              }`}
            >
              {new Date(o.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              <span className="block text-xs text-gray-400">{o.available} left</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
