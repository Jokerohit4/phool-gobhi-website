import { describe, it, expect } from 'vitest';
import { isApprovedForGym } from '../checkinApproval';

describe('isApprovedForGym', () => {
  it('is true once the link to this gym is approved', () => {
    expect(isApprovedForGym({ gymLinkStatus: 'approved', linkedGymId: 2 }, '2')).toBe(true);
    expect(isApprovedForGym({ gymLinkStatus: 'approved', linkedGymId: '2' }, 2)).toBe(true);
  });

  it('keeps waiting while the request is still pending', () => {
    expect(isApprovedForGym({ gymLinkStatus: 'pending', linkedGymId: 2 }, '2')).toBe(false);
  });

  it('never approves a check-in at a gym the member is not linked to', () => {
    expect(isApprovedForGym({ gymLinkStatus: 'approved', linkedGymId: 3 }, '2')).toBe(false);
    expect(isApprovedForGym({ gymLinkStatus: 'approved', linkedGymId: null }, '2')).toBe(false);
  });

  it('is false for a missing or malformed profile', () => {
    for (const me of [undefined, null, 'x', 5, {}, { gymLinkStatus: null, linkedGymId: 2 }]) {
      expect(isApprovedForGym(me, '2')).toBe(false);
    }
  });
});
