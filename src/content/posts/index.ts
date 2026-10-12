import { blogPostPath, isCanonicalPostSlug } from '@/lib/post-slug';

export type BlogLocale = 'en' | 'zh';

export function publishedBlogLocales(
  rows: ReadonlyArray<{ locale: string; slug: string }>
): BlogLocale[] {
  const available = new Set(
    rows.filter((row) => isCanonicalPostSlug(row.slug)).map((row) => row.locale)
  );
  return (['en', 'zh'] as const).filter((locale) => available.has(locale));
}

export type BlogPost = {
  slug: string;
  locale: BlogLocale;
  title: string;
  description: string;
  image?: string;
  createdAt: string;
  authorName?: string;
  authorImage?: string;
  source: 'db';
};

export type BlogPostDetail = BlogPost & {
  content: string;
  alternateSlugs: Partial<Record<BlogLocale, string>>;
};

export function buildBlogLocalePaths(
  alternateSlugs: Partial<Record<BlogLocale, string>>
): Record<BlogLocale, string> {
  return {
    en: alternateSlugs.en ? blogPostPath(alternateSlugs.en) : '/blog',
    zh: alternateSlugs.zh ? blogPostPath(alternateSlugs.zh) : '/blog',
  };
}

export function formatPostDate(dateIso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: locale === 'zh' ? 'long' : 'short',
    day: 'numeric',
  }).format(new Date(dateIso));
}
