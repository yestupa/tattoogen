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
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header localeHrefs={localeHrefs} />
      <main className="paper-texture flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <article className="border-border bg-card shadow-soft rounded-shell mx-auto max-w-3xl border p-6 sm:p-10 [&_pre]:max-w-full [&_pre]:overflow-x-auto">
          <Link
            href="/blog"
            className="touch-target text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {m['blog.back_to_blog']()}
          </Link>

          <header className="border-border mt-8 mb-6 border-b pb-6">
            <h1 className="text-foreground font-serif text-3xl leading-tight tracking-tight md:text-4xl">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-muted-foreground mt-3">{post.description}</p>
            )}
            <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-sm">
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
          </header>

          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              width={1200}
              height={675}
              loading="lazy"
              className="border-border mb-8 w-full rounded-lg border object-cover"
            />
          )}

          <MarkdownContent content={post.content || ''} />
        </article>
      </main>
      <Footer />
    </div>
  );
}
