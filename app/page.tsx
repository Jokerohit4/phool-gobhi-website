import HeroSection from '@/components/HeroSection';
import AttendanceStat from '@/components/AttendanceStat';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import LaunchBanner from '@/components/LaunchBanner';

export default async function Home() {
  return (
    <>
      <LaunchBanner />
      <HeroSection />
      <div className="relative bg-cream-50 dark:bg-gray-950 pb-16 -mt-8 transition-colors duration-300">
        <AttendanceStat />
      </div>
      <FeaturesSection />
      <PricingSection />
    </>
  );
}
