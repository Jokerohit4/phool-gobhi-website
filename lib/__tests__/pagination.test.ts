import { describe, it, expect } from 'vitest';
import { pageQuery, readMeta, appendUnique } from '../pagination';

describe('pageQuery', () => {
  it('is empty without a request or params', () => {
    expect(pageQuery()).toBe('');
    expect(pageQuery(new Request('http://x/api'))).toBe('');
  });
  it('forwards numeric limit and cursor only', () => {
    expect(pageQuery(new Request('http://x/api?limit=50&cursor=9&a=b'))).toBe('?limit=50&cursor=9');
    expect(pageQuery(new Request('http://x/api?limit=-1&cursor=0x1'))).toBe('');
  });
});

describe('readMeta', () => {
  it('reads hasMore and nextCursor', () => {
    expect(readMeta({ meta: { nextCursor: 8, hasMore: true } })).toEqual({ nextCursor: 8, hasMore: true });
  });
  it('treats missing meta (older server) as the last page', () => {
    expect(readMeta({})).toEqual({ nextCursor: null, hasMore: false });
  });
  it('stops when nextCursor is null even if hasMore is true', () => {
    expect(readMeta({ meta: { nextCursor: null, hasMore: true } }).hasMore).toBe(false);
  });
  it('reports the final page', () => {
    expect(readMeta({ meta: { nextCursor: 3, hasMore: false } }).hasMore).toBe(false);
  });
});

describe('appendUnique', () => {
  it('appends in order and drops repeated ids', () => {
    expect(appendUnique([{ id: 3 }, { id: 2 }], [{ id: 2 }, { id: 1 }])).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
  });
});
