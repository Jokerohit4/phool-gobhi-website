import Link from 'next/link';
import { gatewayFetch } from '@/lib/gateway-client';
import LaunchBannerCountdown from './LaunchBannerCountdown';

interface LaunchStatus {
  launchAt: string | null;
  isLive: boolean;
}

// Homepage-only announcement strip while the launch gate (admin-controlled,
// see backend's LaunchGateSetting) is active — gyms/booking themselves
// redirect to /coming-soon via proxy.ts, but the homepage stays live with
// its normal marketing content plus this banner instead of being replaced
// outright. Renders nothing once live, and fails silently (renders nothing)
// on a gateway error — a missing banner has no functional consequence,
// unlike proxy.ts's gate, which fails closed for a real reason.
export default async function LaunchBanner() {
  let status: LaunchStatus;
  try {
    status = await gatewayFetch<LaunchStatus>('/api/auth/launch-status');
  } catch {
    return null;
  }
  if (status.isLive || !status.launchAt) return null;

  return (
    <div className="bg-emerald-600 text-white text-sm sm:text-base">
      <div className="container-custom flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center">
        <span>Launching in Gurugram soon —</span>
        <LaunchBannerCountdown launchAt={status.launchAt} />
        <Link href="/partner/apply" className="underline underline-offset-2 hover:no-underline">
          Own a gym? Partner with us →
        </Link>
      </div>
    </div>
  );
}
