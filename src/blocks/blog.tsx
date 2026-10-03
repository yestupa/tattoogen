import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { BlogCard } from '@/components/blog-card';
import { formatPostDate, type BlogPost } from '@/content/posts';

// Optional supplied posts retain the existing card wiring. The landing page
// links to the blog without adding a second blog query to its loader.
export function Blog({ posts = [] }: { posts?: BlogPost[] } = {}) {
  const locale = getLocale();

  return (
    <section id="blog" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="border-border bg-card rounded-shell mx-auto max-w-6xl border p-6 sm:p-12">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            {m['landing.blog.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg">
            {m['landing.blog.description']()}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              href={`/blog/${post.slug}`}
              title={post.title}
              description={post.description}
              image={post.image}
              date={formatPostDate(post.createdAt, locale)}
              authorName={post.authorName}
              authorImage={post.authorImage}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            {m['landing.blog.view_all']()}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
