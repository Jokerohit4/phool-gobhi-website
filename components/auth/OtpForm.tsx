'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from './SessionProvider';

type Step = 'phone' | 'otp';

export default function OtpForm({ redirectTo = '/gyms' }: { redirectTo?: string }) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useSession();

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send OTP');
        return;
      }
      setStep('otp');
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code');
        return;
      }
      await refresh();
      router.push(redirectTo);
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full card-premium p-8"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">Log in</h1>

      {step === 'phone' && (
        <form onSubmit={sendOtp} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mobile number
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="mt-1 w-full rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to {phone}</p>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            OTP
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold disabled:opacity-60"
          >
            {submitting ? 'Verifying…' : 'Verify & continue'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setOtp('');
              setError(null);
            }}
            className="w-full text-sm text-gray-500 dark:text-gray-400"
          >
            Change number
          </button>
        </form>
      )}
    </motion.div>
  );
}
