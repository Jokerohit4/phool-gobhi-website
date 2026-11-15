'use client';

import { useEffect, useState } from 'react';
import type { AndroidAbi, AndroidRelease } from '@/lib/android-release';

const ABI_ORDER: AndroidAbi[] = ['arm64-v8a', 'armeabi-v7a', 'x86_64'];

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectedAbi(): Promise<AndroidAbi | null> {
  if (typeof navigator === 'undefined' || !/android/i.test(navigator.userAgent)) {
    return Promise.resolve(null);
  }

  type HighEntropyValues = { architecture?: string; bitness?: string };
  type NavigatorWithUAData = Navigator & {
    userAgentData?: { getHighEntropyValues?: (hints: string[]) => Promise<HighEntropyValues> };
  };
  const uaData = (navigator as NavigatorWithUAData).userAgentData;
  if (!uaData?.getHighEntropyValues) return Promise.resolve(null);

  return uaData.getHighEntropyValues(['architecture', 'bitness']).then(({ architecture, bitness }) => {
    if (/x86/i.test(architecture ?? '') && bitness === '64') return 'x86_64';
    if (/arm/i.test(architecture ?? '') && bitness === '32') return 'armeabi-v7a';
    if (/arm/i.test(architecture ?? '') && bitness === '64') return 'arm64-v8a';
    return null;
  }).catch(() => null);
}

export default function AndroidDownloadOptions({ release }: { release: AndroidRelease }) {
  const [selectedAbi, setSelectedAbi] = useState<AndroidAbi>('arm64-v8a');
  const [recommendedAbi, setRecommendedAbi] = useState<AndroidAbi | null>(null);

  useEffect(() => {
    let active = true;
    void detectedAbi().then((abi) => {
      if (!active || !abi) return;
      setRecommendedAbi(abi);
      setSelectedAbi(abi);
    });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium text-gray-700 dark:text-gray-300">
          Android app <span className="text-gray-500 dark:text-gray-400">v{release.versionName} ({release.versionCode})</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {recommendedAbi ? `Recommended for this device: ${release.downloads[recommendedAbi].label}` : 'Choose the build that matches your device.'}
        </p>
      </div>

      <div className="grid gap-3">
        {ABI_ORDER.map((abi) => {
          const file = release.downloads[abi];
          const selected = selectedAbi === abi;
          return (
            <div
              key={abi}
              className={`rounded-2xl border p-5 transition-colors ${selected
                ? 'border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40'
                : 'border-cream-200 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedAbi(abi)}
                  aria-pressed={selected}
                  className="text-left"
                >
                  <span className="block font-semibold text-gray-900 dark:text-white">{file.label}</span>
                  <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                    ABI: {abi} · {formatSize(file.sizeBytes)}
                    {recommendedAbi === abi ? ' · Recommended' : ''}
                  </span>
                </button>
                <a
                  href={file.url}
                  className={selected ? 'btn-primary inline-flex justify-center' : 'btn-secondary inline-flex justify-center'}
                >
                  Download APK
                </a>
              </div>
              <details className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <summary className="w-fit cursor-pointer underline underline-offset-2">Verify file</summary>
                <p className="mt-2 break-all font-mono">SHA-256: {file.sha256}</p>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
