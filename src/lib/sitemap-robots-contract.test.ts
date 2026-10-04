import { readdirSync, readFileSync } from 'node:fs';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { getTableConfig } from 'drizzle-orm/sqlite-core';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { post } from '@/config/db/schema';
import { findPublishedBySlug } from '@/modules/posts/service';
import { blogPostPath, isCanonicalPostSlug } from '@/lib/post-slug';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';

const fixture = vi.hoisted(() => ({
  db: undefined as unknown as ReturnType<typeof drizzle>,
}));
vi.mock('@/core/db', () => ({ db: () => fixture.db }));

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

function serverRoute(
  path: string,
  rows: { slug: string; createdAt: string }[] = []
) {
  const ast = ts.createSourceFile(
    path,
    source(path),
    ts.ScriptTarget.Latest,
    true
  );
  const text = ast.statements
    .filter((node) => !ts.isImportDeclaration(node))
    .map((node) => node.getText(ast).replace(/^export /, ''))
    .join('\n')
    .replace(
      /await\s+import\('@\/modules\/posts\/service'\)/,
      '({ listPublishedArticles: publishedQuery })'
    );
  const js = ts.transpile(text, { target: ts.ScriptTarget.ES2022 });
  const listPublishedArticles = vi.fn(async () => rows);
  const route = new Function(
    'createFileRoute',
    'envConfigs',
    'baseLocale',
    'locales',
    'localizeUrl',
    'getLocalPosts',
    'mergePosts',
    'blogPostPath',
    'isCanonicalPostSlug',
    'publishedQuery',
    `${js}\nreturn Route;`
  )(
    () => (options: object) => options,
    { app_url: 'https://tattoo.example' },
    baseLocale,
    locales,
    localizeUrl,
    () => [{ slug: 'local-post', createdAt: '2026-10-01T00:00:00.000Z' }],
    (db: object[], local: object[]) => [...db, ...local],
    blogPostPath,
    isCanonicalPostSlug,
    listPublishedArticles
  );
  return {
    get: route.server.handlers.GET as () => Promise<Response>,
    listPublishedArticles,
  };
}

