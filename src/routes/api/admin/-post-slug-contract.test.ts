import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./posts.ts', import.meta.url), 'utf8');

describe('admin post API slug boundary', () => {
  it('validates and normalizes create and update slugs before the service call', () => {
    expect(source).toContain(
      "import { requirePostSlug } from '@/lib/post-slug'"
    );
    expect(source).toContain('const normalizedSlug = requirePostSlug(slug)');
    expect(source).toContain(
      'slug === undefined ? undefined : requirePostSlug(slug)'
    );
    expect(source.match(/slug: normalizedSlug/g)).toHaveLength(2);
  });
});
