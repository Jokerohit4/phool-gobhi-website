'use client';

import { useSession } from '@/components/auth/SessionProvider';
import AttendanceWarningsView from '@/components/attendance/AttendanceWarningsView';

export default function WarningsPage() {
  const { user, loading } = useSession();

  if (loading) return <div className="section-padding container-custom">Loading…</div>;
  if (!user) return <div className="section-padding container-custom">Please log in to view your warnings.</div>;

  return (
    <div className="section-padding container-custom space-y-6">
      <h1 className="text-3xl font-bold">My warnings</h1>
      <AttendanceWarningsView />
    </div>
  );
}
