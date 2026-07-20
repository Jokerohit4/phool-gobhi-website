'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SessionUser } from '@/lib/types';

interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { user: SessionUser };
      setUser(data.user);

      // wallet-service only auto-provisions a wallet row on its first read
      // (getMyWallet's try/catch fallback) — nothing creates one at signup.
      // Without this, a customer who goes straight from login to booking
      // (never visiting /account/wallet) can reach Razorpay checkout with no
      // wallet row: verifyAndCreditWallet's credit then throws "Wallet not
      // found" with no retry, after the customer has already been charged.
      // Firing this once per session closes that gap before any money can
      // move. Best-effort — a transient failure here just means the lazy
      // auto-provision on an actual wallet/booking read still catches it.
      fetch('/api/wallet/balance', { cache: 'no-store' }).catch(() => {});
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  }, []);

  return <SessionContext.Provider value={{ user, loading, refresh, logout }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
