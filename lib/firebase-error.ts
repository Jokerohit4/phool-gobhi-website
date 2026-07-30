import { FirebaseError } from 'firebase/app';

const MESSAGES: Record<string, string> = {
  'auth/invalid-phone-number': 'Enter a valid 10-digit mobile number',
  'auth/too-many-requests': 'Too many attempts — please try again later',
  'auth/captcha-check-failed': 'Verification check failed — please try again',
  'auth/invalid-verification-code': 'Incorrect code — please check and try again',
  'auth/code-expired': 'This code has expired — request a new one',
  'auth/network-request-failed': 'Network error — please try again',
  'auth/unauthorized-domain': 'This domain is not authorized for sign-in — contact support',
};

export function firebaseAuthErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) return MESSAGES[err.code] ?? 'Something went wrong — please try again';
  return 'Network error — please try again';
}
