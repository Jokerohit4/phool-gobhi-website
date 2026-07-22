import type { PublicAttendanceStats } from '@/lib/types';

// Server-only — never imported from a client component. Not routed through
// lib/gateway-client.ts's gatewayFetch: that helper (and authedGatewayFetch)
// exist to attach session cookies/bearer tokens, which this public,
// no-auth endpoint doesn't need. A plain fetch with `next.revalidate` lets
// Next.js cache the stat across requests instead of hitting the gateway on
// every landing-page view.
const GATEWAY_URL = process.env.GATEWAY_URL;

interface PublicAttendanceStatsResponse {
  data?: PublicAttendanceStats;
}

export default async function AttendanceStat() {
  if (!GATEWAY_URL) return null;

  let count: number | undefined;
  try {
    const res = await fetch(`${GATEWAY_URL}/api/bookings/public/attendance-stats`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as PublicAttendanceStatsResponse;
    count = json.data?.sessionsAttendedThisMonth;
  } catch {
    // Gateway briefly unreachable — omit the stat rather than break the
    // landing page.
    return null;
  }

  if (typeof count !== 'number') return null;

  return (
    <div className="flex justify-center px-6">
      <div className="sticker inline-flex items-center gap-3 px-6 py-3 bg-cream-100 dark:bg-gray-900">
        <span className="font-display text-3xl text-emerald-600 dark:text-emerald-400">{count.toLocaleString()}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">sessions completed this month</span>
      </div>
    </div>
  );
}
