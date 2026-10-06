'use client';

import { useEffect } from 'react';

// Root error boundary (Next 16: `unstable_retry` replaces the old `reset`
// prop). Catches render-time crashes that bubble to the app root and gives
// the visitor a way to recover instead of a blank screen.
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // TODO: pipe through the analytics events endpoint once an error-reporting
    // shape exists; console is the only sink today.
    console.error(error);
  }, [error]);

  return (
    <section className="section-padding container-custom text-center min-h-[50vh] flex flex-col items-center justify-center">
      <h1 className="font-display text-5xl sm:text-6xl mb-4">Something went wrong</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6">
        An unexpected error interrupted this page. Try again — if it keeps happening, reach us on
        WhatsApp.
      </p>
      <button onClick={() => unstable_retry()} className="btn-primary inline-block">
        Try again
      </button>
    </section>
  );
}