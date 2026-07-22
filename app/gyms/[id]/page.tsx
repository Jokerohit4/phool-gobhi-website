import type { Metadata } from 'next';
import GymDetailClient from '@/components/gyms/GymDetailClient';
import JsonLd from '@/components/JsonLd';
import { gatewayFetch } from '@/lib/gateway-client';
import type { Gym } from '@/lib/types';

async function fetchGym(id: string): Promise<Gym | null> {
  try {
    const { data } = await gatewayFetch<{ data: Gym }>(`/api/gyms/${id}`);
    return data;
  } catch {
    return null;
  }
}

function gymJsonLd(gym: Gym, id: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ExerciseGym',
    name: gym.name,
    description: gym.description || undefined,
    url: `https://www.phoolgobhi.com/gyms/${id}`,
    image: gym.images?.[0]?.url,
    telephone: gym.phone || undefined,
    priceRange: `₹${gym.sessionPrice}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: gym.address,
      addressLocality: gym.city,
      addressRegion: gym.state,
      addressCountry: 'IN',
    },
    ...(gym.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: gym.rating,
            reviewCount: gym.ratingCount,
          },
        }
      : {}),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const gym = await fetchGym(id);
  if (!gym) {
    // Gateway unreachable / gym not found — fall back to generic metadata.
    return {
      title: 'Gym Details | Phool Gobhi',
      description: 'Book a pay-per-session gym slot in Gurugram — no membership required.',
    };
  }
  const title = `${gym.name} — Book a Session in ${gym.city} | Phool Gobhi`;
  const description = gym.description
    ? gym.description.slice(0, 155)
    : `Book a pay-per-session slot at ${gym.name} in ${gym.city}. No membership, no long-term commitment — pay ₹${gym.sessionPrice} per session.`;
  return {
    title,
    description,
    alternates: { canonical: `/gyms/${id}` },
  };
}

export default async function GymDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gym = await fetchGym(id);
  return (
    <>
      {gym && <JsonLd data={gymJsonLd(gym, id)} />}
      <GymDetailClient gymId={id} />
    </>
  );
}
