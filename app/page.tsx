import GobhiHome from '@/components/gobhi/GobhiHome';

// Marketing stays available before gym launch. Booking/check-in launch and
// maintenance gates remain enforced by proxy.ts on their own routes.
export default function Home() {
  return <GobhiHome
    androidUrl={process.env.NEXT_PUBLIC_PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=in.phoolgobi.customer'}
    iosUrl={process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/app/id6804278072'}
  />;
}
