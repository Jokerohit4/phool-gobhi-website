import type { Metadata } from 'next';
import PitchAccessGate from '@/components/PitchAccessGate';
import PitchDeckContent from '@/components/PitchDeckContent';

export const metadata: Metadata = {
  title: 'Phool Gobhi — Investor Deck',
  robots: { index: false, follow: false },
};

export default function PitchDeckPage() {
  return (
    <PitchAccessGate>
      <PitchDeckContent />
    </PitchAccessGate>
  );
}
