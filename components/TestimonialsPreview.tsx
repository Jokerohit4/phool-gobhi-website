import Link from 'next/link';
import { gatewayFetch } from '@/lib/gateway-client';

interface PlatformReview {
  id: number;
  rating: number;
  comment: string | null;
  customerName: string;
}

// Homepage preview of approved platform reviews — full list + the submit
// form live on /testimonials. Renders nothing until there's at least one
// approved review, rather than showing an empty "What users say" section.
export default async function TestimonialsPreview() {
  const reviews = await gatewayFetch<{ data: PlatformReview[] }>('/api/auth/platform-reviews')
    .then((res) => res.data.slice(0, 3))
    .catch(() => [] as PlatformReview[]);

  if (reviews.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-custom flex flex-col gap-8">
        <h2 className="font-display text-4xl text-center">What users say about us</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="card-premium p-6 flex flex-col gap-3">
              <div className="text-yellow-400 text-lg" aria-label={`${r.rating} out of 5 stars`}>
                {'★'.repeat(r.rating)}
                <span className="text-gray-300 dark:text-gray-700">{'★'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p className="text-gray-700 dark:text-gray-300 line-clamp-4">&ldquo;{r.comment}&rdquo;</p>}
              <p className="text-sm font-medium text-gray-500">{r.customerName}</p>
            </div>
          ))}
        </div>
        <Link href="/testimonials" className="btn-secondary w-fit mx-auto">
          See all reviews →
        </Link>
      </div>
    </section>
  );
}
