import type { Metadata } from 'next';
import OtpForm from '@/components/auth/OtpForm';
import AppDownloadCard from '@/components/AppDownloadCard';

export const metadata: Metadata = {
  title: 'Log In | Phool Gobhi',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  // Only ever a same-site path — never follow an absolute/external URL from
  // a query param (open-redirect guard). "//evil.com" is rejected too: a
  // leading double slash is browser-protocol-relative, not a site-relative path.
  const isSafeRelativePath = (p?: string): p is string => !!p && p.startsWith('/') && !p.startsWith('//');
  const redirectTo = isSafeRelativePath(redirect) ? redirect : '/gyms';
  // partner-web's proxy.ts sends unauthenticated visitors here with the
  // path they originally requested (e.g. "/bookings/123") in `redirect` —
  // same safety check applies, since OtpForm appends it to a fixed, trusted
  // origin (NEXT_PUBLIC_PARTNER_APP_URL) rather than following it directly.
  const partnerRedirectPath = isSafeRelativePath(redirect) ? redirect : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center section-padding bg-cream-50 dark:bg-gray-950">
      <div className="max-w-md w-full space-y-5">
        <OtpForm redirectTo={redirectTo} partnerRedirectPath={partnerRedirectPath} />
        <AppDownloadCard />
      </div>
    </div>
  );
}
