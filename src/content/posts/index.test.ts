import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const postsDir = fileURLToPath(new URL('.', import.meta.url));
const indexSource = readFileSync(
  new URL('./index.ts', import.meta.url),
  'utf8'
);
const homeSource = readFileSync(
  new URL('../../routes/index.tsx', import.meta.url),
  'utf8'
);
const productSlugs = ['design-a-tattoo-with-ai', 'tattoo-style-prompt-guide'];

describe('bundled product blog posts', () => {
  it('uses tattoo-specific public slugs', () => {
    for (const slug of productSlugs) {
      expect(indexSource).toContain(`'${slug}'`);
    }
    expect(indexSource).not.toMatch(/what-is-shipany|blocks-vs-components/);
  });

  it.each([
    ['en', /tattoo/i],
    ['zh', /纹身/],
  ])('keeps %s metadata focused on the tattoo product', (locale, topic) => {
    for (const slug of productSlugs) {
      const path = `${postsDir}${slug}.${locale}.mdx`;
      expect(existsSync(path)).toBe(true);
      const source = readFileSync(path, 'utf8');
      expect(source).toMatch(topic);
      expect(source).not.toMatch(/ShipAny|blocks? vs components?/i);
    }
  });

  it('feeds the latest posts into the landing-page cards', () => {
    expect(homeSource).toContain(
      "import { getBlogPostsFn } from '@/content/posts/server'"
    );
    expect(homeSource).toMatch(
      /getBlogPostsFn\(\{\s*data: \{ locale, limit: 3 \}/
    );
    expect(homeSource).toContain('<Blog posts={posts} />');
  });
});
