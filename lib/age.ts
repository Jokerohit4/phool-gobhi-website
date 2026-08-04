// Shared client-side date-of-birth policy for every place the website
// collects it (profile page, booking profile-completion gate). Mirrored
// server-side in auth-service's userProfileController.updateProfile so the
// API rejects under-age DOBs regardless of client.
export const MIN_AGE_YEARS = 11;

// Latest date-of-birth a user may pick while still meeting the minimum age
// (someone whose 11th birthday is today is still allowed). Built from the
// client's local date so the picker's `max` matches the user's calendar.
export function maxDateOfBirth(): string {
  const now = new Date();
  const y = now.getFullYear() - MIN_AGE_YEARS;
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Returns an error message when [value] (YYYY-MM-DD) is not at least
// MIN_AGE_YEARS old, or null when valid/empty. Both sides of the comparison
// parse date-only strings to UTC midnight, so there's no timezone drift.
export function dateOfBirthError(value: string): string | null {
  if (!value) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return 'Enter a valid date';
  const cutoff = new Date(maxDateOfBirth());
  if (dob.getTime() > cutoff.getTime()) {
    return `You must be at least ${MIN_AGE_YEARS} years old`;
  }
  return null;
}
