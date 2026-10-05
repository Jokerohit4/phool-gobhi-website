/**
 * App-launch helpers for the printed QR codes (gym check-in poster, gym
 * "join us" poster).
 *
 * Why this file exists: the poster QR prints a plain https link to this site,
 * so the *scanning* app decides how to open it. Two failure modes used to make
 * those posters dead ends for anyone without the app installed:
 *
 *   1. The pages assigned `window.location.href = 'phoolgobhi://…'` on mount.
 *      With no app installed, Android Chrome replaces the page with a
 *      `net::ERR_UNKNOWN_URL_SCHEME` error and iOS either errors or silently
 *      does nothing. The page is destroyed, so the browser fallback below
 *      could never render — and no fallback timer could rescue it either,
 *      because the timer died with the page.
 *   2. QR scanners and camera apps often open links in their own embedded
 *      WebView, which uses a throwaway cookie jar that never sees the user's
 *      real logged-in browser session. Every scan re-prompts for login.
 *
 * The fix is threefold, and the ordering matters:
 *
 *   - Never auto-launch the app on mount. A redirect the user didn't ask for
 *     is uncancellable; an <a href> they tap is not. A tap that doesn't
 *     resolve leaves the page intact.
 *   - On Android use `intent://` with `S.browser_fallback_url`, so the OS
 *     opens the app when it's installed and the browser when it isn't. One
 *     tap, correct destination either way, no error page.
 *   - On iOS there's no free equivalent (`x-callback-url` is a redirect, not a
 *     canary), so we link the bare scheme from a tap and always leave a
 *     visible "continue in the browser" path.
 *
 * The web flow is the primary path, not a degraded fallback: the app has
 * never been published to a store, so for now a scanned poster is a *web*
 * page. The app link is progressive enhancement for whoever does have it.
 */

export const APP_SCHEME = 'phoolgobhi';

export type Platform = 'android' | 'ios' | 'other';

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  return detectPlatformFromUserAgent(navigator.userAgent);
}

export function detectPlatformFromUserAgent(userAgent: string): Platform {
  if (/android/i.test(userAgent)) return 'android';
  if (/iPad|iPhone|iPod/i.test(userAgent)) return 'ios';
  return 'other';
}

/**
 * In-app browsers that ship their own cookie jar (and so re-prompt a login the
 * user already has elsewhere). Only these warrant the escape hatch — rendering
 * it in plain Safari/Chrome is noise on every single scan.
 */
const KNOWN_IN_APP_TOKENS =
  /(FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|MicroMessenger|TikTok|Bytedance|Snapchat|Pinterest)/i;

export function isEmbeddedWebView(userAgent: string): boolean {
  const platform = detectPlatformFromUserAgent(userAgent);

  if (platform === 'android') {
    // `; wv)` is the canonical Android WebView marker. Real Chrome never has
    // it; every app-hosted WebView does.
    if (/; wv\)/i.test(userAgent)) return true;
    return KNOWN_IN_APP_TOKENS.test(userAgent);
  }

  if (platform === 'ios') {
    if (KNOWN_IN_APP_TOKENS.test(userAgent)) return true;
    // Real Safari, SFSafariViewController (which shares Safari's cookie jar),
    // and the third-party iOS browsers all advertise `Safari/`. App-hosted
    // WKWebViews drop it. So "iOS but no Safari/" reliably means embedded.
    return !/Safari\//i.test(userAgent);
  }

  return false;
}

export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '';
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '';

/** True once the app is actually installable from a store. */
export function isAppPublished(): boolean {
  return PLAY_STORE_URL.length > 0 || APP_STORE_URL.length > 0;
}

/**
 * Href for a user-initiated hand-off into the app, or null when there is
 * nothing useful to launch (desktop, or the app isn't published yet).
 *
 * Deliberately not called during render/effect — callers render it as the href
 * of a button so the navigation is attributable to a real tap.
 */
export function buildAppLaunchHref(appPath: string): string | null {
  const platform = detectPlatform();
  if (platform === 'other') return null;
  return buildAppLaunchHrefForPlatform(platform, appPath);
}

/** Pure core of buildAppLaunchHref, split out so the platform matrix is testable. */
export function buildAppLaunchHrefForPlatform(platform: Platform, appPath: string): string | null {
  if (platform === 'other') return null;

  if (platform === 'android') {
    // `intent://` hands off to the OS, which resolves the declared scheme
    // against installed packages and opens S.browser_fallback_url when none
    // match. `package=` is deliberately omitted: for a custom scheme the
    // scheme + fallback pair is what decides, and pinning a package name
    // would make the intent unresolvable on devices that installed the app
    // from a store that reports a different applicationId (e.g. the dev
    // flavor, `in.phoolgobi.partner` vs `in.phoolgobi.partner.dev`).
    const path = appPath.replace(/^\/+/, '');
    const fallback = encodeURIComponent(currentBrowserUrl());
    return `intent://${path}#Intent;scheme=${APP_SCHEME};S.browser_fallback_url=${fallback};end`;
  }

  return `${APP_SCHEME}://${appPath.replace(/^\/+/, '')}`;
}

function currentBrowserUrl(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.href;
}

/**
 * Escape hatch for a page that loaded inside an in-app browser / embedded
 * WebView (QR scanner, camera app, social app) whose cookie jar is separate
 * from the browser the user is actually logged in on. Both platforms expose a
 * way to hand the current URL to the real browser from inside most embedded
 * WebViews; a few block it, which is why this stays a plain visible link and
 * is always rendered next to a working web flow.
 */
export function getBrowserEscapeLink(): { href: string; label: string } | null {
  // Accepting the UA as an argument (defaulting to the real navigator) is what
  // makes this testable: user-agent sniffing is otherwise only verifiable by
  // hand-editing device emulation on every platform.
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  return buildBrowserEscapeLink(ua, currentBrowserUrl());
}

/** No-op subscribe: the user agent can't change under a live page. */
export function subscribeNoop(): () => void {
  return () => {};
}

export function buildBrowserEscapeLink(
  userAgent: string,
  currentUrl: string,
): { href: string; label: string } | null {
  const platform = detectPlatformFromUserAgent(userAgent);
  if (platform === 'other') return null;
  // Only embedded WebViews need the escape hatch. Gating on platform alone
  // would show "Stuck in an app browser?" to every person scanning with plain
  // Safari or Chrome, where the page is already in the right cookie jar.
  if (!isEmbeddedWebView(userAgent)) return null;

  if (platform === 'ios') {
    return {
      href: currentUrl.replace(/^https?:\/\//, 'x-safari-https://'),
      label: 'Open in Safari',
    };
  }

  const url = new URL(currentUrl);
  return {
    href: `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`,
    label: 'Open in Chrome',
  };
}
