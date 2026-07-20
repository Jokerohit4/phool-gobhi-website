export default function WalletBalanceBadge({ balance }: { balance: number | null }) {
  return (
    <div className="card-premium p-6 max-w-md">
      <p className="text-sm text-gray-500 dark:text-gray-400">Wallet balance</p>
      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
        {balance === null ? '…' : `₹${balance.toFixed(2)}`}
      </p>
    </div>
  );
}
