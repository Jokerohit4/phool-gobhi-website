// Fallback ONLY — used until the live config loads (or if the fetch fails).
// Matches the platform's original hardcoded behavior exactly. Live values
// come from GET /api/wallet/topup-config -> wallet-service's
// WalletTopupConfig, admin-editable via phool-gobhi-admin's Settings page.
export interface WalletTopupConfig {
  presets: number[];
  allowCustomAmount: boolean;
  minCustomAmount: number | null;
  maxCustomAmount: number | null;
}

export const DEFAULT_WALLET_TOPUP_CONFIG: WalletTopupConfig = {
  presets: [200, 500, 1000, 2000],
  allowCustomAmount: false,
  minCustomAmount: null,
  maxCustomAmount: null,
};
