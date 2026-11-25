import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Phool Gobhi Works — Your Health Companion',
  description: 'Set a goal, log your day, add your health records and see how you are really doing. How Phool Gobhi helps you build healthy habits and understand your health over time.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
