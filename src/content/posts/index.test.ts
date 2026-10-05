import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { buildBlogLocalePaths } from './index';

const serverSource = readFileSync(
  new URL('./server.ts', import.meta.url),
  'utf8'
);
const homeSource = readFileSync(
  new URL('../../routes/index.tsx', import.meta.url),
  'utf8'
);

describe('database-backed bilingual blog', () => {
  it('maps each available translation to its own localized slug', () => {
    expect(
      buildBlogLocalePaths({
        en: 'fine-line-tattoo-guide',
        zh: 'xi-xian-wen-shen-zhi-nan',
      })
    ).toEqual({
      en: '/blog/fine-line-tattoo-guide',
      zh: '/blog/xi-xian-wen-shen-zhi-nan',
    });
  });

  it('falls back to the localized blog index when a translation is missing', () => {
    expect(buildBlogLocalePaths({ en: 'english-only' })).toEqual({
      en: '/blog/english-only',
      zh: '/blog',
    });
  });

  it('removes the bundled template articles', () => {
    for (const slug of [
      'design-a-tattoo-with-ai',
      'tattoo-style-prompt-guide',
    ]) {
      expect(existsSync(new URL(`./${slug}.en.mdx`, import.meta.url))).toBe(
        false
      );
      expect(existsSync(new URL(`./${slug}.zh.mdx`, import.meta.url))).toBe(
        false
      );
    }
  });

  it('passes the requested locale to list and detail queries', () => {
    expect(serverSource).toContain('listPublishedArticles({');
    expect(serverSource).toContain('locale,');
    expect(serverSource).toContain('findPublishedBySlug(slug, locale)');
    expect(serverSource).not.toContain('loadLocalPost');
  });

  it('feeds localized latest posts into the landing page', () => {
    expect(homeSource).toContain(
      "import { getBlogPostsFn } from '@/content/posts/server'"
    );
    expect(homeSource).toMatch(
      /getBlogPostsFn\(\{\s*data: \{ locale, limit: 3 \}/
    );
  });
});
