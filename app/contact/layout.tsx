import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Phool Gobhi',
  description: 'Get in touch with Phool Gobhi — questions about gym bookings, partnerships, or the app? Reach out and we’ll get back to you.',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
