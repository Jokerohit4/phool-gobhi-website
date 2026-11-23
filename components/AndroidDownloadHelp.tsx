'use client';

import { useState, type FormEvent } from 'react';

const INPUT_CLASS = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white';
const SUBMIT_ERROR = 'We couldn’t send your request. Please try again.';

export default function AndroidDownloadHelp() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = new FormData(event.currentTarget);
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/download/android/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), phone: form.get('phone') }),
      });

      if (response.status === 400 || response.status === 429) {
        const result = await response.json();
        setError(result.error || SUBMIT_ERROR);
      } else if (response.status === 201) {
        setSubmitted(true);
      } else {
        setError(SUBMIT_ERROR);
      }
    } catch {
      setError(SUBMIT_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card-premium mt-7 p-5 sm:p-7" aria-labelledby="android-help-title">
      <h2 id="android-help-title" className="text-xl font-semibold text-gray-900 dark:text-white">
        Having trouble downloading?
      </h2>
      <div role="status" className={submitted ? 'mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-300' : undefined}>
        {submitted && 'Thanks! We received your request and will follow up with a download link.'}
      </div>
      {!submitted && (
        <>
          <p className="mb-4 mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Share the email you use for Google Play and your contact number. We&apos;ll help fix the issue and send you the download link.
          </p>
          <form method="post" onSubmit={handleSubmit}>
            <fieldset disabled={submitting} className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                Google Play email
                <input type="email" name="email" autoComplete="email" maxLength={254} required className={INPUT_CLASS} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                Contact number
                <input type="tel" name="phone" autoComplete="tel" maxLength={32} required className={INPUT_CLASS} />
              </label>
            </fieldset>
            {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full disabled:opacity-60 sm:w-auto">
              {submitting ? 'Sending…' : 'Request download help'}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
