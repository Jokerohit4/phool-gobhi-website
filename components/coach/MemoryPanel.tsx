'use client';

import { useCallback, useEffect, useState } from 'react';

interface Memory {
  id: number;
  key: string;
  value: string;
  source: string;
  updatedAt: string;
}

// Mirrors MEMORY_KEYS in health-service's memoryService. Display only — the
// server validates the real list, so a drift here shows a bad label rather
// than letting a bad key through.
const KEY_LABELS: Record<string, string> = {
  goal: 'Goal',
  injury_mentioned: 'Injury mentioned',
  allergy: 'Allergy',
  equipment: 'Equipment',
  preference: 'Preference',
};

/// Groups rows by category while preserving the server's ordering, which is
/// safety-tier first. A plain object would not guarantee that — integer-like
/// keys aside, relying on insertion order for display ordering is the kind of
/// thing that works until someone renames a key — so this walks the array once
/// and keeps first-seen order explicitly.
function groupByKey(rows: Memory[]): [string, Memory[]][] {
  const groups = new Map<string, Memory[]>();
  for (const row of rows) {
    const existing = groups.get(row.key);
    if (existing) existing.push(row);
    else groups.set(row.key, [row]);
  }
  return [...groups.entries()];
}

/// What the coach has learned about you, and the controls to fix it.
///
/// These facts are written by a model from things you said, and they are
/// replayed into every future conversation. A fact nobody can see is a fact
/// nobody can correct, which is why this panel is not optional.
export default function MemoryPanel() {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/fitness-assistant/memories', { cache: 'no-store' });
      const body = await res.json();
      // A missing list is not worth an error banner in a secondary panel — the
      // chat itself still works without it.
      if (!res.ok) return;
      setMemories(body.data ?? []);
    } catch {
      /* same reasoning */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function forget(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/fitness-assistant/memories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Could not remove that');
      }
      // Optimistic removal would be wrong here: if the delete failed, the fact
      // is still in every future prompt, and showing it gone would be a lie
      // about what the coach knows.
      setMemories((prev) => (prev ?? []).filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that');
    } finally {
      setBusyId(null);
    }
  }

  if (!memories || memories.length === 0) return null;

  return (
    <section className="card-premium mt-4 p-4" aria-labelledby="coach-memory-heading">
      <h2 id="coach-memory-heading" className="text-sm font-semibold">
        What your coach remembers
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        Picked up from your chats and used in every conversation. Remove anything
        that&apos;s wrong.
      </p>

      {/* Grouped, because a category now holds many facts — twelve rows each
          prefixed "Allergy:" is a list nobody reads. The server already
          returns them safety-tier first, so preserving its order here keeps
          the panel and the prompt agreeing about what matters. */}
      <div className="mt-3 space-y-3">
        {groupByKey(memories).map(([key, rows]) => (
          <div key={key}>
            <h3 className="text-xs font-semibold text-gray-500">
              {KEY_LABELS[key] ?? key}
            </h3>
            <ul className="mt-1 space-y-1">
              {rows.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 break-words">
                    {m.value}
                    {/* An inferred fact and a stated one carry different
                        weight, and the person should be able to tell which is
                        which before deciding whether to trust it. */}
                    {m.source === 'extracted' && (
                      <span className="ml-1 text-xs text-gray-400">(inferred)</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => forget(m.id)}
                    disabled={busyId === m.id}
                    className="shrink-0 text-xs text-gray-500 underline hover:text-red-500 disabled:opacity-50"
                  >
                    {busyId === m.id ? 'Removing…' : 'Forget'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
