import Link from 'next/link';

// Root 404 page — replaces the bare default for anyone landing on a bad
// route (or a gym id / blog slug that no longer exists).
export default function NotFound() {
  return (
    <section className="section-padding container-custom text-center min-h-[50vh] flex flex-col items-center justify-center">
      <h1 className="font-display text-5xl sm:text-6xl mb-4">Page not found</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6">
        That page has moved or never existed. Head back to the home page or find a gym.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary inline-block">
          Go home
        </Link>
        <Link href="/gyms" className="btn-secondary inline-block">
          Browse gyms
        </Link>
      </div>
    </section>
  );
}