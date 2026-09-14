import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Phool Gobhi Works — Pay-Per-Session Gym Booking',
  description: 'Discover how Phool Gobhi works in four steps: browse live gyms, book a session, check in with a QR code, and pay only for the sessions you attend — no membership, ever.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}