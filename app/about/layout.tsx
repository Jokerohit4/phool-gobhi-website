import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Phool Gobhi — Pay-Per-Session Gym Booking',
  description: 'Phool Gobhi is building pay-per-session gym access for Gurugram — no memberships, no 12-month contracts, just book a session and go.',
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
