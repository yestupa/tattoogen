import { createFileRoute, notFound } from '@tanstack/react-router';
import { ArrowLeft, Calendar } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
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
import { MarkdownContent } from '@/components/markdown-content';
import { buildBlogLocalePaths, formatPostDate } from '@/content/posts';
import { getBlogPostFn } from '@/content/posts/server';

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const locale = getLocale();
    const post = await getBlogPostFn({
      data: { slug: params.slug, locale },
    });
    if (!post) throw notFound();
    return { locale, post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { locale, post } = loaderData;
    const title = `${post.title} | ${envConfigs.app_name}`;
    const alternateSlugs = post.alternateSlugs ?? { [locale]: post.slug };
    const translatedLocales = locales.filter((loc) => alternateSlugs[loc]);
    const urlFor = (loc: typeof locale) => {
      const slug = alternateSlugs[loc] || post.slug;
      return localizeUrl(new URL(blogPostPath(slug), envConfigs.app_url), {
        locale: loc,
      }).href;
    };
    const fallbackLocale = alternateSlugs[baseLocale]
      ? baseLocale
      : translatedLocales[0] || locale;
    return {
      meta: [
        { title },
        { name: 'description', content: post.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: post.description },
        { property: 'og:url', content: urlFor(locale) },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: post.description },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...translatedLocales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: urlFor(fallbackLocale),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { locale, post } = Route.useLoaderData();
  const localeHrefs = buildBlogLocalePaths(post.alternateSlugs);

  return (
    <div className="bg-ink-bg text-ink-fg flex min-h-screen flex-col">
      <Header localeHrefs={localeHrefs} />
      <main className="flex-1">
        <header
          data-public-hero
          className="section-ink px-4 py-14 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-4xl">
            <Link
              href="/blog"
              className="touch-target text-ink-muted hover:text-ink-fg inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              <ArrowLeft aria-hidden className="size-4" />
              {m['blog.back_to_blog']()}
            </Link>
            <h1 className="font-display mt-8 text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-ink-muted mt-5 max-w-3xl text-base leading-7 sm:text-lg">
                {post.description}
              </p>
            )}
            <div className="text-ink-muted mt-6 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Calendar aria-hidden className="size-4" />
                {formatPostDate(post.createdAt, locale)}
              </span>
              {(post.authorName || post.authorImage) && (
                <span className="inline-flex items-center gap-2">
                  {post.authorImage && (
                    <img
                      src={post.authorImage}
                      alt={post.authorName || ''}
                      width={20}
                      height={20}
                      loading="lazy"
                      className="size-5 rounded-full object-cover"
                    />
                  )}
                  {post.authorName}
                </span>
              )}
            </div>
          </div>
        </header>

        <section className="section-paper paper-texture px-4 py-12 sm:px-6 sm:py-16">
          <article className="border-paper-line bg-paper-panel mx-auto max-w-4xl rounded-[1.4rem] border p-6 shadow-[0_24px_70px_-48px_rgba(17,17,16,0.55)] sm:p-10 [&_pre]:max-w-full [&_pre]:overflow-x-auto">
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                width={1200}
                height={675}
                loading="lazy"
                className="border-paper-line mb-9 aspect-video w-full rounded-xl border object-cover"
              />
            )}

            <MarkdownContent content={post.content || ''} />
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
