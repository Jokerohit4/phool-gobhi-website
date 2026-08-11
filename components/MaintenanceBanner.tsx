'use client';

import { useEffect, useState } from 'react';

interface MaintenanceEntry {
  active: boolean;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  message: string;
}

interface AppConfigResponse {
  maintenance?: {
    wallet?: MaintenanceEntry;
    gyms?: MaintenanceEntry;
  };
}

const FEATURES: Array<{ key: 'wallet' | 'gyms'; label: string }> = [
  { key: 'wallet', label: 'Wallet' },
  { key: 'gyms', label: 'Gyms' },
];

function formatEndTime(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

// Global maintenance notice — mounts once per page and refreshes every
// minute. Renders nothing when the backend reports no active maintenance
// window, so the common case costs one tiny fetch and no layout shift.
export default function MaintenanceBanner() {
  const [status, setStatus] = useState<AppConfigResponse['maintenance'] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/app-config', { cache: 'no-store' });
        const data = (await res.json()) as AppConfigResponse;
        if (!cancelled && data?.maintenance) setStatus(data.maintenance);
      } catch {
        // Fail open — a transient app-config failure must never look like
        // maintenance.
      }
    };
    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const active = FEATURES.filter((f) => status?.[f.key]?.active);
  if (active.length === 0) return null;

  return (
    <div className="border-b border-amber-600/40 bg-amber-500 text-white dark:bg-amber-600">
      <div className="max-w-7xl mx-auto px-4 py-2.5 text-sm">
        {active.map(({ key, label }) => {
          const entry = status?.[key];
          const endsAt = formatEndTime(entry?.endsAt ?? null);
          return (
            <p key={key} className="flex items-start gap-2">
              <span className="font-semibold shrink-0">{label}:</span>
              <span>
                {entry?.message ||
                  "Under maintenance — we're working on it and will be back shortly."}
                {endsAt && <> Back by {endsAt}.</>}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}
