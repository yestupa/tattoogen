import { readdirSync, readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';

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
      { slug: ' published-story ', createdAt: '2026-10-02' },
      { slug: 'published-story', createdAt: '2026-10-02' },
      { slug: 'local-post', createdAt: '2026-10-01' },
      { slug: '', createdAt: '2026-10-01' },
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

  it('escapes special characters in published article URLs', async () => {
    const xml = await (
      await serverRoute('../routes/sitemap[.]xml.ts', [
        { slug: 'ink&art', createdAt: '2026-10-01' },
      ]).get()
    ).text();
    expect(xml).toContain('/blog/ink&amp;art');
    expect(xml).not.toContain('/blog/ink&art');
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
