import { NextResponse } from 'next/server';

/**
 * Serves the Apple Associated Domains file, which is half of the Universal
 * Links handshake (the other half is the `com.apple.developer.associated-domains`
 * entitlement in the iOS app).
 *
 * Together they turn a printed gym-poster QR — a plain
 * `https://www.phoolgobhi.com/join/<id>` link — into "open the app if it's
 * installed, otherwise just open the page". Without this, a poster scan can
 * only ever reach the app via a custom scheme, which errors out on iOS when
 * nothing is installed.
 *
 * Served from a route handler rather than `public/` on purpose:
 *   - A file in `public/` has no extension, so it's served as
 *     `application/octet-stream`, and `headers()` in next.config does NOT
 *     apply to static assets (it's a route-phase concern). Apple expects JSON.
 *   - This also keeps the file in version control as real JSON, so a
 *     mistyped bundle id is a diff you can review rather than a silent
 *     verification failure on someone's phone.
 *
 * The dot-prefixed `.well-known` path can't be a route directory (the App
 * Router ignores dot-directories), so next.config rewrites it here with a
 * `beforeFiles` rewrite, which is applied before static file resolution.
 */
const ASSOCIATION = {
  applinks: {
    apps: [],
    details: [
      {
        // "TeamID.BundleID" per bundle. The dev flavor is listed too so an
        // internal TestFlight build resolves poster links during QA; remove it
        // if that ever matters more than testability.
        appIDs: [
          'Z62PW37U62.in.phoolgobi.customer',
          'Z62PW37U62.in.phoolgobi.customer.dev',
        ],
        components: [
          {
            '/': '/join/*',
            comment:
              "Gym 'join us' poster. Registers a member against the scanned gym and records linkedGymId, so a stranger who scans it becomes a marketplace member rather than a bounce.",
          },
          {
            '/': '/checkin/*',
            comment:
              'Gym check-in poster. Same self-check-in the web flow performs, with browser geolocation as the fallback when the app is not installed.',
          },
        ],
      },
    ],
  },
};

export function GET() {
  return new NextResponse(JSON.stringify(ASSOCIATION, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      // Re-fetched on every verification: this file changes when a bundle id
      // is added, and a cached stale copy shows up as links that mysteriously
      // stop opening the app.
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
