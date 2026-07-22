import HeroSection from '@/components/HeroSection';
import AttendanceStat from '@/components/AttendanceStat';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="bg-cream-50 dark:bg-gray-950 pb-16 -mt-8 transition-colors duration-300">
        <AttendanceStat />
      </div>
      <FeaturesSection />
      <PricingSection />
    </>
  );
}
