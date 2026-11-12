// The poster check-in's waiting screen polls /api/auth/me and finishes the
// check-in once the gym approves the member. This is that decision, kept pure so
// it can be tested without a browser.
//
// Approved means: the account's active link is confirmed (gymLinkStatus) AND it
// is a link to the gym on this poster. A member who is approved at a different
// gym must not be checked in here, and a still-pending link must keep waiting.
export function isApprovedForGym(me: unknown, gymId: string | number): boolean {
  if (!me || typeof me !== 'object') return false;
  const { gymLinkStatus, linkedGymId } = me as { gymLinkStatus?: unknown; linkedGymId?: unknown };
  return gymLinkStatus === 'approved' && linkedGymId != null && String(linkedGymId) === String(gymId);
}

// ---- Check-out -------------------------------------------------------------

export interface CheckinPresence {
  inside: true;
  since: string | null;
  canCheckOut: boolean;
}

// Reads `presence` off a successful check-in payload. Only a well-formed
// `inside: true` counts; anything else is "not known to be inside".
export function readPresence(data: unknown): CheckinPresence | null {
  if (!data || typeof data !== 'object') return null;
  const presence = (data as { presence?: unknown }).presence;
  if (!presence || typeof presence !== 'object') return null;
  const { inside, since, canCheckOut } = presence as { inside?: unknown; since?: unknown; canCheckOut?: unknown };
  if (inside !== true) return null;
  return { inside: true, since: typeof since === 'string' ? since : null, canCheckOut: canCheckOut === true };
}

export type CheckinSuccessPhase = 'success' | 'alreadyVerified' | 'inside';

// A scan by someone already inside must offer check-out instead of a second
// "checked in" screen; the server changed nothing for them.
export function phaseForCheckinSuccess(data: unknown): CheckinSuccessPhase {
  const alreadyVerified = !!data && typeof data === 'object' && (data as { alreadyVerified?: unknown }).alreadyVerified === true;
  if (!alreadyVerified) return 'success';
  const presence = readPresence(data);
  return presence?.canCheckOut ? 'inside' : 'alreadyVerified';
}

export type CheckoutErrorPhase = 'checkoutTooFar' | 'notInside' | 'locationDenied' | 'error';

export function phaseForCheckoutError(code: unknown): CheckoutErrorPhase {
  if (code === 'TOO_FAR') return 'checkoutTooFar';
  if (code === 'NOT_INSIDE') return 'notInside';
  if (code === 'LOCATION_REQUIRED') return 'locationDenied';
  return 'error';
}

export interface CheckoutResult {
  minutesInside: number | null;
  coinsReleased: number;
}

export function readCheckoutResult(data: unknown): CheckoutResult {
  const d = (data && typeof data === 'object' ? data : {}) as { minutesInside?: unknown; coinsReleased?: unknown };
  return {
    minutesInside: typeof d.minutesInside === 'number' && Number.isFinite(d.minutesInside) ? Math.max(0, Math.round(d.minutesInside)) : null,
    coinsReleased: typeof d.coinsReleased === 'number' && d.coinsReleased > 0 ? Math.floor(d.coinsReleased) : 0,
  };
}

// 75 -> "1h 15m", 60 -> "1h", 45 -> "45m", 0 -> "0m".
export function formatMinutesInside(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// "6:05 PM" in IST, regardless of the visitor's device timezone.
export function formatArrivalTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .replace(/ /g, ' ')
    .toUpperCase();
}
