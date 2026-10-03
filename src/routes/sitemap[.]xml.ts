import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { getLocalPosts, mergePosts } from '@/content/posts';

const STATIC_PATHS = [
  '',
  '/pricing',
  '/blog',
  '/privacy-policy',
  '/terms-of-service',
];

type Entry = {
  path: string;
  lastModified?: string;
  changeFrequency: string;
  priority: number;
};

function urlFor(path: string, locale: string): string {
  return localizeUrl(new URL(path || '/', envConfigs.app_url), {
    locale: locale as (typeof locales)[number],
  }).href;
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

function isAddressableSlug(slug: string): boolean {
  // The current route rewrite drops trailing whitespace, making those URLs
  // ambiguous. Omit them without changing persisted slugs or article queries.
  return slug.trim().length > 0 && slug === slug.trimEnd();
}

function entryXml(e: Entry, locale: (typeof locales)[number]): string {
  const alternates = [...locales, 'x-default']
    .map(
      (loc) =>
        `    <xhtml:link rel="alternate" hreflang="${loc}" href="${escapeXml(urlFor(e.path, loc === 'x-default' ? baseLocale : loc))}"/>`
    )
    .join('\n');
  return [
    '  <url>',
    `    <loc>${escapeXml(urlFor(e.path, locale))}</loc>`,
    alternates,
    e.lastModified
      ? `    <lastmod>${escapeXml(e.lastModified)}</lastmod>`
      : null,
    `    <changefreq>${e.changeFrequency}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
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
          path,
          changeFrequency: path === '/blog' ? 'daily' : 'weekly',
          priority: path === '' ? 1 : 0.8,
        }));

        // Blog posts: db posts merged with local MDX posts.
        try {
          const { listPublishedArticles } =
            await import('@/modules/posts/service');
          const rows = await listPublishedArticles().catch(() => []);
          const dbPosts = rows
            .filter((row) => isAddressableSlug(row.slug))
            .map((row) => ({
              slug: row.slug,
              title: row.title || row.slug,
              description: row.description || '',
              createdAt: new Date(row.createdAt).toISOString(),
              source: 'db' as const,
            }));
          const posts = mergePosts(dbPosts, getLocalPosts(baseLocale));
          for (const post of posts) {
            if (!isAddressableSlug(post.slug)) continue;
            entries.push({
              path: `/blog/${encodeURIComponent(post.slug)}`,
              lastModified: post.createdAt,
              changeFrequency: 'monthly',
              priority: 0.6,
            });
          }
        } catch {
          // Database unreachable — static paths + local posts still listed.
          for (const post of getLocalPosts(baseLocale)) {
            if (!isAddressableSlug(post.slug)) continue;
            entries.push({
              path: `/blog/${encodeURIComponent(post.slug)}`,
              lastModified: post.createdAt,
              changeFrequency: 'monthly',
              priority: 0.6,
            });
          }
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...Array.from(
            new Map(
              entries
                .filter((entry) => entry.path !== '/blog/')
                .map((entry) => [entry.path, entry])
            ).values()
          ).flatMap((entry) =>
            locales.map((locale) => entryXml(entry, locale))
          ),
          '</urlset>',
          '',
        ].join('\n');

        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml' },
        });
      },
    },
  },
});
