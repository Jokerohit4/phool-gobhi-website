'use client';

import { useEffect, useState } from 'react';
import type { WalletTransaction } from '@/lib/types';
import { appendUnique, readMeta, type PageMeta } from '@/lib/pagination';

const PAGE_SIZE = 50;

const SIGN: Record<WalletTransaction['type'], '+' | '-'> = {
  credit: '+',
  bonus: '+',
  debit: '-',
  payout: '-',
  transfer: '-',
};

export default function WalletTransactionList({ refreshKey }: { refreshKey: number }) {
  const [transactions, setTransactions] = useState<WalletTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PageMeta>({ nextCursor: null, hasMore: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  useEffect(() => {
    setTransactions(null);
    setError(null);
    setMeta({ nextCursor: null, hasMore: false });
    setMoreError(null);
    fetch(`/api/wallet/transactions?limit=${PAGE_SIZE}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Could not load transactions');
          return;
        }
        setTransactions(data.data ?? []);
        setMeta(readMeta(data));
      })
      .catch(() => setError('Network error — please try again'));
  }, [refreshKey]);

  async function loadMore() {
    if (loadingMore || !meta.hasMore || meta.nextCursor === null) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const res = await fetch(`/api/wallet/transactions?limit=${PAGE_SIZE}&cursor=${meta.nextCursor}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setMoreError(data.error || 'Could not load more transactions');
        return;
      }
      setTransactions((held) => appendUnique(held ?? [], data.data ?? []));
      setMeta(readMeta(data));
    } catch {
      setMoreError('Network error — please try again');
    } finally {
      setLoadingMore(false);
    }
  }

  if (error) return <p className="text-red-500">{error}</p>;
  if (!transactions) return <p className="text-gray-500 dark:text-gray-400">Loading transactions…</p>;
  if (transactions.length === 0) return <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>;

  return (
    <div className="card-premium p-6 max-w-md space-y-3">
      <h2 className="text-lg font-semibold">Transactions</h2>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between text-sm border-b border-cream-100 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
            <div>
              <p className="font-medium capitalize">{tx.description || tx.type}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {tx.status !== 'success' && ` · ${tx.status}`}
              </p>
            </div>
            <span className={SIGN[tx.type] === '+' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-700 dark:text-gray-300 font-semibold'}>
              {SIGN[tx.type]}₹{tx.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      {moreError && <p className="text-center text-sm text-red-500">{moreError}</p>}
      {meta.hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full rounded-lg border border-cream-200 px-4 py-2 text-sm font-semibold transition hover:bg-cream-100 disabled:opacity-60 dark:border-gray-800 dark:hover:bg-gray-800/50"
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
