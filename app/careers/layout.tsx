import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers at Phool Gobhi',
  description: 'Join Phool Gobhi and help build pay-per-session gym access for India. See open roles and apply.',
  alternates: { canonical: '/careers' },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
