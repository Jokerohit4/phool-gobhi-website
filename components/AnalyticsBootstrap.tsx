'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ensureSessionStarted, trackScreen } from '@/lib/analytics';

// Fire-and-forget analytics boot, same pattern as LocationBootstrap — no UI,
// renders nothing. Fires session_started once per tab session, then a
// screen_viewed on every route change (mirrors both apps' screen-tracking:
// AnalyticsRouteObserver on the customer app, the onGenerateRoute hook on
// the partner app).
export default function AnalyticsBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    ensureSessionStarted();
  }, []);

  useEffect(() => {
    if (pathname) trackScreen(pathname);
  }, [pathname]);

  return null;
}
