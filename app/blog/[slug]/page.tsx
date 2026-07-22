import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { blogPosts, getBlogPost } from '@/lib/blogPosts';

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Post Not Found | Phool Gobhi' };

  return {
    title: `${post.title} | Phool Gobhi Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
    },
  };
}

function blogPostingJsonLd(post: NonNullable<ReturnType<typeof getBlogPost>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: new Date(post.date).toISOString(),
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Phool Gobhi' },
    mainEntityOfPage: `https://www.phoolgobhi.com/blog/${post.slug}`,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <section className="relative min-h-screen section-padding bg-cream-50 dark:bg-gray-950">
      <JsonLd data={blogPostingJsonLd(post)} />
      <div className="container-custom max-w-3xl">
        <Link href="/blog" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
          ← Back to Blog
        </Link>

        <div className="mt-8 mb-10">
          <span className="inline-block w-fit px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mb-4">
            {post.category}
          </span>
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-gray-900 dark:text-white">{post.title}</h1>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-500">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
            <span>·</span>
            <span>By {post.author}</span>
          </div>
        </div>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
          {post.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{section.heading}</h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p key={j} className="mb-4">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="sticker !rounded-3xl bg-cream-100 dark:bg-gray-900 p-8 text-center mt-12">
          <h2 className="font-display text-2xl md:text-3xl mb-3">Ready to book a session?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Browse gyms near you — no membership, just pay per session.
          </p>
          <Link href="/gyms" className="btn-primary inline-block">
            Find a Gym 🥦
          </Link>
        </div>
      </div>
    </section>
  );
}
