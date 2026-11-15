import Link from 'next/link';

// App-install upsell shown on the login page (poster QR landing).
export default function AppDownloadCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card-premium p-6 text-center space-y-3 ${className}`}>
      <p className="font-medium">
        📱 Get the app &amp; get <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹20</span> credited to your wallet!
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Faster QR check-ins, booking reminders, and more.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/download/android" className="btn-secondary inline-block text-center">
          Download Android APK
        </Link>
        <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
          Download on the App Store
        </span>
      </div>
    </div>
  );
}
