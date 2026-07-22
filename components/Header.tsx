'use client';

import Link from 'next/link';
import { useState } from 'react';
import PhoolGobhiLogo from './PhoolGobhiLogo';
import ThemeSwitch from './ThemeSwitch';
import { useSession } from './auth/SessionProvider';

const primaryLinks = [
  { href: '/', label: 'Home' },
  { href: '/gyms', label: 'Find Gyms' },
  { href: '/about', label: 'About' },
  { href: '/account/bookings', label: 'Bookings' },
];

const profileLinks = [
  { href: '/account/attendance', label: 'Attendance' },
  { href: '/account/wallet', label: 'Wallet' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading, logout } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-cream-50 dark:bg-gray-950 border-b border-cream-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      {/* Tighter side padding than container-custom (this is the only
          place using it) so the bar uses more of the viewport width, while
          gap-10/py-5 below give the items themselves more breathing room. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          <Link href="/" className="group flex items-center gap-3">
            <PhoolGobhiLogo interactive />
            <span className="font-display text-3xl text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:-translate-y-0.5">Phool Gobhi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}

            {/* Logged out: a plain "Login" link. Logged in: "Profile"
                (or the user's name) opens a dropdown holding account-scoped
                links (Attendance/Wallet/Log out), rather than each being
                its own top-level item, to keep the primary nav from
                growing every time an account feature is added. */}
            {!loading && user ? (
              <div
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-sm"
                >
                  {user.name || 'Profile'}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full pt-2 w-40">
                    <div className="card-premium py-2 flex flex-col">
                      {profileLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setProfileOpen(false)}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="px-4 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-sm"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-5">
            <div className="hidden sm:block">
              <ThemeSwitch />
            </div>

            <a
              href="https://wa.me/919354859197"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:block px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
            >
              Message Gobhi 🥦
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden flex flex-col gap-1.5 w-6 h-6"
            >
              <div className={`w-full h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
              <div className={`w-full h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-full h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden pb-6 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-6 transition-colors duration-300">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 font-medium transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <>
                <p className="pt-2 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {user.name || 'Profile'}
                </p>
                {profileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 font-medium transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block text-gray-500 dark:text-gray-400 font-medium py-2"
                >
                  Log out
                </button>
              </>
            ) : (
              !loading && (
                <Link
                  href="/login"
                  className="block text-gray-700 dark:text-gray-300 font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )
            )}

            <div className="sm:hidden py-2">
              <ThemeSwitch />
            </div>
            <a
              href="https://wa.me/919354859197"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-center mt-4 transition-all duration-300"
            >
              Message Gobhi on WhatsApp 🥦
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
