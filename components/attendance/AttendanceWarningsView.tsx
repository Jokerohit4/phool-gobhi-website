'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AttendanceWarningSummary } from '@/lib/types';

export default function AttendanceWarningsView() {
  const [summary, setSummary] = useState<AttendanceWarningSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance/warnings', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load warnings');
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

  const sortedWarnings = [...summary.warnings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total warnings</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{summary.count}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Warning history ({sortedWarnings.length})</h2>
        {sortedWarnings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No warnings on record.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {sortedWarnings.map((warning) => (
              <li
                key={warning.bookingId}
                className="card-premium px-3 py-2 text-sm text-center"
              >
                <p className="font-medium">{warning.gymName || `Gym #${warning.gymId}`}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {new Date(warning.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  Was {warning.originalStartTime}–{warning.originalEndTime} → shifted to {warning.newStartTime}–{warning.newEndTime}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
