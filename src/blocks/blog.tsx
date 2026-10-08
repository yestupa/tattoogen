import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { blogPostPath } from '@/lib/post-slug';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { BlogCard } from '@/components/blog-card';
import { formatPostDate, type BlogPost } from '@/content/posts';

// Optional supplied posts retain the existing card wiring. The landing page
// links to the blog without adding a second blog query to its loader.
export function Blog({ posts = [] }: { posts?: BlogPost[] } = {}) {
  const locale = getLocale();

  return (
    <section id="blog" className="section-ink px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell">
        <div className="mb-12 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <h2 className="font-display max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['landing.blog.title']()}
          </h2>
          <p className="text-ink-muted max-w-2xl text-base leading-7 sm:text-lg lg:justify-self-end">
            {m['landing.blog.description']()}
          </p>
        </div>
        <div className="paper-ui grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <BlogCard
                key={post.slug}
                href={blogPostPath(post.slug)}
                title={post.title}
                description={post.description}
                image={post.image}
                date={formatPostDate(post.createdAt, locale)}
                authorName={post.authorName}
                authorImage={post.authorImage}
              />
            ))
          ) : (
            <p className="border-ink-line text-ink-muted rounded-[1.25rem] border px-6 py-10 text-sm leading-6 sm:col-span-2 lg:col-span-3">
              {m['landing.blog.empty']()}
            </p>
          )}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="touch-target text-ink-muted hover:text-ink-fg inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            {m['landing.blog.view_all']()}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
