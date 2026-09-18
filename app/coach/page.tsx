'use client';

import { useSession } from '@/components/auth/SessionProvider';
import CoachChat from '@/components/coach/CoachChat';

// Top-level /coach rather than under /account: for someone training on their
// own this is the product, not a settings page. Gated per-page on useSession,
// matching every other authenticated page on this site (there is no shared
// account layout to hang a gate on).
export default function CoachPage() {
  const { user, loading } = useSession();

  if (loading) return <div className="section-padding container-custom">Loading…</div>;
  if (!user) {
    return (
      <div className="section-padding container-custom">
        Please log in to use your coach.
      </div>
    );
  }

  return <CoachChat />;
}
