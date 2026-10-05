import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  blogPostPath,
  isCanonicalPostSlug,
  normalizePostSlug,
  requirePostSlug,
} from './post-slug';

describe('post slug contract', () => {
  it('normalizes surrounding whitespace and ASCII case', () => {
    expect(normalizePostSlug('  Tattoo-Style-101  ')).toBe('tattoo-style-101');
    expect(requirePostSlug('  Tattoo-Style-101  ')).toBe('tattoo-style-101');
  });

  it.each([
    '',
    '-',
    '-tattoo',
    'tattoo-',
    'tattoo--style',
    'tattoo style',
    'tattoo/style',
    'tattoo?style',
    'tattoo#style',
    '100%tattoo',
    '纹身',
  ])('rejects the non-canonical slug %j', (slug) => {
    expect(isCanonicalPostSlug(slug)).toBe(false);
    expect(() => requirePostSlug(slug)).toThrow('Invalid post slug');
  });

  it('accepts lowercase ASCII words separated by single hyphens', () => {
    expect(isCanonicalPostSlug('tattoo-style-101')).toBe(true);
    expect(requirePostSlug('tattoo-style-101')).toBe('tattoo-style-101');
  });

  it('encodes any defensive fallback value as exactly one path segment', () => {
    const path = blogPostPath('ink/art?#% 纹身');
    expect(path).toBe('/blog/ink%2Fart%3F%23%25%20%E7%BA%B9%E8%BA%AB');
    expect(path.slice('/blog/'.length)).not.toContain('/');
  });

  it.each([
    ['../blocks/blog.tsx', 'blogPostPath(post.slug)'],
    ['../routes/blog/index.tsx', 'blogPostPath(post.slug)'],
    ['../routes/blog/$slug.tsx', 'blogPostPath(slug)'],
    ['../routes/sitemap[.]xml.ts', 'blogPostPath(item.slug)'],
    ['../routes/llms[.]txt.ts', 'blogPostPath(post.slug)'],
    ['../routes/llms-full[.]txt.ts', 'blogPostPath(post.slug)'],
  ])('uses the shared encoded path in %s', (path, call) => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    expect(source).toContain("from '@/lib/post-slug'");
    expect(source).toContain(call);
  });
});
