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
