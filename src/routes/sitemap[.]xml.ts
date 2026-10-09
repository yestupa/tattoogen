import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { blogPostPath, isCanonicalPostSlug } from '@/lib/post-slug';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';

const STATIC_PATHS = [
  '',
  '/pricing',
  '/womb-tattoo-generator',
  '/fear-god-tattoo-generator',
  '/kaiser-tattoo-generator',
  '/poison-tree-tattoo-generator',
  '/blog',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
];

type Locale = (typeof locales)[number];
type Entry = {
  paths: Partial<Record<Locale, string>>;
  lastModified?: string;
  changeFrequency: string;
  priority: number;
};

function urlFor(path: string, locale: Locale): string {
  return localizeUrl(new URL(path || '/', envConfigs.app_url), { locale }).href;
}

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character]!
  );
}

function entryXml(entry: Entry, locale: Locale): string | null {
  const path = entry.paths[locale];
  if (path === undefined) return null;
  const available = locales.filter((item) => entry.paths[item] !== undefined);
  const fallback =
    entry.paths[baseLocale] !== undefined
      ? baseLocale
      : available[0] || baseLocale;
  const alternates = [
    ...available.map(
      (item) =>
        `    <xhtml:link rel="alternate" hreflang="${item}" href="${escapeXml(urlFor(entry.paths[item]!, item))}"/>`
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(urlFor(entry.paths[fallback]!, fallback))}"/>`,
  ].join('\n');
  return [
    '  <url>',
    `    <loc>${escapeXml(urlFor(path, locale))}</loc>`,
    alternates,
    entry.lastModified
      ? `    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`
      : null,
    `    <changefreq>${entry.changeFrequency}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = STATIC_PATHS.map((path) => ({
          paths: Object.fromEntries(locales.map((locale) => [locale, path])),
          changeFrequency: path === '/blog' ? 'daily' : 'weekly',
          priority: path === '' ? 1 : 0.8,
        }));

        try {
          const { getPublishedLocaleAvailability } =
            await import('@/modules/posts/service');
          const translations = await getPublishedLocaleAvailability();
          const grouped = new Map<string, Entry>();
          for (const item of translations) {
            if (
              (item.locale !== 'en' && item.locale !== 'zh') ||
              !isCanonicalPostSlug(item.slug)
            ) {
              continue;
            }
            const current = grouped.get(item.postId) || {
              paths: {},
              changeFrequency: 'monthly',
              priority: 0.6,
            };
            const locale = item.locale as Locale;
            current.paths[locale] = blogPostPath(item.slug);
            const updated = new Date(item.updatedAt).toISOString();
            if (!current.lastModified || updated > current.lastModified) {
              current.lastModified = updated;
            }
            grouped.set(item.postId, current);
          }
          entries.push(...grouped.values());
        } catch {
          // Static pages remain available when the content database is offline.
        }

        const urls = entries.flatMap((entry) =>
          locales
            .map((locale) => entryXml(entry, locale))
            .filter((value): value is string => Boolean(value))
        );
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...urls,
          '</urlset>',
          '',
        ].join('\n');

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
          },
        });
      },
    },
  },
});
