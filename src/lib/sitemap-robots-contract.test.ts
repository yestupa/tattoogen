import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { blogPostPath, isCanonicalPostSlug } from '@/lib/post-slug';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

type PublishedLocale = {
  postId: string;
  locale: 'en' | 'zh';
  slug: string;
  updatedAt: string;
};

function serverRoute(path: string, rows: PublishedLocale[] = []) {
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
      '({ getPublishedLocaleAvailability: publishedQuery })'
    );
  const js = ts.transpile(text, { target: ts.ScriptTarget.ES2022 });
  const getPublishedLocaleAvailability = vi.fn(async () => rows);
  const route = new Function(
    'createFileRoute',
    'envConfigs',
    'baseLocale',
    'locales',
    'localizeUrl',
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
    blogPostPath,
    isCanonicalPostSlug,
    getPublishedLocaleAvailability
  );
  return {
    get: route.server.handlers.GET as () => Promise<Response>,
    getPublishedLocaleAvailability,
  };
}

describe('localized crawling contracts', () => {
  it('lists public routes and only real published article locales', async () => {
    const route = serverRoute('../routes/sitemap[.]xml.ts', [
      {
        postId: 'bilingual',
        locale: 'en',
        slug: 'fine-line-guide',
        updatedAt: '2026-10-02',
      },
      {
        postId: 'bilingual',
        locale: 'zh',
        slug: 'xi-xian-wen-shen',
        updatedAt: '2026-10-03',
      },
      {
        postId: 'english-only',
        locale: 'en',
        slug: 'tattoo-aftercare',
        updatedAt: '2026-10-01',
      },
    ]);
    const response = await route.get();
    const xml = await response.text();
    expect(response.headers.get('Content-Type')).toBe(
      'application/xml; charset=utf-8'
    );
    expect(response.headers.get('Cache-Control')).toContain('must-revalidate');
    expect(route.getPublishedLocaleAvailability).toHaveBeenCalledTimes(1);
    for (const path of [
      '/',
      '/pricing',
      '/womb-tattoo-generator',
      '/fear-god-tattoo-generator',
      '/kaiser-tattoo-generator',
      '/poison-tree-tattoo-generator',
      '/butterfly-tattoo-generator',
      '/blog',
      '/contact',
      '/privacy-policy',
      '/terms-of-service',
    ]) {
      for (const locale of locales) {
        expect(xml).toContain(
          `<loc>${localizeUrl(`https://tattoo.example${path}`, { locale }).href}</loc>`
        );
      }
    }
    expect(xml).toContain('/blog/fine-line-guide');
    expect(xml).toContain('/zh/blog/xi-xian-wen-shen');
    expect(xml).toContain('/blog/tattoo-aftercare');
    expect(xml).not.toContain('/zh/blog/tattoo-aftercare');
    expect(xml).toContain(
      'hreflang="zh" href="https://tattoo.example/zh/blog/xi-xian-wen-shen"'
    );
  });

  it('omits non-canonical published slugs', async () => {
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
        invalid.map((slug, index) => ({
          postId: String(index),
          locale: 'en' as const,
          slug,
          updatedAt: '2026-10-01',
        }))
      ).get()
    ).text();
    for (const slug of invalid) {
      expect(xml).not.toContain(blogPostPath(slug));
    }
  });

  it('keeps static routes when the content database is unavailable', async () => {
    const route = serverRoute('../routes/sitemap[.]xml.ts');
    route.getPublishedLocaleAvailability.mockRejectedValueOnce(
      new Error('offline')
    );
    const xml = await (await route.get()).text();
    expect(xml).toContain('<loc>https://tattoo.example/blog</loc>');
    expect(xml).not.toMatch(/\/blog\/[^<]+/);
  });

  it('disallows private routes with every actual locale prefix', async () => {
    expect(source('../../vite.config.ts')).toContain(
      "['zh', '/zh/:path(.*)?']"
    );
    const body = await (
      await serverRoute('../routes/robots[.]txt.ts').get()
    ).text();
    for (const prefix of ['', '/zh']) {
      for (const path of ['/admin', '/settings', '/api/']) {
        expect(body).toContain(`Disallow: ${prefix}${path}\n`);
      }
    }
    expect(body).toContain('Allow: /\n');
    expect(body).toContain('Sitemap: https://tattoo.example/sitemap.xml');
  });
});
