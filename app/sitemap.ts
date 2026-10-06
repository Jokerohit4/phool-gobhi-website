import type { MetadataRoute } from 'next';
import { gatewayFetch } from '@/lib/gateway-client';
import type { Gym } from '@/lib/types';
import { blogPosts } from '@/lib/blogPosts';

const BASE_URL = 'https://www.phoolgobhi.com';

// terms + privacy were missing while cancellation/delete-account were listed —
// odd, since those two are the ones every policy footer links to. They're
// drafts pending legal review (see app/policies), but draft or not they're
// public pages and should be crawlable like the other policy pages.
const STATIC_ROUTES = ['', '/about', '/gyms', '/contact', '/careers', '/partnerships', '/policies/terms', '/policies/privacy', '/policies/cancellation', '/policies/delete-account', '/blog', '/testimonials', '/how-it-works', '/pricing', '/team'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.5,
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

  return [...staticEntries, ...blogEntries, ...gymEntries];
}
