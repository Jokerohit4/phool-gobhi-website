import type { Metadata } from 'next';
import PartnerSignupForm from '@/components/auth/PartnerSignupForm';

export const metadata: Metadata = {
  title: 'Become a Partner | Phool Gobhi',
  robots: { index: false, follow: false },
};

export default function PartnerApplyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center section-padding bg-cream-50 dark:bg-gray-950">
      <PartnerSignupForm />
    </div>
  );
}
