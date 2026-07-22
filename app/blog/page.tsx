import type { Metadata } from 'next';
import Link from 'next/link';
import { PosterFill, PosterOutline, StickerBadge } from '@/components/Poster';
import { blogPosts } from '@/lib/blogPosts';

export const metadata: Metadata = {
  title: 'Blog | Phool Gobhi',
  description: 'Fitness tips, gym guides, nutrition basics, and budget-friendly workout advice for Gurugram — from the team building pay-per-session gym access.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return (
    <section className="relative min-h-screen section-padding dot-grid bg-cream-50 dark:bg-gray-950 overflow-hidden">
      <StickerBadge color="mustard" size={52} rotate={-10} delay={0} motion="wiggle" className="absolute top-24 left-[7%] hidden md:flex">📝</StickerBadge>
      <StickerBadge color="emerald" size={46} rotate={12} delay={0.5} motion="pulse" className="absolute top-40 right-[8%] hidden lg:flex">🥦</StickerBadge>

      <div className="container-custom max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="font-display text-6xl md:text-7xl mb-4">
            <PosterOutline>Phool Gobhi</PosterOutline> <PosterFill color="emerald">Blog</PosterFill>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Fitness tips, gym guides, and lifestyle insights for Gurugram.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-premium p-6 flex flex-col hover:shadow-lg transition-all"
            >
              <span className="inline-block w-fit px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mb-4">
                {post.category}
              </span>
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{post.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">{post.excerpt}</p>
              <div className="border-t border-cream-200 dark:border-gray-800 pt-4">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-500">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">By {post.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
