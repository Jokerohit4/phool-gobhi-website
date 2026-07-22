'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

// The URL printed on a gym's physical check-in poster. Deliberately a plain
// https:// link (scans cleanly with any camera app, looks like a normal
// URL) rather than a custom-scheme QR — this page's only job is to hand off
// to the app via `phoolgobhi://checkin?gymId=...`, since the customer app
// has no App Links/Universal Links domain verification set up yet (that
// needs a settled release signing cert + Apple Team ID we don't have
// pre-launch). If the app isn't installed, the custom-scheme redirect just
// silently fails and the visible fallback below is what the customer sees.
export default function CheckinRedirectPage() {
  const params = useParams<{ gymId: string }>();
  const gymId = params.gymId;
  const appLink = `phoolgobhi://checkin?gymId=${encodeURIComponent(gymId)}`;

  useEffect(() => {
    window.location.href = appLink;
  }, [appLink]);

  return (
    <div className="section-padding container-custom flex min-h-[60vh] items-center justify-center">
      <div className="card-premium max-w-md p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Opening Phool Gobhi&hellip;</h1>
        <p className="text-gray-600 dark:text-gray-400">
          If the app didn&apos;t open automatically, make sure it&apos;s installed on this phone, then tap below.
        </p>
        <a href={appLink} className="btn-primary inline-block">
          Open in app
        </a>
      </div>
    </div>
  );
}
