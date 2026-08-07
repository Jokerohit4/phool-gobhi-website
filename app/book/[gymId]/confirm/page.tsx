import type { Metadata } from 'next';
import BookingConfirmClient from '@/components/booking/BookingConfirmClient';

export const metadata: Metadata = {
  title: 'Confirm Booking | Phool Gobhi',
  robots: { index: false, follow: false },
};

export default async function BookingConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ gymId: string }>;
  searchParams: Promise<{ date?: string; startTime?: string; endTime?: string; classId?: string }>;
}) {
  const { gymId } = await params;
  const { date, startTime, endTime, classId } = await searchParams;

  if (!date || (!classId && (!startTime || !endTime))) {
    return (
      <div className="section-padding container-custom">
        <p className="text-red-500">Missing slot selection — go back and pick a date and time.</p>
      </div>
    );
  }

  return (
    <div className="section-padding container-custom">
      <BookingConfirmClient gymId={gymId} date={date} startTime={startTime} endTime={endTime} classId={classId} />
    </div>
  );
}
