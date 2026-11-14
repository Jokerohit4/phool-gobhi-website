'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import NamePromptModal from './auth/NamePromptModal';
import LocationBootstrap from './LocationBootstrap';
import MaintenanceBanner from './MaintenanceBanner';

/** The homepage owns its immersive navigation; account and booking pages keep theirs. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const homepage = usePathname() === '/';
  if (homepage) return <main className="flex-grow">{children}</main>;
  return <div className="site-experience">
    <a className="skip-to-main" href="#main-content">Skip to main content</a>
    <LocationBootstrap/><ScrollProgress/><NamePromptModal/><Header/><MaintenanceBanner/>
    <main id="main-content" className="site-main flex-grow">{children}</main><Footer/>
  </div>;
}
