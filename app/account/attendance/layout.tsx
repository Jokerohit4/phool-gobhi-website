import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attendance | Phool Gobhi',
  robots: { index: false, follow: false },
};

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
