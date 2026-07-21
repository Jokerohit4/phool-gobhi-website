// Single source of truth for both components/wallet/WalletTopUpForm.tsx (the
// UI options) and app/api/wallet/orders/route.ts (the server-side check that
// makes the restriction actually enforceable rather than just a UI nicety).
export const WALLET_TOPUP_AMOUNTS = [200, 500, 1000, 2000] as const;
