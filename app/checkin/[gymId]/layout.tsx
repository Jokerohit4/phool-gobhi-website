import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check In | Phool Gobhi',
  robots: { index: false, follow: false },
};

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
