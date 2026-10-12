import { createServerFn } from '@tanstack/react-start';

import { isCanonicalPostSlug, normalizePostSlug } from '@/lib/post-slug';

import {
  publishedBlogLocales,
  type BlogLocale,
  type BlogPost,
  type BlogPostDetail,
} from './index';

function normalizeLocale(locale: string): 'en' | 'zh' {
  return locale === 'zh' ? 'zh' : 'en';
}

export const getBlogLocaleAvailabilityFn = createServerFn().handler(
  async (): Promise<{ locales: BlogLocale[]; known: boolean }> => {
    try {
      const { getPublishedLocaleAvailability } =
        await import('@/modules/posts/service');
      return {
        locales: publishedBlogLocales(await getPublishedLocaleAvailability()),
        known: true,
      };
    } catch {
      return { locales: ['en', 'zh'], known: false };
    }
  }
);

export const getBlogPostsFn = createServerFn()
  .inputValidator((data: { locale: string; limit?: number }) => data)
  .handler(async ({ data }): Promise<BlogPost[]> => {
    try {
      const { listPublishedArticles } = await import('@/modules/posts/service');
      const locale = normalizeLocale(data.locale);
      const rows = await listPublishedArticles({
        locale,
        limit: data.limit ?? 100,
      });
      return rows
        .filter((row) => isCanonicalPostSlug(row.slug))
        .map((row) => ({
          slug: row.slug,
          locale,
          title: row.title || row.slug,
          description: row.description || '',
          image: row.image || undefined,
          createdAt: new Date(row.createdAt || Date.now()).toISOString(),
          authorName: row.authorName || undefined,
          authorImage: row.authorImage || undefined,
          source: 'db' as const,
        }));
    } catch {
      return [];
    }
  });

export const getBlogPostFn = createServerFn()
  .inputValidator((data: { slug: string; locale: string }) => data)
  .handler(async ({ data }): Promise<BlogPostDetail | null> => {
    const slug = normalizePostSlug(data.slug);
    if (!isCanonicalPostSlug(slug)) return null;
    try {
      const { findPublishedBySlug, getPublishedTranslationSlugs } =
        await import('@/modules/posts/service');
      const locale = normalizeLocale(data.locale);
      const row = await findPublishedBySlug(slug, locale);
      if (!row) return null;
      const translated = await getPublishedTranslationSlugs(row.id);
      return {
        slug: row.slug,
        locale,
        title: row.title || row.slug,
        description: row.description || '',
        image: row.image || undefined,
        createdAt: new Date(row.publishedAt || row.createdAt).toISOString(),
        authorName: row.authorName || undefined,
        authorImage: row.authorImage || undefined,
        source: 'db',
        content: row.content || '',
        alternateSlugs: Object.fromEntries(
          translated.map((item) => [item.locale, item.slug])
        ),
      };
    } catch {
      return null;
    }
  });
