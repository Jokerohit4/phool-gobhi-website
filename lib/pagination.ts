// Cursor pagination helpers (bookings/mine, wallet transactions).
// Contract: `?limit=&cursor=` where cursor is the id of the last item already
// held; responses carry `meta: { nextCursor, hasMore }` next to `data`. A
// response with no `meta` (an older server returning everything at once)
// means there are no more pages.

export interface PageMeta {
  nextCursor: number | null;
  hasMore: boolean;
}

function positiveInt(raw: string | null): string | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? String(n) : null;
}

// Builds the `?limit=&cursor=` suffix to forward to the gateway from an
// incoming BFF request. Only the two validated numeric params pass through,
// so nothing else can be smuggled into the gateway URL. Empty string when
// neither is present (first page, server defaults).
export function pageQuery(request?: Request): string {
  if (!request) return '';
  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams();
  const limit = positiveInt(searchParams.get('limit'));
  const cursor = positiveInt(searchParams.get('cursor'));
  if (limit) query.set('limit', limit);
  if (cursor) query.set('cursor', cursor);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export function readMeta(body: { meta?: Partial<PageMeta> | null } | null | undefined): PageMeta {
  const m = body?.meta;
  const nextCursor = typeof m?.nextCursor === 'number' ? m.nextCursor : null;
  return { nextCursor, hasMore: m?.hasMore === true && nextCursor !== null };
}

// Merge a freshly loaded page into what is held, dropping repeated ids.
export function appendUnique<T extends { id: number }>(held: T[], page: T[]): T[] {
  const seen = new Set(held.map((item) => item.id));
  return [...held, ...page.filter((item) => !seen.has(item.id))];
}
