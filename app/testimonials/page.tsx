import type { Metadata } from 'next';
import { gatewayFetch } from '@/lib/gateway-client';
import ReviewForm from '@/components/testimonials/ReviewForm';

export const metadata: Metadata = {
  title: 'What Users Say About Us — Phool Gobhi',
  description: 'Real reviews from Phool Gobhi customers about pay-per-session gym access in Gurugram.',
  alternates: { canonical: '/testimonials' },
};

interface PlatformReview {
  id: number;
  rating: number;
  comment: string | null;
  customerName: string;
}

export default async function TestimonialsPage() {
  const reviews = await gatewayFetch<{ data: PlatformReview[] }>('/api/auth/platform-reviews')
    .then((res) => res.data)
    .catch(() => [] as PlatformReview[]);

  return (
    <div className="section-padding container-custom flex flex-col gap-12">
      <div className="text-center flex flex-col gap-3">
        <h1 className="font-display text-5xl stroke-terracotta">What users say about us</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Real reviews from real Phool Gobhi customers.</p>
      </div>

      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="card-premium p-6 flex flex-col gap-3">
              <div className="text-yellow-400 text-lg" aria-label={`${r.rating} out of 5 stars`}>
                {'★'.repeat(r.rating)}
                <span className="text-gray-300 dark:text-gray-700">{'★'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p className="text-gray-700 dark:text-gray-300">&ldquo;{r.comment}&rdquo;</p>}
              <p className="text-sm font-medium text-gray-500">{r.customerName}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No reviews yet — be the first to share your experience.</p>
      )}

      <ReviewForm />
    </div>
  );
}
