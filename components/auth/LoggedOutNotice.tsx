'use client';

import Link from 'next/link';

// Replaces the bare "Please log in to view your X." dead-ends on account
// pages with an actual path forward. Purely presentational — the caller
// decides to render it when `useSession()` reports no user.
export default function LoggedOutNotice({ what }: { what: string }) {
  return (
    <div className="section-padding container-custom">
      <p className="text-gray-600 dark:text-gray-400">{what}</p>
      <Link href="/login" className="btn-primary inline-block mt-4">
        Log in to continue
      </Link>
    </div>
  );
}