'use client';

import { useSession } from '@/components/auth/SessionProvider';
import AttendanceSummaryView from '@/components/attendance/AttendanceSummaryView';

export default function AttendancePage() {
  const { user, loading } = useSession();

  if (loading) return <div className="section-padding container-custom">Loading…</div>;
  if (!user) return <div className="section-padding container-custom">Please log in to view your attendance.</div>;

  return (
    <div className="section-padding container-custom space-y-6">
      <h1 className="text-3xl font-bold">My attendance</h1>
      <AttendanceSummaryView />
    </div>
  );
}
