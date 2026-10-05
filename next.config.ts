import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Apple's Universal Links file must live at the dot-prefixed
        // .well-known path, which the App Router can't host directly (it
        // ignores dot-directories), so it comes from a route handler that can
        // set the JSON content type a file in public/ cannot.
        //
        // beforeFiles matters: it runs before static/public resolution, so
        // this wins over any file that might later sit at that path. An
        // afterFiles rewrite would lose to public/ and silently serve the
        // wrong content type.
        source: '/.well-known/apple-app-site-association',
        destination: '/api/apple-app-site-association',
      },
      // Apple's documented legacy path, in case a device looks there instead.
      {
        source: '/apple-app-site-association',
        destination: '/api/apple-app-site-association',
      },
    ];
  },
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
