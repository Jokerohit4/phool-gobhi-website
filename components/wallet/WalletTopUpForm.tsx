'use client';

import { useState } from 'react';
import RazorpayCheckoutButton from '@/components/booking/RazorpayCheckoutButton';

const PRESET_AMOUNTS = [200, 500, 1000, 2000];

export default function WalletTopUpForm({ onTopUpSuccess }: { onTopUpSuccess: () => void }) {
  const [amount, setAmount] = useState(500);

  return (
    <div className="card-premium p-6 max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Add money</h2>
      <div className="flex gap-2 flex-wrap">
        {PRESET_AMOUNTS.map((a) => (
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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Amount
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 0))}
          className="mt-1 w-full rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </label>
      <RazorpayCheckoutButton amount={amount} label={`Add ₹${amount}`} onSuccess={onTopUpSuccess} />
    </div>
  );
}
