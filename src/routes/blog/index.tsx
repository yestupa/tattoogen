import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { blogPostPath } from '@/lib/post-slug';
import { m } from '@/paraglide/messages.js';
import {
  baseLocale,
  getLocale,
  locales,
  localizeUrl,
} from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { BlogCard } from '@/components/blog-card';
import { formatPostDate } from '@/content/posts';
import { getBlogPostsFn } from '@/content/posts/server';

export const Route = createFileRoute('/blog/')({
  loader: async () => {
    const locale = getLocale();
    const posts = await getBlogPostsFn({ data: { locale } });
    return { locale, posts };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? baseLocale;
    const title = `${m['blog.title']({}, { locale })} | ${envConfigs.app_name}`;
    const description = m['blog.description']({}, { locale });
    const urlFor = (loc: typeof locale) =>
      localizeUrl(new URL('/blog', envConfigs.app_url), { locale: loc }).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: urlFor(locale) },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor(baseLocale) },
      ],
    };
  },
  component: BlogPage,
});

function BlogPage() {
  const { locale, posts } = Route.useLoaderData();

  return (
    <div className="bg-ink-bg text-ink-fg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section
          data-public-hero
          className="section-ink px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="section-shell">
            <p className="eyebrow-vermilion">{m['landing.blog.title']()}</p>
            <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[0.94] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
              {m['blog.title']()}
            </h1>
            <p className="text-ink-muted mt-5 max-w-2xl text-base leading-7 sm:text-lg">
              {m['blog.description']()}
            </p>
          </div>
        </section>
        <section className="section-paper paper-texture px-4 py-16 sm:px-6 sm:py-24">
          <div className="section-shell">
            {posts.length === 0 ? (
              <p className="border-paper-line bg-paper-panel text-paper-muted rounded-[1.25rem] border px-6 py-12 text-center">
                {m['blog.no_posts']()}
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
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
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
