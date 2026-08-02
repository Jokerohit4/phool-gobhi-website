import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { gatewayFetch } from '@/lib/gateway-client';
import LaunchCountdown from '@/components/LaunchCountdown';

export const metadata: Metadata = {
  title: 'Coming Soon — Phool Gobhi',
  description: 'Phool Gobhi is launching soon in Gurugram — pay-per-session gym access, no membership. Gym owners can apply to partner right now.',
  alternates: { canonical: '/coming-soon' },
};

interface LaunchStatus {
  launchAt: string | null;
  isLive: boolean;
}

export default async function ComingSoonPage() {
  // Fail closed on a gateway hiccup (isLive: false) — the alternative,
  // failing open, would redirect straight to /gyms, which proxy.ts would
  // then bounce right back here, looping.
  let status: LaunchStatus = { launchAt: null, isLive: false };
  try {
    status = await gatewayFetch<LaunchStatus>('/api/auth/launch-status');
  } catch {
    // gateway unreachable — keep the fail-closed default above
  }
  if (status.isLive) redirect('/gyms');

  return (
    <div className="section-padding flex flex-col items-center text-center gap-8 min-h-[70vh] justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide uppercase text-sm">Gurugram</span>
        <h1 className="font-display text-5xl sm:text-6xl stroke-terracotta">Phool Gobhi is almost here</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl">
          Pay-per-session gym access, no membership. We&apos;re opening the doors soon — bookings and gym listings unlock at launch.
        </p>
      </div>

      <LaunchCountdown launchAt={status.launchAt} />

      <div className="flex flex-col items-center gap-2 mt-4">
        <p className="text-gray-600 dark:text-gray-400">Own a gym in Gurugram?</p>
        <Link href="/partner/apply" className="btn-primary">
          Partner with us →
        </Link>
      </div>
    </div>
  );
}
