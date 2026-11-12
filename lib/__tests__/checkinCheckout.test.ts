import { describe, it, expect } from 'vitest';
import {
  formatArrivalTime,
  formatMinutesInside,
  phaseForCheckinSuccess,
  phaseForCheckoutError,
  readCheckoutResult,
  readPresence,
} from '../checkinApproval';

const presence = { inside: true, since: '2026-11-12T12:35:00.000Z', canCheckOut: true };

describe('phaseForCheckinSuccess', () => {
  it('maps a scan by someone already inside to the inside phase', () => {
    expect(phaseForCheckinSuccess({ kind: 'member', alreadyVerified: true, presence })).toBe('inside');
    expect(phaseForCheckinSuccess({ kind: 'booking', alreadyVerified: true, presence })).toBe('inside');
  });
  it('keeps a fresh check-in as success even though it carries presence', () => {
    expect(phaseForCheckinSuccess({ kind: 'member', presence })).toBe('success');
  });
  it('falls back to alreadyVerified without usable presence', () => {
    expect(phaseForCheckinSuccess({ alreadyVerified: true })).toBe('alreadyVerified');
    expect(phaseForCheckinSuccess({ alreadyVerified: true, presence: { ...presence, canCheckOut: false } })).toBe('alreadyVerified');
    expect(phaseForCheckinSuccess(undefined)).toBe('success');
  });
});

describe('readPresence', () => {
  it('requires inside === true', () => {
    expect(readPresence({ presence })).toEqual(presence);
    expect(readPresence({ presence: { ...presence, inside: false } })).toBeNull();
    expect(readPresence({})).toBeNull();
  });
});

describe('phaseForCheckoutError', () => {
  it('maps backend codes', () => {
    expect(phaseForCheckoutError('TOO_FAR')).toBe('checkoutTooFar');
    expect(phaseForCheckoutError('NOT_INSIDE')).toBe('notInside');
    expect(phaseForCheckoutError('LOCATION_REQUIRED')).toBe('locationDenied');
    expect(phaseForCheckoutError('SOMETHING_ELSE')).toBe('error');
    expect(phaseForCheckoutError(undefined)).toBe('error');
  });
});

describe('readCheckoutResult / formatting', () => {
  it('reads minutes and coins, treating missing coins as 0', () => {
    expect(readCheckoutResult({ minutesInside: 75, coinsReleased: 12 })).toEqual({ minutesInside: 75, coinsReleased: 12 });
    expect(readCheckoutResult({ minutesInside: 75, coinsReleased: 0 })).toEqual({ minutesInside: 75, coinsReleased: 0 });
    expect(readCheckoutResult(null)).toEqual({ minutesInside: null, coinsReleased: 0 });
  });
  it('formats duration', () => {
    expect(formatMinutesInside(75)).toBe('1h 15m');
    expect(formatMinutesInside(60)).toBe('1h');
    expect(formatMinutesInside(45)).toBe('45m');
    expect(formatMinutesInside(0)).toBe('0m');
  });
  it('formats arrival time in IST', () => {
    expect(formatArrivalTime('2026-11-12T12:35:00.000Z')).toBe('6:05 PM');
    expect(formatArrivalTime('garbage')).toBe('');
    expect(formatArrivalTime(null)).toBe('');
  });
});