describe('localized crawling contracts', () => {
  it('lists each public static route and every published/local article once per locale', async () => {
    const route = serverRoute('../routes/sitemap[.]xml.ts', [
      { slug: ' published-story', createdAt: '2026-10-02' },
      { slug: 'published-story ', createdAt: '2026-10-02' },
      { slug: 'published-story', createdAt: '2026-10-02' },
      { slug: 'local-post', createdAt: '2026-10-01' },
      { slug: '', createdAt: '2026-10-01' },
      { slug: '   ', createdAt: '2026-10-01' },
    ]);
    const response = await route.get();
    const xml = await response.text();
    expect(response.headers.get('Content-Type')).toBe('application/xml');
    expect(route.listPublishedArticles).toHaveBeenCalledExactlyOnceWith();
    const staticRoutes = [
      '/',
      '/pricing',
      '/blog',
      ...readdirSync(new URL('../routes/(pages)/', import.meta.url))
        .filter(
          (name) =>
            name.endsWith('.tsx') &&
            !name.startsWith('-') &&
            name !== 'route.tsx'
        )
        .map((name) => `/${name.slice(0, -4)}`),
    ];
    const paths = [
      ...staticRoutes,
      '/blog/published-story',
      '/blog/local-post',
    ];
    const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
      (match) => match[1]
    );
    expect(entries).toHaveLength(paths.length * locales.length);
    for (const path of paths) {
      for (const locale of locales) {
        const loc = localizeUrl(`https://tattoo.example${path}`, {
          locale,
        }).href;
        const matches = entries.filter((entry) =>
          entry.includes(`<loc>${loc}</loc>`)
        );
        expect(matches, loc).toHaveLength(1);
        for (const alternate of [...locales, 'x-default']) {
          const href = localizeUrl(`https://tattoo.example${path}`, {
            locale:
              alternate === 'x-default'
                ? baseLocale
                : (alternate as typeof baseLocale),
          }).href;
          expect(matches[0]).toContain(
            `hreflang="${alternate}" href="${href}"`
          );
        }
      }
    }
  });

  it('omits non-canonical published article slugs', async () => {
    const invalid = [
      'ink?art',
      'ink#art',
      '100%ink',
      'ink/art',
      'ink art',
      'ink--art',
      '纹身',
    ];
    const xml = await (
      await serverRoute(
        '../routes/sitemap[.]xml.ts',
        invalid.map((slug) => ({ slug, createdAt: '2026-10-01' }))
      ).get()
    ).text();
    for (const slug of invalid) {
      expect(xml).not.toContain(blogPostPath(slug));
    }
    expect(xml).toContain('/blog/local-post');
  });

  it('round-trips every canonical published loc through the real published query', async () => {
    const client = createClient({ url: 'file::memory:' });
    fixture.db = drizzle(client);
    try {
      const columns = getTableConfig(post).columns.map(
        (column) => `"${column.name}" ${column.getSQLType()}`
      );
      await client.execute(`CREATE TABLE "post" (${columns.join(', ')})`);
      const slugs = ['story', 'fine-line', '100-ink', 'local-post'];
      for (const [index, slug] of slugs.entries()) {
        await client.execute({
          sql: 'INSERT INTO "post" (id, slug, status) VALUES (?, ?, ?)',
          args: [`fixture-${index}`, slug, 'published'],
        });
      }
      expect((await findPublishedBySlug('  FINE-LINE  '))?.id).toBe(
        'fixture-1'
      );
      const route = serverRoute('../routes/sitemap[.]xml.ts', [
        ...slugs.map((slug) => ({ slug, createdAt: '2026-10-02' })),
        { slug: 'story', createdAt: '2026-10-02' },
        { slug: 'ink/art', createdAt: '2026-10-02' },
        { slug: 'ink?art', createdAt: '2026-10-02' },
        { slug: 'ink#art', createdAt: '2026-10-02' },
        { slug: '100%ink', createdAt: '2026-10-02' },
        { slug: 'ink art', createdAt: '2026-10-02' },
        { slug: 'ink--art', createdAt: '2026-10-02' },
        { slug: '纹身', createdAt: '2026-10-02' },
      ]);
      const xml = await (await route.get()).text();
      const dynamic = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((match) => new URL(match[1]))
        .filter((url) => /\/blog\//.test(url.pathname));
      for (const url of dynamic) {
        const segment = url.pathname.replace(/^\/(?:zh\/)?blog\//, '');
        expect(segment).not.toContain('/');
        expect(url.search).toBe('');
        expect(url.hash).toBe('');
        const storedSlug = decodeURIComponent(segment);
        const article = await findPublishedBySlug(storedSlug);
        expect(article, url.href).toBeDefined();
        expect(article?.slug, url.href).toBe(storedSlug);
        expect(article?.id).toBe(`fixture-${slugs.indexOf(storedSlug)}`);
      }
      expect(dynamic).toHaveLength(slugs.length * locales.length);
      for (const slug of slugs) {
        expect(
          dynamic.filter((url) => url.pathname.endsWith(blogPostPath(slug)))
        ).toHaveLength(locales.length);
      }
    } finally {
      client.close();
    }
  });

  it('keeps the published-query fallback and local articles when the database is unavailable', async () => {
    const route = serverRoute('../routes/sitemap[.]xml.ts');
    route.listPublishedArticles.mockRejectedValueOnce(new Error('offline'));
    expect(await (await route.get()).text()).toContain('/blog/local-post');
  });

  it('disallows private routes with every actual locale prefix', async () => {
    expect(source('../../vite.config.ts')).toContain(
      "['zh', '/zh/:path(.*)?']"
    );
    const body = await (
      await serverRoute('../routes/robots[.]txt.ts').get()
    ).text();
    for (const prefix of ['', '/zh'])
      for (const path of ['/admin', '/settings', '/api/'])
        expect(body).toContain(`Disallow: ${prefix}${path}\n`);
    expect(body).toContain('Allow: /\n');
    expect(body).toContain('Sitemap: https://tattoo.example/sitemap.xml');
  });
});
