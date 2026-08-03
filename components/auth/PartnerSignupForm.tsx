'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signInWithPhoneNumber, type ConfirmationResult, type RecaptchaVerifier } from 'firebase/auth';
import { getFirebaseAuth, createRecaptchaVerifier } from '@/lib/firebase-client';
import { toE164 } from '@/lib/phone';
import { firebaseAuthErrorMessage } from '@/lib/firebase-error';

type Step = 'phone' | 'otp';
type OtpProvider = 'fast2sms' | 'firebase' | 'skip';

const PARTNER_APP_URL = process.env.NEXT_PUBLIC_PARTNER_APP_URL ?? 'https://partner.phoolgobhi.com';
const RECAPTCHA_CONTAINER_ID = 'partner-signup-recaptcha';

export default function PartnerSignupForm() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Defaults to 'firebase' (today's only behavior) until the fetch below
  // resolves, so a slow/failed /api/auth/otp-config never regresses existing
  // Firebase-based login.
  const [provider, setProvider] = useState<OtpProvider>('firebase');
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/otp-config')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && (data.provider === 'fast2sms' || data.provider === 'firebase' || data.provider === 'skip')) {
          setProvider(data.provider);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
      if (provider !== 'firebase') {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: e164Phone }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || 'Something went wrong — please try again');
          return;
        }
        setStep('otp');
        return;
      }
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
    if (provider === 'firebase' && !confirmationRef.current) {
      setError('Session expired — please request a new code');
      setStep('phone');
      return;
    }
    setSubmitting(true);
    try {
      let res: Response;
      if (provider !== 'firebase') {
        res = await fetch('/api/auth/verify-otp-partner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: toE164(phone), otp }),
        });
      } else {
        const credential = await confirmationRef.current!.confirm(otp);
        const idToken = await credential.user.getIdToken();
        res = await fetch('/api/auth/verify-firebase-partner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code');
        return;
      }
      if (data.user?.role !== 'partner') {
        // An existing customer/staff account typed their own number in here —
        // they're now logged in as themselves (see verify-otp-partner's
        // comment), just not as a partner, so don't send them to the
        // partner app where they'd only get bounced straight back.
        setError('This number is already registered as a different account type. Use the regular login instead.');
        return;
      }
      // Full top-level navigation (not client-side routing) — the session
      // cookie is shared via Domain=.phoolgobhi.com, so the partner app
      // picks it up on load with no token ever passed through the URL.
      window.location.href = PARTNER_APP_URL;
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
      <h1 className="text-2xl font-bold mb-2 text-center">Become a Partner</h1>
      <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
        List your gym on Phool Gobhi and start taking bookings.
      </p>

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
          {provider === 'skip' && (
            <p className="text-sm text-amber-600 dark:text-amber-400">Test mode — allowlisted numbers can use 123456.</p>
          )}
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
      <div id={RECAPTCHA_CONTAINER_ID} />

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
