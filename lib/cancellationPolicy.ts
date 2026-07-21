// Display-only mirror of booking-service/services/bookingService.js's
// cancellationRefundRate — lets the UI show the applicable tier before the
// customer confirms. The backend is the sole source of truth for what
// actually gets refunded when the cancel request lands; if these two ever
// drift, the backend wins and the customer sees a different result than
// this preview promised, so keep both in sync by hand.
const IST_OFFSET_MS = (5 * 60 + 30) * 60000;

function slotInstantUTC(date: string, startTime: string): number {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = startTime.split(':').map(Number);
  return Date.UTC(y, mo - 1, d, h, mi) - IST_OFFSET_MS;
}

export function hoursUntilSlot(date: string, startTime: string): number {
  return (slotInstantUTC(date, startTime) - Date.now()) / 3600000;
}

export interface CancellationTier {
  blocked: boolean;
  refundRate: number; // 0-1; meaningless when blocked
}

export function cancellationTier(hoursUntil: number): CancellationTier {
  if (hoursUntil < 1) return { blocked: true, refundRate: 0 };
  if (hoursUntil < 4) return { blocked: false, refundRate: 0.3 };
  if (hoursUntil < 8) return { blocked: false, refundRate: 0.5 };
  return { blocked: false, refundRate: 1 };
}
