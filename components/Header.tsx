'use client';

import Link from 'next/link';
import { useState } from 'react';
import PhoolGobhiLogo from './PhoolGobhiLogo';
import ThemeSwitch from './ThemeSwitch';
import { useSession } from './auth/SessionProvider';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useSession();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/gyms', label: 'Find Gyms' },
    // TODO: Re-enable when pages are ready to go live
    // { href: '/how-it-works', label: 'How It Works' },
    // { href: '/pricing', label: 'Pricing' },
    // { href: '/blog', label: 'Blog' },
    // { href: '/team', label: 'Team' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream-50 dark:bg-gray-950 border-b border-cream-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="group flex items-center gap-3">
            <PhoolGobhiLogo interactive />
            <span className="font-display text-3xl text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:-translate-y-0.5">Phool Gobhi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ThemeSwitch />
            </div>

            {!loading && (
              user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/account/bookings" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                    {user.name || 'My account'}
                  </Link>
                  <Link href="/account/attendance" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                    Attendance
                  </Link>
                  <Link href="/account/wallet" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                    Wallet
                  </Link>
                  <button onClick={() => logout()} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                    Log out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                  Log in
                </Link>
              )
            )}

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
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 font-medium transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="sm:hidden py-2">
              <ThemeSwitch />
            </div>
            {!loading && (
              user ? (
                <div className="flex items-center justify-between pt-2">
                  <Link href="/account/bookings" className="text-gray-700 dark:text-gray-300 font-medium" onClick={() => setIsOpen(false)}>
                    {user.name || 'My account'}
                  </Link>
                  <Link href="/account/attendance" className="text-gray-700 dark:text-gray-300 font-medium" onClick={() => setIsOpen(false)}>
                    Attendance
                  </Link>
                  <Link href="/account/wallet" className="text-gray-700 dark:text-gray-300 font-medium" onClick={() => setIsOpen(false)}>
                    Wallet
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="text-gray-500 dark:text-gray-400 font-medium"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="block text-gray-700 dark:text-gray-300 font-medium pt-2" onClick={() => setIsOpen(false)}>
                  Log in
                </Link>
              )
            )}
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
