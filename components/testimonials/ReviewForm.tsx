'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/auth/SessionProvider';

export default function ReviewForm() {
  const { user, loading } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  if (!user || user.role !== 'customer') {
    return (
      <div className="card-premium p-6 text-center max-w-xl mx-auto">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <Link href="/login" className="underline">
            Log in
          </Link>{' '}
          as a customer to leave a review.
        </p>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="card-premium p-6 text-center max-w-xl mx-auto">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Thanks! Your review is awaiting approval before it shows here publicly.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/platform-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to submit review');
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium p-6 flex flex-col gap-4 max-w-xl mx-auto">
      <h2 className="font-display text-2xl">Leave a review</h2>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={n <= rating}
            className={`text-2xl leading-none ${n <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell us about your experience (optional)"
        rows={3}
        maxLength={1000}
        className="rounded border px-3 py-2 text-sm bg-transparent"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-fit">
        {status === 'submitting' ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
