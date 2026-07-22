import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old Vercel-assigned domain -> new custom domain
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'phool-gobhi-website.vercel.app' }],
        destination: 'https://www.phoolgobhi.com/:path*',
        permanent: true,
      },
      // Apex domain -> www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'phoolgobhi.com' }],
        destination: 'https://www.phoolgobhi.com/:path*',
        permanent: true,
      },
      // .in domain (apex + www) -> canonical .com
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'phoolgobhi.in' }],
        destination: 'https://www.phoolgobhi.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.phoolgobhi.in' }],
        destination: 'https://www.phoolgobhi.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
