'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_WALLET_TOPUP_CONFIG, type WalletTopupConfig } from '@/lib/walletConstants';

// Same fail-open convention as OtpForm's /api/auth/otp-config fetch (see
// components/auth/OtpForm.tsx) — starts at, and on any error stays at, the
// hardcoded default so a slow/broken config load never blocks a top-up.
export function useWalletTopupConfig(): WalletTopupConfig {
  const [config, setConfig] = useState<WalletTopupConfig>(DEFAULT_WALLET_TOPUP_CONFIG);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/wallet/topup-config')
      .then((res) => res.json())
      .then((body) => {
        const data = body?.data;
        if (!cancelled && data && Array.isArray(data.presets)) {
          setConfig({
            presets: data.presets,
            allowCustomAmount: !!data.allowCustomAmount,
            minCustomAmount: typeof data.minCustomAmount === 'number' ? data.minCustomAmount : null,
            maxCustomAmount: typeof data.maxCustomAmount === 'number' ? data.maxCustomAmount : null,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
