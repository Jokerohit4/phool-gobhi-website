'use client';

import { useState, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signInWithPhoneNumber, type ConfirmationResult, type RecaptchaVerifier } from 'firebase/auth';
import { useSession } from './SessionProvider';
import { getFirebaseAuth, createRecaptchaVerifier } from '@/lib/firebase-client';
import { toE164 } from '@/lib/phone';
import { firebaseAuthErrorMessage } from '@/lib/firebase-error';

type Step = 'phone' | 'otp';

const RECAPTCHA_CONTAINER_ID = 'otp-form-recaptcha';

export default function OtpForm({
  redirectTo = '/gyms',
  partnerRedirectPath,
}: {
  redirectTo?: string;
  partnerRedirectPath?: string;
}) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useSession();
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const e164Phone = toE164(phone);
    if (!e164Phone) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setSubmitting(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = createRecaptchaVerifier(RECAPTCHA_CONTAINER_ID);
      }
      confirmationRef.current = await signInWithPhoneNumber(getFirebaseAuth(), e164Phone, recaptchaRef.current);
      setStep('otp');
    } catch (err) {
      setError(firebaseAuthErrorMessage(err));
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!confirmationRef.current) {
      setError('Session expired — please request a new code');
      setStep('phone');
      return;
    }
    setSubmitting(true);
    try {
      const credential = await confirmationRef.current.confirm(otp);
      const idToken = await credential.user.getIdToken();
      const res = await fetch('/api/auth/verify-firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code');
        return;
      }
      if (data.user?.role === 'partner') {
        const partnerAppUrl = process.env.NEXT_PUBLIC_PARTNER_APP_URL ?? 'https://partner.phoolgobhi.com';
        // Full top-level navigation (not router.push) — this session cookie
        // is shared via Domain=.phoolgobhi.com, so the partner app picks it
        // up on load with no token ever passed through the URL. Appends the
        // originally-requested partner-app path (set by partner-web's
        // proxy.ts redirect) so a deep link survives the login round-trip
        // instead of always dropping the partner at the app root.
        window.location.href = partnerRedirectPath ? `${partnerAppUrl}${partnerRedirectPath}` : partnerAppUrl;
        return;
      }
      await refresh();
      router.push(redirectTo);
    } catch (err) {
      setError(firebaseAuthErrorMessage(err));
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
              recaptchaRef.current?.clear();
              recaptchaRef.current = null;
              confirmationRef.current = null;
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

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Own a gym?{' '}
        <Link href="/partner/apply" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Sign up as a partner
        </Link>
      </p>
      <div id={RECAPTCHA_CONTAINER_ID} />
    </motion.div>
  );
}
