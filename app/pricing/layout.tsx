import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Pay Per Session, No Membership | Phool Gobhi',
  description: 'Honest Phool Gobhi pricing: gyms set their own session price (₹99–₹399 in Gurugram), wallet top-ups in fixed presets, and cancellation refunds of 30–100% back to your wallet.',
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}