'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useSession } from '@/components/auth/SessionProvider';

// booking-service requires name + dateOfBirth to already be set before it
// will create a booking (services/booking-service/services/bookingService.js,
// createBooking) — both are optional at OTP signup, so this is the website's
// chance to collect them with a clear UI instead of surfacing that as a raw
// booking-creation error deep in the payment flow.
export default function ProfileCompletionGate({ children }: { children: ReactNode }) {
  const { user, loading, refresh } = useSession();
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p className="text-gray-500 dark:text-gray-400">Loading…</p>;

  if (!user) {
    return <p className="text-gray-500 dark:text-gray-400">Please log in to continue.</p>;
  }

  const needsCompletion = !user.name || !user.dateOfBirth;
  if (!needsCompletion) return <>{children}</>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dateOfBirth }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save profile');
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
    <form onSubmit={submit} className="card-premium p-6 max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Complete your profile to book</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">We need your name and date of birth before you can book a session.</p>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Full name
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Date of birth
        <input
          type="date"
          required
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="mt-1 w-full rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Save & continue'}
      </button>
    </form>
  );
}
