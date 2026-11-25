'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import PhoolGobhiLogo from './PhoolGobhiLogo';
import ThemeSwitch from './ThemeSwitch';
import { useSession } from './auth/SessionProvider';
import { trackCta } from '@/lib/analytics';

// The logo already links home, so there is no separate "Home" item.
const primaryLinks = [
  { href: '/gyms', label: 'Find a gym' },
  { href: '/partnerships', label: 'For gyms' },
  { href: '/about', label: 'About' },
];

// Every signed-in destination lives in the account menu so the primary nav does
// not grow each time an account feature is added. /coach is here rather than
// under /account/coach: for someone training on their own it is the product,
// not a settings page.
const profileLinks = [
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/bookings', label: 'Bookings' },
  { href: '/coach', label: 'Coach' },
  { href: '/account/attendance', label: 'Attendance' },
  { href: '/account/warnings', label: 'Warnings' },
  { href: '/account/wallet', label: 'Wallet' },
];

const navLink =
  'inline-flex min-h-11 items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-sm';
const mobileLink =
  'flex min-h-11 items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading, logout } = useSession();
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Account menu: opens on click only (hover-to-open fought the click toggle on
  // desktop), and closes on an outside press or Escape like any popup.
  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setProfileOpen(false);
      profileButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <header className="site-header sticky top-0 z-50 bg-cream-50 dark:bg-gray-950 border-b border-cream-200 dark:border-gray-800 transition-colors duration-300">
      {/* Tighter side padding than container-custom (this is the only
          place using it) so the bar uses more of the viewport width. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Same lockup as the home page masthead. */}
          <Link href="/" aria-label="Phool Gobhi home" className="group flex items-center gap-2">
            <PhoolGobhiLogo interactive />
            <span className="text-[22px] leading-[.87] font-extrabold tracking-[-0.05em] text-gray-900 dark:text-gray-50">
              phool<br />gobhi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLink}>
                {link.label}
              </Link>
            ))}

            {/* Logged out: a plain "Log in" link. Logged in: the user's name
                opens the account menu. */}
            {!loading && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-controls="account-menu"
                  className={`${navLink} max-w-[10rem] gap-1`}
                >
                  <span className="truncate">{user.name || 'Profile'}</span>
                  <span aria-hidden="true" className="text-xs">▾</span>
                </button>

                {profileOpen && (
                  <div id="account-menu" className="absolute right-0 top-full pt-2 w-48">
                    <div className="card-premium py-2 flex flex-col">
                      {profileLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setProfileOpen(false)}
                          className="flex min-h-11 items-center px-4 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="flex min-h-11 items-center px-4 text-left text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <Link href="/login" className={navLink}>
                  Log in
                </Link>
              )
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ThemeSwitch />
            </div>

            <Link
              href="/#join"
              onClick={() => trackCta('get_app_header_desktop')}
              className="site-header-cta hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-700 text-white font-semibold text-sm transition-all"
            >
              Get the app <span aria-hidden="true">↓</span>
            </Link>

            {/* Mobile Menu Button: a 44px target around the three bars. */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={isOpen}
              className="lg:hidden flex h-11 w-11 items-center justify-center"
            >
              <span className="flex flex-col gap-1.5 w-6">
                <span className={`block w-full h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-full h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-full h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav
            className="lg:hidden pb-6 border-t border-gray-200 dark:border-gray-800 pt-4 transition-colors duration-300"
            aria-label="Main"
          >
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className={mobileLink} onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <>
                <p className="pt-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {user.name || 'Profile'}
                </p>
                {profileLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={mobileLink} onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex min-h-11 items-center text-gray-500 dark:text-gray-400 font-medium"
                >
                  Log out
                </button>
              </>
            ) : (
              !loading && (
                <Link href="/login" className={mobileLink} onClick={() => setIsOpen(false)}>
                  Log in
                </Link>
              )
            )}

            <div className="sm:hidden py-2">
              <ThemeSwitch />
            </div>
            <Link
              href="/#join"
              onClick={() => {
                trackCta('get_app_header_mobile');
                setIsOpen(false);
              }}
              className="site-header-cta flex w-full items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-700 text-white font-semibold text-center mt-4 transition-all duration-300"
            >
              Get the app <span aria-hidden="true">↓</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
