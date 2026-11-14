import type { Metadata } from 'next';
import { Geist, Geist_Mono, Bebas_Neue } from 'next/font/google';
import './globals.css';
import SiteChrome from '@/components/SiteChrome';
import MotionProvider from '@/components/MotionProvider';
import { SessionProvider } from '@/components/auth/SessionProvider';
import AnalyticsBootstrap from '@/components/AnalyticsBootstrap';
import JsonLd from '@/components/JsonLd';

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Phool Gobhi',
  url: 'https://www.phoolgobhi.com',
  logo: 'https://www.phoolgobhi.com/broc-logo.png',
  email: 'hello@phoolgobhi.com',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9354859197',
    contactType: 'customer service',
    areaServed: 'IN',
  },
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Phool Gobhi',
  url: 'https://www.phoolgobhi.com',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.phoolgobhi.com'),
  title: 'Phool Gobhi — Your health and fitness buddy',
  description: 'Meet Gobhi. Bring your water, food, workouts, history and little wins together with Phool Gobhi, your everyday health and fitness buddy.',
  keywords: 'Phool Gobhi, fitness buddy, water logging, food journal, workout logging, fitness history, Gobhi coins, gym access',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Phool Gobhi — Your health and fitness buddy',
    description: 'Your training, daily habits and little wins. Meet Gobhi and bring your everyday together.',
    url: 'https://www.phoolgobhi.com',
    siteName: 'Phool Gobhi',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <head>
        <JsonLd data={ORGANIZATION_JSON_LD} />
        <JsonLd data={WEBSITE_JSON_LD} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  const root = document.documentElement;
                  
                  if (theme === 'light') {
                    root.classList.remove('dark');
                  } else if (theme === 'dark') {
                    root.classList.add('dark');
                  } else if (theme === 'system') {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (isDark) {
                      root.classList.add('dark');
                    } else {
                      root.classList.remove('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream-50 dark:bg-gray-950 transition-colors duration-300">
        <SessionProvider>
          <MotionProvider>
            <AnalyticsBootstrap />
            <SiteChrome>{children}</SiteChrome>
          </MotionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
