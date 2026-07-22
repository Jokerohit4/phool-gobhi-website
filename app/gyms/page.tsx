import type { Metadata } from 'next';
import GymBrowseList from '@/components/gyms/GymBrowseList';

export const metadata: Metadata = {
  title: 'Find Gyms in Gurugram — Pay Per Session | Phool Gobhi',
  description: 'Browse gyms in Gurugram and book a single session — no membership required. Compare prices, amenities, and ratings, then pay only for the sessions you use.',
  alternates: { canonical: '/gyms' },
};

export default function GymsPage() {
  return <GymBrowseList />;
}
