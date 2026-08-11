// App-install upsell shown on the login page (poster QR landing). Same
// treatment as the check-in page's upsell: store links are placeholders —
// no live store listing yet, pre-launch. Swap the spans for real <a href>
// links (Android / App Store URLs) once the listings go live.
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
        <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
          Get it on Google Play
        </span>
        <span className="btn-secondary opacity-60 cursor-not-allowed text-center" title="Coming soon">
          Download on the App Store
        </span>
      </div>
    </div>
  );
}
