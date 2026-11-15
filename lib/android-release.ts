export type AndroidAbi = 'arm64-v8a' | 'armeabi-v7a' | 'x86_64';

export interface AndroidReleaseFile {
  abi: AndroidAbi;
  label: string;
  fileName: string;
  sizeBytes: number;
  sha256: string;
  url: string;
}

export interface AndroidRelease {
  versionName: string;
  versionCode: number;
  applicationId: string;
  publishedAt: string;
  downloads: Record<AndroidAbi, AndroidReleaseFile>;
}

const RELEASES_BASE = 'https://storage.googleapis.com/phool-gobhi-android-downloads-prod/android';
const CURRENT_PATH = `${RELEASES_BASE}/releases/2.0.0-6`;

export const CURRENT_ANDROID_RELEASE: AndroidRelease = {
  versionName: '2.0.0',
  versionCode: 6,
  applicationId: 'in.phoolgobi.customer',
  publishedAt: '2026-11-15T13:19:36Z',
  downloads: {
    'arm64-v8a': {
      abi: 'arm64-v8a',
      label: 'ARM 64-bit',
      fileName: 'app-arm64-v8a-prod-release.apk',
      sizeBytes: 57252543,
      sha256: '6B173D42E607EA4057B1E2E0F7C3B00D79A058396450DDC822B1161D5474AFDB',
      url: `${CURRENT_PATH}/app-arm64-v8a-prod-release.apk`,
    },
    'armeabi-v7a': {
      abi: 'armeabi-v7a',
      label: 'ARM 32-bit',
      fileName: 'app-armeabi-v7a-prod-release.apk',
      sizeBytes: 52220315,
      sha256: 'A85435AB8DD2EA40F2430F5D280E2F0981C92F9EE96C50A634EB5F9CF532ED16',
      url: `${CURRENT_PATH}/app-armeabi-v7a-prod-release.apk`,
    },
    'x86_64': {
      abi: 'x86_64',
      label: 'x86 64-bit',
      fileName: 'app-x86_64-prod-release.apk',
      sizeBytes: 59549997,
      sha256: 'E80E61B4BC000D00D5054C294F1C5D3EC0F30D4B82D0A7272D913DC9CB6AEC91',
      url: `${CURRENT_PATH}/app-x86_64-prod-release.apk`,
    },
  },
};

function isRelease(value: unknown): value is AndroidRelease {
  if (!value || typeof value !== 'object') return false;
  const release = value as Partial<AndroidRelease>;
  if (
    typeof release.versionName !== 'string' ||
    typeof release.versionCode !== 'number' ||
    typeof release.applicationId !== 'string' ||
    typeof release.publishedAt !== 'string' ||
    !release.downloads
  ) return false;

  return (['arm64-v8a', 'armeabi-v7a', 'x86_64'] as const).every((abi) => {
    const file = release.downloads?.[abi];
    return !!file && file.abi === abi &&
      typeof file.label === 'string' &&
      typeof file.fileName === 'string' &&
      typeof file.sizeBytes === 'number' &&
      typeof file.sha256 === 'string' &&
      typeof file.url === 'string' &&
      file.url.startsWith(`${RELEASES_BASE}/releases/`);
  });
}

export async function getAndroidRelease(): Promise<AndroidRelease> {
  try {
    const response = await fetch(`${RELEASES_BASE}/latest.json`, { cache: 'no-store' });
    if (response.ok) {
      const candidate: unknown = await response.json();
      if (isRelease(candidate)) return candidate;
    }
  } catch {
    // Keep the download page usable from the last known release if the
    // manifest host is temporarily unavailable.
  }

  return CURRENT_ANDROID_RELEASE;
}
