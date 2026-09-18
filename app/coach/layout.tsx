import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coach | Phool Gobhi',
  // Same posture as every account-scoped page: this is a private surface and
  // has nothing to offer a search engine.
  robots: { index: false, follow: false },
};

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
