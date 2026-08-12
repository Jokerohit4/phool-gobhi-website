import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AppLanding from '@/components/AppLanding';

const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '';
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '';

export const metadata: Metadata = {
  title: 'Get the Phool Gobhi App',
  description:
    'Download the Phool Gobhi app — pay-per-session gym access in Gurugram. Book sessions, check in by QR, and skip the membership.',
  alternates: { canonical: '/app' },
  robots: { index: false, follow: false },
};

export default function AppPage() {
  // Apps not released yet: send the merch-QR traffic to the homepage.
  // Once the stores go live, set NEXT_PUBLIC_PLAY_STORE_URL /
  // NEXT_PUBLIC_APP_STORE_URL and AppLanding's smart-link takes over.
  if (!PLAY_STORE_URL && !APP_STORE_URL) {
    redirect('/');
  }

  return <AppLanding />;
}
