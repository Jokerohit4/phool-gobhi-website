import type { Metadata } from 'next';
import OtpForm from '@/components/auth/OtpForm';

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
  const redirectTo = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/gyms';

  return (
    <div className="min-h-screen flex items-center justify-center section-padding bg-cream-50 dark:bg-gray-950">
      <OtpForm redirectTo={redirectTo} />
    </div>
  );
}
