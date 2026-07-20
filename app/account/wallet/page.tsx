'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/components/auth/SessionProvider';
import WalletBalanceBadge from '@/components/wallet/WalletBalanceBadge';
import WalletTopUpForm from '@/components/wallet/WalletTopUpForm';
import WalletTransactionList from '@/components/wallet/WalletTransactionList';

export default function WalletPage() {
  const { user, loading: sessionLoading } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/balance', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load wallet');
        return;
      }
      setBalance(Number(data.data?.balance ?? 0));
    } catch {
      setError('Network error — please try again');
    }
  }, []);

  useEffect(() => {
    if (user) loadBalance();
  }, [user, loadBalance]);

  const handleTopUpSuccess = useCallback(() => {
    loadBalance();
    setRefreshKey((k) => k + 1);
  }, [loadBalance]);

  if (sessionLoading) return <div className="section-padding container-custom">Loading…</div>;
  if (!user) return <div className="section-padding container-custom">Please log in to view your wallet.</div>;

  return (
    <div className="section-padding container-custom space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>
      {error && <p className="text-red-500">{error}</p>}
      <WalletBalanceBadge balance={balance} />
      <WalletTopUpForm onTopUpSuccess={handleTopUpSuccess} />
      <WalletTransactionList refreshKey={refreshKey} />
    </div>
  );
}
