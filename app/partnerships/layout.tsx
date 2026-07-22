import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Your Gym With Phool Gobhi',
  description: 'List your gym on Phool Gobhi and fill empty session slots with pay-per-visit customers in Gurugram — no membership admin, just more footfall.',
  alternates: { canonical: '/partnerships' },
};

export default function PartnershipsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
