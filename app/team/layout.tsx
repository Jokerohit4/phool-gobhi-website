import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — The Team Behind Phool Gobhi',
  description: 'Phool Gobhi is a small, scrappy team building pay-per-session gym access so fitness stops being gated behind annual memberships. Meet the founder and find open roles.',
  alternates: { canonical: '/team' },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}