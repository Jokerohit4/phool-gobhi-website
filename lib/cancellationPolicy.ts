// Cancellation-refund display logic.
//
// The actual refund is decided server-side by booking-service, which reads its
// own admin-editable CancellationPolicySetting (admin portal Settings page).
// This module is ONLY for showing the applicable tier before the customer
// confirms — the backend wins if we ever disagree. Instead of hand-mirroring
// the policy (which is what used to happen, and drifted), the BookingCard
// fetches the live policy from GET /api/bookings/cancellation-policy and
// passes its tiers here; DEFAULT_TIERS below are only the offline fallback.
const IST_OFFSET_MS = (5 * 60 + 30) * 60000;

function slotInstantUTC(date: string, startTime: string): number {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = startTime.split(':').map(Number);
  return Date.UTC(y, mo - 1, d, h, mi) - IST_OFFSET_MS;
}

export function hoursUntilSlot(date: string, startTime: string): number {
  return (slotInstantUTC(date, startTime) - Date.now()) / 3600000;
}

export function isSlotOver(date: string, endTime: string): boolean {
  return slotInstantUTC(date, endTime) <= Date.now();
}

// Shape of booking-service's CancellationPolicySetting.tiers (sorted by
// maxHoursNotice ascending; a null maxHoursNotice is the catch-all tier).
export interface CancellationPolicyTier {
  maxHoursNotice: number | null;
  blocked: boolean;
  refundRate: number; // 0-1; meaningless when blocked
}

// Mirrors booking-service's DEFAULT_CANCELLATION_TIERS seed — used only when
// the live policy can't be fetched.
export const DEFAULT_CANCELLATION_TIERS: CancellationPolicyTier[] = [
  { maxHoursNotice: 1, blocked: true, refundRate: 0 },
  { maxHoursNotice: 4, blocked: false, refundRate: 0.3 },
  { maxHoursNotice: 8, blocked: false, refundRate: 0.5 },
  { maxHoursNotice: null, blocked: false, refundRate: 1.0 },
];

export interface CancellationTier {
  blocked: boolean;
  refundRate: number; // 0-1; meaningless when blocked
}

// Same first-match semantics as booking-service's cancellationRefundRate:
// the first tier whose maxHoursNotice is null OR hoursUntil is under it wins.
export function cancellationTier(
  hoursUntil: number,
  tiers: CancellationPolicyTier[] = DEFAULT_CANCELLATION_TIERS,
): CancellationTier {
  for (const tier of tiers) {
    if (tier.maxHoursNotice === null || hoursUntil < tier.maxHoursNotice) {
      return { blocked: tier.blocked, refundRate: tier.refundRate };
    }
  }
  return { blocked: true, refundRate: 0 };
}

// The "you can't cancel" messaging needs the actual notice threshold from the
// live policy, not the legacy hardcoded "1 hour".
export function blockedReasonLabel(tiers: CancellationPolicyTier[] = DEFAULT_CANCELLATION_TIERS): string {
  const blockingTier = tiers.find((t) => t.blocked && t.maxHoursNotice != null);
  if (!blockingTier) return 'This booking cannot be cancelled';
  const hours = blockingTier.maxHoursNotice as number;
  return `Cannot cancel within ${hours} hour${hours === 1 ? '' : 's'} of the session`;
}