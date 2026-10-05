import { describe, it, expect } from 'vitest';
import {
  buildAppLaunchHrefForPlatform,
  buildBrowserEscapeLink,
  detectPlatformFromUserAgent,
  isEmbeddedWebView,
} from '../appDeepLink';

const SAFARI_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
const WECHAT_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49';
const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36';
const WECHAT_ANDROID = `${CHROME_ANDROID} MicroMessenger/8.0.49`;
const ANDROID_WEBVIEW =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 Version/4.0 Chrome/120.0 Mobile Safari/537.36';
const DESKTOP_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

/**
 * These pin the behaviour the printed-poster QR depends on, most importantly
 * that the Android hand-off is *fallback-safe*. The regression that started
 * all this was an unconditional `window.location.href = 'phoolgobhi://…'`,
 * which on Android threw ERR_UNKNOWN_URL_SCHEME and destroyed the page before
 * its own JS fallback timer could fire.
 */
describe('detectPlatformFromUserAgent', () => {
  it.each([
    [CHROME_ANDROID, 'android'],
    [WECHAT_ANDROID, 'android'],
    [SAFARI_IOS, 'ios'],
    [WECHAT_IOS, 'ios'],
    [DESKTOP_SAFARI, 'other'],
  ])('%s -> %s', (ua, expected) => {
    expect(detectPlatformFromUserAgent(ua)).toBe(expected);
  });
});

describe('buildAppLaunchHrefForPlatform', () => {
  it('returns null on desktop, where no app hand-off makes sense', () => {
    expect(buildAppLaunchHrefForPlatform('other', 'checkin?gymId=2')).toBeNull();
  });

  it('builds an Android intent carrying a browser fallback', () => {
    const href = buildAppLaunchHrefForPlatform('android', 'checkin?gymId=2')!;

    expect(href.startsWith('intent://')).toBe(true);
    // The whole point: an app that isn't installed lands back in the browser
    // instead of on an error page.
    expect(href).toContain('scheme=phoolgobhi');
    expect(href).toContain('S.browser_fallback_url=');
    expect(href).toContain('checkin?gymId=2');
    expect(href.endsWith(';end')).toBe(true);
  });

  it('omits package= so the dev flavor (in.phoolgobi.*.dev) also resolves', () => {
    // Pinning a package name would make the intent unresolvable on a device
    // holding only the dev flavor.
    expect(buildAppLaunchHrefForPlatform('android', 'join?gymId=7')).not.toContain('package=');
  });

  it('uses the bare scheme on iOS, which has no intent:// equivalent', () => {
    expect(buildAppLaunchHrefForPlatform('ios', 'join?gymId=7')).toBe('phoolgobhi://join?gymId=7');
  });

  it('tolerates a leading slash on the path', () => {
    expect(buildAppLaunchHrefForPlatform('ios', '/join?gymId=7')).toBe('phoolgobhi://join?gymId=7');
  });
});

describe('isEmbeddedWebView', () => {
  it.each([
    [SAFARI_IOS, false],
    [DESKTOP_SAFARI, false],
    [CHROME_ANDROID, false],
    [WECHAT_IOS, true],
    [WECHAT_ANDROID, true],
    [ANDROID_WEBVIEW, true],
  ])('%s -> embedded=%s', (ua, expected) => {
    expect(isEmbeddedWebView(ua)).toBe(expected);
  });

  it('treats an iOS WKWebView with no Safari token as embedded', () => {
    // The generic WKWebView case: no vendor token, no `Safari/`.
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    expect(isEmbeddedWebView(ua)).toBe(true);
  });
});

describe('buildBrowserEscapeLink', () => {
  it('is null in a real browser, so the escape hatch never shows there', () => {
    expect(buildBrowserEscapeLink(SAFARI_IOS, 'https://www.phoolgobhi.com/join/2')).toBeNull();
    expect(buildBrowserEscapeLink(CHROME_ANDROID, 'https://www.phoolgobhi.com/join/2')).toBeNull();
  });

  it('offers Safari on iOS inside an in-app browser', () => {
    const link = buildBrowserEscapeLink(WECHAT_IOS, 'https://www.phoolgobhi.com/join/2');

    expect(link?.label).toBe('Open in Safari');
    expect(link?.href).toBe('x-safari-https://www.phoolgobhi.com/join/2');
  });

  it('offers Chrome on Android inside an in-app browser', () => {
    const link = buildBrowserEscapeLink(WECHAT_ANDROID, 'https://www.phoolgobhi.com/join/2');

    expect(link?.label).toBe('Open in Chrome');
    expect(link?.href?.startsWith('intent://')).toBe(true);
    expect(link?.href).toContain('package=com.android.chrome');
    // A Chrome hand-off from an embedded WebView must still be able to fall
    // back, since some scanners block the intent entirely.
    expect(link?.href).toContain('S.browser_fallback_url=');
  });
});
