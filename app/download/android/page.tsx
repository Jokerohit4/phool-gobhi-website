import type { Metadata } from 'next';
import AndroidDownloadOptions from '@/components/AndroidDownloadOptions';
import { getAndroidRelease } from '@/lib/android-release';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Download Phool Gobhi for Android',
  description: 'Download the Phool Gobhi Android app build that matches your device.',
  alternates: { canonical: '/download/android' },
};

export default async function AndroidDownloadPage() {
  const release = await getAndroidRelease();

  return (
    <div className="bg-cream-50 dark:bg-gray-950">
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Direct Android download
          </p>
          <h1 className="mb-4 text-4xl font-semibold text-gray-900 dark:text-white sm:text-5xl">
            Choose your Android build
          </h1>
          <p className="mb-9 max-w-2xl leading-relaxed text-gray-600 dark:text-gray-300">
            Each APK contains the native libraries for one processor type. Most Android phones use ARM 64-bit.
            We&apos;ll recommend a build when your browser reports its architecture; you can also choose manually.
          </p>

          <div className="card-premium p-5 sm:p-7">
            <AndroidDownloadOptions release={release} />
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-cream-200 bg-cream-100 p-5 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Install the APK</h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Open the downloaded APK. If Android asks, allow your browser to install apps, then confirm the install.
                The build is signed and identified as <span className="font-mono">{release.applicationId}</span>.
              </p>
            </div>
            <div className="rounded-2xl border border-cream-200 bg-cream-100 p-5 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Not sure which ABI?</h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Choose ARM 64-bit for most current phones. ARM 32-bit is for older devices. x86_64 is mainly for
                emulators and compatible Intel devices. If one won&apos;t install, try the ABI reported by your device.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            iPhone or iPad? <a className="font-semibold text-emerald-700 underline underline-offset-4 dark:text-emerald-300" href={process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/app/id6804278072'}>Get Phool Gobhi on the App Store</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
