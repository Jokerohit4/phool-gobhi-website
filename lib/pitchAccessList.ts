// Server-only allow-list for the gated investor deck at /pitch-deck.
// Do NOT import this from a 'use client' component — it must never reach the browser bundle.
// To grant someone access, add their phone number or email below and redeploy.

const ALLOWED_EMAILS = new Set<string>([
  'me@rohitashwa.co.in',
  'officialrohitashwa@gmail.com',
]);

// Store as bare 10-digit Indian mobile numbers (no country code, no formatting).
const ALLOWED_PHONES_10DIGIT = new Set<string>([
  '9354859197',
]);

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.slice(-10);
}

export function isAllowedContact(rawInput: string): boolean {
  const input = rawInput.trim();
  if (!input) return false;

  if (input.includes('@')) {
    return ALLOWED_EMAILS.has(normalizeEmail(input));
  }

  const phone = normalizePhone(input);
  return phone.length === 10 && ALLOWED_PHONES_10DIGIT.has(phone);
}
