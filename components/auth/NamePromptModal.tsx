'use client';

import { useState, type FormEvent } from 'react';
import { useSession } from './SessionProvider';

// OTP signup never collects a name (auth-service creates the user from just
// a phone number), so a brand-new customer has `user.name === null` — the
// header then falls back to a bare "Profile" label with nothing pointing
// them at how to fix that. This prompts for it right after login instead of
// leaving it undiscoverable until they hit the (separate, booking-only)
// ProfileCompletionGate. Deliberately non-dismissible (no backdrop-click, no
// skip button) — the user asked for the name to be mandatory up front rather
// than an optional nudge.
export default function NamePromptModal() {
  const { user, loading, refresh } = useSession();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading || !user || user.name) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save your name');
        return;
      }
      await refresh();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={submit}
        className="card-premium max-w-sm w-full p-6 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-prompt-title"
      >
        <h2 id="name-prompt-title" className="text-lg font-semibold">
          What should we call you?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add your name to continue — we need it to personalize your account and bookings.
        </p>
        <input
          type="text"
          autoFocus
          required
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save & continue'}
        </button>
      </form>
    </div>
  );
}
