import type { MetadataRoute } from 'next';
import { gatewayFetch } from '@/lib/gateway-client';
import type { Gym } from '@/lib/types';

const BASE_URL = 'https://www.phoolgobhi.com';

const STATIC_ROUTES = ['', '/about', '/gyms', '/contact', '/careers', '/partnerships', '/policies/cancellation'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  let gymEntries: MetadataRoute.Sitemap = [];
  try {
    const { data } = await gatewayFetch<{ data: Gym[] }>('/api/gyms');
    gymEntries = data.map((gym) => ({
      url: `${BASE_URL}/gyms/${gym.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch {
    // Gateway unreachable at build/request time — ship the static routes alone
    // rather than failing the whole sitemap.
  }

  return [...staticEntries, ...gymEntries];
}
