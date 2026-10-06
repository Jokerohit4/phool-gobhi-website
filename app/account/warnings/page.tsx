'use client';

import { useSession } from '@/components/auth/SessionProvider';
import AttendanceWarningsView from '@/components/attendance/AttendanceWarningsView';
import LoggedOutNotice from '@/components/auth/LoggedOutNotice';

export default function WarningsPage() {
  const { user, loading } = useSession();

  if (loading) return <div className="section-padding container-custom">Loading…</div>;
  if (!user) return <LoggedOutNotice what="Please log in to view your warnings." />;

  return (
    <div className="section-padding container-custom space-y-6">
      <h1 className="text-3xl font-bold">My warnings</h1>
      <AttendanceWarningsView />
    </div>
  );
}
