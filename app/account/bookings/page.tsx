'use client';

import { useSession } from '@/components/auth/SessionProvider';
import BookingHistoryList from '@/components/booking/BookingHistoryList';
import LoggedOutNotice from '@/components/auth/LoggedOutNotice';

export default function BookingsPage() {
  const { user, loading } = useSession();

  if (loading) return <div className="section-padding container-custom">Loading…</div>;
  if (!user) return <LoggedOutNotice what="Please log in to view your bookings." />;

  return (
    <div className="section-padding container-custom space-y-6">
      <h1 className="text-3xl font-bold">My bookings</h1>
      <BookingHistoryList />
    </div>
  );
}
