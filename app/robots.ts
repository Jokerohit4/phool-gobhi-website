import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/book/', '/checkin/', '/login', '/pitch-deck'],
    },
    sitemap: 'https://www.phoolgobhi.com/sitemap.xml',
  };
}
