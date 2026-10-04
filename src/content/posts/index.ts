export type BlogPost = {
  slug: string;
  locale: 'en' | 'zh';
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
};

export function formatPostDate(dateIso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: locale === 'zh' ? 'long' : 'short',
    day: 'numeric',
  }).format(new Date(dateIso));
}
