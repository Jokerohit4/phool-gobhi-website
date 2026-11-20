'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
const themeQuery = '(prefers-color-scheme: dark)';
const themeEvent = 'site:themechange';
let sessionTheme: Theme = 'system';

function readTheme(): Theme {
  try {
    const value = localStorage.getItem('theme');
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return sessionTheme;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark' || theme === 'system' && matchMedia(themeQuery).matches);
}

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const syncTheme = () => {
      const saved = readTheme();
      setTheme(saved);
      applyTheme(saved);
    };
    const media = matchMedia(themeQuery);
    syncTheme();
    window.addEventListener(themeEvent, syncTheme);
    window.addEventListener('storage', syncTheme);
    media.addEventListener('change', syncTheme);
    return () => {
      window.removeEventListener(themeEvent, syncTheme);
      window.removeEventListener('storage', syncTheme);
      media.removeEventListener('change', syncTheme);
    };
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    sessionTheme = newTheme;
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // Keep the choice for this page when browser storage is unavailable.
    }
    window.dispatchEvent(new Event(themeEvent));
  };

  if (theme === null) return null;

  return (
    <div className="theme-switch flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1" role="group" aria-label="Color theme">
      <button
        onClick={() => handleThemeChange('light')}
        className={`group px-3 py-1 rounded font-medium transition-all ${
          theme === 'light'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Light mode"
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
      >
        <span className="inline-block transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-125 group-active:scale-90">☀️</span>
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`group px-3 py-1 rounded font-medium transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="System theme"
        aria-label="System theme"
        aria-pressed={theme === 'system'}
      >
        <span className="inline-block transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-125 group-active:scale-90">🖥️</span>
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`group px-3 py-1 rounded font-medium transition-all ${
          theme === 'dark'
            ? 'bg-gray-700 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Dark mode"
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
      >
        <span className="inline-block transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-125 group-active:scale-90">🌙</span>
      </button>
    </div>
  );
}
