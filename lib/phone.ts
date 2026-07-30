// Mirrors auth-service's normalizePhone (authService.js) — only Indian
// mobile numbers are supported anywhere else on the platform, so the E.164
// value handed to Firebase must resolve to the same 10-digit number.
export function toE164(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const local =
    digits.length === 12 && digits.startsWith('91') ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0') ? digits.slice(1)
    : digits;
  return /^[6-9]\d{9}$/.test(local) ? `+91${local}` : null;
}
