'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import PhoolGobhiLogo from './PhoolGobhiLogo';

const SESSION_KEY = 'pitch-deck-access-granted';

type Status = 'checking-session' | 'locked' | 'verifying' | 'denied' | 'granted';

export default function PitchAccessGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking-session');
  const [contact, setContact] = useState('');

  useEffect(() => {
    const granted = sessionStorage.getItem(SESSION_KEY) === 'true';
    setStatus(granted ? 'granted' : 'locked');
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('verifying');
    try {
      const res = await fetch('/api/verify-pitch-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact }),
      });
      const data = (await res.json()) as { allowed?: boolean };
      if (data.allowed) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setStatus('granted');
      } else {
        setStatus('denied');
      }
    } catch {
      setStatus('denied');
    }
  };

  if (status === 'checking-session') {
    return <div className="min-h-screen bg-cream-50 dark:bg-gray-950" />;
  }

  if (status === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center section-padding bg-cream-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full card-premium p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <PhoolGobhiLogo />
        </div>
        <h1 className="text-2xl font-bold mb-2">Investor Deck</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          This deck is shared privately. Enter the phone number or email it was shared with to view it.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email"
            autoComplete="off"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={status === 'verifying'}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === 'verifying' ? 'Checking…' : 'View Deck'}
          </button>
        </form>
        {status === 'denied' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm font-semibold text-red-600 dark:text-red-400"
          >
            You do not have access. If you believe this is a mistake, reach out on{' '}
            <a href="https://wa.me/919354859197" target="_blank" rel="noopener noreferrer" className="underline">
              WhatsApp
            </a>
            .
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
