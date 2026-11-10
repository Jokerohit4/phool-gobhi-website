'use client';
import { useSyncExternalStore } from 'react';
import { buildAppLaunchHref, subscribeNoop } from '@/lib/appDeepLink';
import AppStoreButtons from '@/components/AppStoreButtons';

export default function OpenBuddyApp({ code, development = false }: { code: string; development?: boolean }) {
  const mobileHref = useSyncExternalStore(subscribeNoop, () => buildAppLaunchHref(`buddy?code=${encodeURIComponent(code)}`), () => null);
  const href = development ? `phoolgobhidev://buddy?code=${encodeURIComponent(code)}`
    : mobileHref;
  return <div className="space-y-4">
    <a href={href ?? `phoolgobhi://buddy?code=${encodeURIComponent(code)}`} className="btn-primary inline-block">Open profile & follow in the app</a>
    <AppStoreButtons launchHref={null} />
  </div>;
}
