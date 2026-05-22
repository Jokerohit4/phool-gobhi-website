'use client';

import { useEffect, useState } from 'react';

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const initialTheme = saved || 'system';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => handleThemeChange('light')}
        className={`px-3 py-1 rounded font-medium transition-all ${
          theme === 'light'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Light mode"
      >
        ☀️
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`px-3 py-1 rounded font-medium transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="System theme"
      >
        🖥️
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`px-3 py-1 rounded font-medium transition-all ${
          theme === 'dark'
            ? 'bg-gray-700 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Dark mode"
      >
        🌙
      </button>
    </div>
  );
}
