'use client';

import { useState } from 'react';
import RazorpayCheckoutButton from '@/components/booking/RazorpayCheckoutButton';
import { WALLET_TOPUP_AMOUNTS } from '@/lib/walletConstants';

export default function WalletTopUpForm({ onTopUpSuccess }: { onTopUpSuccess: () => void }) {
  const [amount, setAmount] = useState<number>(WALLET_TOPUP_AMOUNTS[1]);

  return (
    <div className="card-premium p-6 max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Add money</h2>
      <div className="flex gap-2 flex-wrap">
        {WALLET_TOPUP_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAmount(a)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              amount === a
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-cream-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            ₹{a}
          </button>
        ))}
      </div>
      <RazorpayCheckoutButton
        orderEndpoint="/api/wallet/orders"
        orderBody={{ amount }}
        verifyEndpoint="/api/wallet/verify"
        description="Wallet top-up"
        label={`Add ₹${amount}`}
        onSuccess={onTopUpSuccess}
      />
    </div>
  );
}
