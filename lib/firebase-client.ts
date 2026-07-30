'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

// Firebase web config is not a secret (security comes from Authorized
// Domains + reCAPTCHA/App Check, not from hiding these values) — safe to
// default inline rather than require Vercel env vars. Defaults point at the
// `phool-gobhi` project (same one prod auth-service's Firebase Admin
// credentials and the mobile apps' prod flavor use); overridable per Vercel
// environment (see GATEWAY_URL/COOKIE_DOMAIN) so Preview deployments — which
// talk to the dev gateway/auth-service — verify against
// `phool-gobhi-customer-dev` instead, since a Firebase ID token is only
// valid for the project that issued it.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCX9FO9MQNczdmAHqRfcd_neXrpnq7wRMw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'phool-gobhi.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'phool-gobhi',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'phool-gobhi.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '1077801427223',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:1077801427223:web:8608c47d9e31a4d4b65752',
};

export function getFirebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

// One invisible verifier per container id, reused across send attempts —
// Firebase throws if you call render() on a container that already has a
// live widget, so callers must clear() before creating a new one (e.g. on
// unmount) rather than recreating per submit.
export function createRecaptchaVerifier(containerId: string) {
  return new RecaptchaVerifier(getFirebaseAuth(), containerId, { size: 'invisible' });
}
