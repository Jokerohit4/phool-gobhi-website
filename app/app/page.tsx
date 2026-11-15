import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AppLanding from '@/components/AppLanding';

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '';

export const metadata: Metadata = {
  title: 'Get the Phool Gobhi App',
  description:
    'Download the Phool Gobhi app — pay-per-session gym access in Gurugram. Book sessions, check in by QR, and skip the membership.',
  alternates: { canonical: '/app' },
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return <AppLanding />;
}
