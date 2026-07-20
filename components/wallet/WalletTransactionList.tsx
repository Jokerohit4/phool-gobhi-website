'use client';

import { useEffect, useState } from 'react';
import type { WalletTransaction } from '@/lib/types';

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

  useEffect(() => {
    setTransactions(null);
    setError(null);
    fetch('/api/wallet/transactions', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Could not load transactions');
          return;
        }
        setTransactions(data.data ?? []);
      })
      .catch(() => setError('Network error — please try again'));
  }, [refreshKey]);

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
    </div>
  );
}
