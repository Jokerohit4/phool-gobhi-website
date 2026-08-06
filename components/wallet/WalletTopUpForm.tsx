'use client';

import { useState } from 'react';
import RazorpayCheckoutButton from '@/components/booking/RazorpayCheckoutButton';
import { useWalletTopupConfig } from '@/lib/useWalletTopupConfig';

export default function WalletTopUpForm({ onTopUpSuccess }: { onTopUpSuccess: () => void }) {
  const config = useWalletTopupConfig();
  const [manualCustom, setManualCustom] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');

  // No presets to pick from (config loaded with an empty list) forces
  // custom mode regardless of what the user clicked — derived, not synced
  // via an effect, so it stays correct across config reloads for free.
  const useCustom = manualCustom || config.presets.length === 0;
  // Falls back to the "popular" second preset (matching the platform's
  // original default) whenever nothing's been explicitly picked yet, or the
  // previous pick no longer exists in a reloaded config.
  const amount =
    selectedPreset != null && config.presets.includes(selectedPreset)
      ? selectedPreset
      : (config.presets[1] ?? config.presets[0] ?? null);

  const customAmountNum = Number(customValue);
  const customValid =
    config.allowCustomAmount &&
    customValue !== '' &&
    Number.isInteger(customAmountNum) &&
    customAmountNum >= (config.minCustomAmount ?? 1) &&
    customAmountNum <= (config.maxCustomAmount ?? Infinity);

  const effectiveAmount = useCustom ? (customValid ? customAmountNum : null) : amount;

  return (
    <div className="card-premium p-6 max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Add money</h2>
      <div className="flex gap-2 flex-wrap">
        {config.presets.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => {
              setManualCustom(false);
              setSelectedPreset(a);
            }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              !useCustom && amount === a
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-cream-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            ₹{a}
          </button>
        ))}
        {config.allowCustomAmount && (
          <button
            type="button"
            onClick={() => setManualCustom(true)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              useCustom
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-cream-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Custom
          </button>
        )}
      </div>

      {useCustom && config.allowCustomAmount && (
        <div>
          <input
            type="number"
            inputMode="numeric"
            step={1}
            min={config.minCustomAmount ?? 1}
            max={config.maxCustomAmount ?? undefined}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={`₹${config.minCustomAmount ?? 1} – ₹${config.maxCustomAmount ?? ''}`}
            className="w-full rounded-lg border border-cream-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm"
          />
          {customValue !== '' && !customValid && (
            <p className="text-sm text-red-500 mt-1">
              Enter a whole number between ₹{config.minCustomAmount} and ₹{config.maxCustomAmount}
            </p>
          )}
        </div>
      )}

      {effectiveAmount != null && (
        <RazorpayCheckoutButton
          orderEndpoint="/api/wallet/orders"
          orderBody={{ amount: effectiveAmount }}
          verifyEndpoint="/api/wallet/verify"
          description="Wallet top-up"
          label={`Add ₹${effectiveAmount}`}
          onSuccess={onTopUpSuccess}
        />
      )}
    </div>
  );
}
