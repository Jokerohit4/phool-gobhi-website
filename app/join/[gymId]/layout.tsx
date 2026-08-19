import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join on Phool Gobhi',
  robots: { index: false, follow: false },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
