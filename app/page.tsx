import HeroSection from '@/components/HeroSection';
import AttendanceStat from '@/components/AttendanceStat';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsPreview from '@/components/TestimonialsPreview';
import ComingSoonContent from '@/components/ComingSoonContent';
import { gatewayFetch } from '@/lib/gateway-client';

interface LaunchStatus {
  launchAt: string | null;
  isLive: boolean;
}

export default async function Home() {
  // Fails open here (shows the normal homepage) on a gateway hiccup — unlike
  // proxy.ts's gate on /gyms, /book, /checkin (which fails closed since it's
  // actually protecting gym/booking data), there's nothing to leak by
  // showing the marketing homepage during a transient error.
  let status: LaunchStatus = { launchAt: null, isLive: true };
  try {
    status = await gatewayFetch<LaunchStatus>('/api/auth/launch-status');
  } catch {
    // keep the fail-open default above
  }

  if (!status.isLive) {
    return <ComingSoonContent launchAt={status.launchAt} />;
  }

  return (
    <>
      <HeroSection />
      <div className="relative bg-cream-50 dark:bg-gray-950 pb-16 -mt-8 transition-colors duration-300">
        <AttendanceStat />
      </div>
      <FeaturesSection />
      <TestimonialsPreview />
      <PricingSection />
    </>
  );
}
