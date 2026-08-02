import Link from 'next/link';
import LaunchCountdown from '@/components/LaunchCountdown';

interface Props {
  launchAt: string | null;
}

// Shared by the homepage (rendered in place of the normal marketing
// content while the launch gate is active) and proxy.ts's redirect target
// for /gyms, /book, /checkin.
export default function ComingSoonContent({ launchAt }: Props) {
  return (
    <div className="section-padding flex flex-col items-center text-center gap-8 min-h-[70vh] justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide uppercase text-sm">Gurugram</span>
        <h1 className="font-display text-5xl sm:text-6xl stroke-terracotta">Phool Gobhi is almost here</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl">
          Pay-per-session gym access, no membership. We&apos;re opening the doors soon — bookings and gym listings unlock at launch.
        </p>
      </div>

      <LaunchCountdown launchAt={launchAt} />

      <div className="flex flex-col items-center gap-2 mt-4">
        <p className="text-gray-600 dark:text-gray-400">Own a gym in Gurugram?</p>
        <Link href="/partner/apply" className="btn-primary">
          Partner with us →
        </Link>
      </div>
    </div>
  );
}
