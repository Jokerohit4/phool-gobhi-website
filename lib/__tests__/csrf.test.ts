import { describe, it, expect } from 'vitest';
import { rejectCrossOrigin } from '../csrf';

function req(headers: Record<string, string>) {
  return new Request('http://localhost:3000/api/x', { method: 'POST', headers });
}

describe('rejectCrossOrigin', () => {
  it('allows requests with no Origin and no Sec-Fetch-Site', () => {
    expect(rejectCrossOrigin(req({ host: 'www.phoolgobhi.com' }))).toBeNull();
  });

  it('allows a matching Origin', () => {
    expect(
      rejectCrossOrigin(req({ origin: 'https://www.phoolgobhi.com', host: 'www.phoolgobhi.com' })),
    ).toBeNull();
  });

  it('rejects a mismatched Origin with 403', () => {
    const res = rejectCrossOrigin(req({ origin: 'https://evil.example', host: 'www.phoolgobhi.com' }));
    expect(res?.status).toBe(403);
  });

  it('rejects Sec-Fetch-Site: cross-site even without an Origin', () => {
    const res = rejectCrossOrigin(req({ 'sec-fetch-site': 'cross-site', host: 'www.phoolgobhi.com' }));
    expect(res?.status).toBe(403);
  });

  it('rejects Sec-Fetch-Site: cross-site even when Origin matches', () => {
    const res = rejectCrossOrigin(
      req({ 'sec-fetch-site': 'cross-site', origin: 'https://www.phoolgobhi.com', host: 'www.phoolgobhi.com' }),
    );
    expect(res?.status).toBe(403);
  });

  it.each(['same-origin', 'same-site', 'none'])('allows Sec-Fetch-Site: %s', (v) => {
    expect(rejectCrossOrigin(req({ 'sec-fetch-site': v, host: 'www.phoolgobhi.com' }))).toBeNull();
  });
});
