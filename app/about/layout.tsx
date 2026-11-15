import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Phool Gobhi — Your Everyday Health Companion',
  description: 'Meet Phool Gobhi: a health companion for everyday choices, health trends, and a clearer next step to discuss with your doctor.',
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
