import { createServerFn } from '@tanstack/react-start';

import { isCanonicalPostSlug, normalizePostSlug } from '@/lib/post-slug';

import type { BlogPost, BlogPostDetail } from './index';

function normalizeLocale(locale: string): 'en' | 'zh' {
  return locale === 'zh' ? 'zh' : 'en';
}

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
      const { findPublishedBySlug } = await import('@/modules/posts/service');
      const locale = normalizeLocale(data.locale);
      const row = await findPublishedBySlug(slug, locale);
      if (!row) return null;
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
      };
    } catch {
      return null;
    }
  });
