'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GymClass, ClassOccurrence } from '@/lib/types';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Monday-first display order — how gym owners actually describe a
// schedule ("Mon-Fri evenings"), not the DB's Sunday-first dayOfWeek.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface TimeBlock {
  startTime: string;
  endTime: string;
  days: number[]; // Monday-first order
  classIdByDay: Record<number, number>;
}

interface ClassGroup {
  key: string;
  name: string;
  instructor: string | null;
  description: string | null;
  price: number | null;
  blocks: TimeBlock[];
}

// Bulk entry (partner-web) submits one GymClass row per day for what the
// partner sees as a single class ("Yoga, Mon/Wed/Thu mornings + Mon-Fri
// evenings"). Group those rows back into one card per distinct class, with
// one line per distinct time block, so the customer doesn't see the same
// class name repeated once per underlying day-row.
function groupClasses(classes: GymClass[]): ClassGroup[] {
  const groups = new Map<string, ClassGroup>();
  for (const c of classes) {
    const key = `${c.name}|${c.instructor ?? ''}|${c.description ?? ''}|${c.price ?? 'null'}`;
    let group = groups.get(key);
    if (!group) {
      group = { key, name: c.name, instructor: c.instructor, description: c.description, price: c.price, blocks: [] };
      groups.set(key, group);
    }
    const blockKey = `${c.startTime}-${c.endTime}`;
    let block = group.blocks.find((b) => `${b.startTime}-${b.endTime}` === blockKey);
    if (!block) {
      block = { startTime: c.startTime, endTime: c.endTime, days: [], classIdByDay: {} };
      group.blocks.push(block);
    }
    block.days.push(c.dayOfWeek);
    block.classIdByDay[c.dayOfWeek] = c.id;
  }
  for (const g of groups.values()) {
    g.blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (const b of g.blocks) b.days.sort((a, d) => DISPLAY_ORDER.indexOf(a) - DISPLAY_ORDER.indexOf(d));
  }
  return [...groups.values()];
}

// Compresses a set of days into e.g. "Mon-Fri", "Mon, Wed, Thu", or "Every
// day" — runs of 3+ consecutive days collapse to a range, shorter runs and
// gaps stay comma-separated.
function formatDays(days: number[]): string {
  if (days.length === 7) return 'Every day';
  const positions = days.map((d) => DISPLAY_ORDER.indexOf(d)).sort((a, b) => a - b);

  const runs: number[][] = [];
  for (const pos of positions) {
    const last = runs[runs.length - 1];
    if (last && pos === last[last.length - 1] + 1) {
      last.push(pos);
    } else {
      runs.push([pos]);
    }
  }

  return runs
    .map((run) => {
      const first = DAY_SHORT[DISPLAY_ORDER[run[0]]];
      const last = DAY_SHORT[DISPLAY_ORDER[run[run.length - 1]]];
      return run.length >= 3 ? `${first}-${last}` : run.map((p) => DAY_SHORT[DISPLAY_ORDER[p]]).join(', ');
    })
    .join(', ');
}

function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return mStr === '00' ? `${h12} ${ampm}` : `${h12}:${mStr} ${ampm}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function ClassesSection({ gymId }: { gymId: string }) {
  const [classes, setClasses] = useState<GymClass[] | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

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

  const groups = groupClasses(classes);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Classes</h2>
      <div className="space-y-3">
        {groups.map((g) => (
          <ClassCard
            key={g.key}
            gymId={gymId}
            group={g}
            expandedBlockKey={expandedKey?.startsWith(g.key) ? expandedKey : null}
            onToggleBlock={(blockKey) => {
              const fullKey = `${g.key}::${blockKey}`;
              setExpandedKey(expandedKey === fullKey ? null : fullKey);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ClassCard({
  gymId,
  group,
  expandedBlockKey,
  onToggleBlock,
}: {
  gymId: string;
  group: ClassGroup;
  expandedBlockKey: string | null;
  onToggleBlock: (blockKey: string) => void;
}) {
  return (
    <div className="card-premium p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{group.name}</div>
          {group.instructor && <div className="text-sm text-gray-500 dark:text-gray-400">{group.instructor}</div>}
        </div>
        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          {group.price != null ? `₹${group.price}` : 'Included with subscription'}
        </div>
      </div>
      {group.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{group.description}</p>}
      <div className="mt-3 flex flex-col gap-2">
        {group.blocks.map((block) => {
          const blockKey = `${block.startTime}-${block.endTime}`;
          return (
            <ClassBlockRow
              key={blockKey}
              gymId={gymId}
              block={block}
              expanded={expandedBlockKey === `${group.key}::${blockKey}`}
              onToggle={() => onToggleBlock(blockKey)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ClassBlockRow({
  gymId,
  block,
  expanded,
  onToggle,
}: {
  gymId: string;
  block: TimeBlock;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [occurrences, setOccurrences] = useState<(ClassOccurrence & { classId: number })[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!expanded || occurrences) return;
    Promise.all(
      block.days.map(async (day) => {
        const classId = block.classIdByDay[day];
        const res = await fetch(`/api/gyms/${gymId}/classes/${classId}/occurrences`);
        const data = await res.json();
        if (!res.ok) return [];
        return ((data.data ?? []) as ClassOccurrence[]).map((o) => ({ ...o, classId }));
      })
    )
      .then((results) => setOccurrences(results.flat().sort((a, b) => a.date.localeCompare(b.date))))
      .catch(() => setOccurrences([]));
  }, [expanded, occurrences, gymId, block]);

  const pickDate = (classId: number, date: string) => {
    router.push(`/book/${gymId}/confirm?classId=${classId}&date=${date}`);
  };

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-cream-50 dark:hover:bg-gray-800/50"
      >
        <span className="text-sm text-gray-600 dark:text-gray-300">{formatDays(block.days)}</span>
        <span className="text-sm font-medium whitespace-nowrap">{formatTimeRange(block.startTime, block.endTime)}</span>
      </button>
      {expanded && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 pl-2">
          {occurrences === null && <p className="text-sm text-gray-500 dark:text-gray-400">Loading dates…</p>}
          {occurrences?.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming dates available.</p>
          )}
          {occurrences?.map((o) => (
            <button
              key={`${o.classId}-${o.date}`}
              onClick={() => pickDate(o.classId, o.date)}
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
