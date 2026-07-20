import BookingConfirmClient from '@/components/booking/BookingConfirmClient';

export default async function BookingConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ gymId: string }>;
  searchParams: Promise<{ date?: string; startTime?: string; endTime?: string }>;
}) {
  const { gymId } = await params;
  const { date, startTime, endTime } = await searchParams;

  if (!date || !startTime || !endTime) {
    return (
      <div className="section-padding container-custom">
        <p className="text-red-500">Missing slot selection — go back and pick a date and time.</p>
      </div>
    );
  }

  return (
    <div className="section-padding container-custom">
      <BookingConfirmClient gymId={gymId} date={date} startTime={startTime} endTime={endTime} />
    </div>
  );
}
