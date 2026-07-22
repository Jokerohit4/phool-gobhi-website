'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AttendanceSummary } from '@/lib/types';

export default function AttendanceSummaryView() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance/summary', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load attendance');
        return;
      }
      setSummary(data.data ?? null);
    } catch {
      setError('Network error — please try again');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!summary) return <p className="text-gray-500 dark:text-gray-400">Loading…</p>;

  const lastAttended = summary.lastAttendedAt
    ? new Date(summary.lastAttendedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'No sessions yet';

  const sortedDates = [...summary.attendedDates].sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total sessions attended</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{summary.totalAttended}</p>
        </div>
        <div className="card-premium p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{summary.thisMonthAttended}</p>
        </div>
        <div className="card-premium p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Last attended</p>
          <p className="text-lg font-semibold">{lastAttended}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Attended dates ({sortedDates.length})</h2>
        {sortedDates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No sessions attended yet.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {sortedDates.map((date) => (
              <li
                key={date}
                className="card-premium px-3 py-2 text-sm text-center"
              >
                {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
