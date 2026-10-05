import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./service.ts', import.meta.url), 'utf8');

describe('published blog visibility', () => {
  it('requires both the shared post and localized translation to be published', () => {
    expect(
      source.match(/eq\(post\.status, PostStatus\.PUBLISHED\)/g)
    ).toHaveLength(3);
  });

  it('archives translations when an administrator removes a post', () => {
    expect(source).toMatch(
      /function remove[\s\S]*update\(postTranslation\)[\s\S]*status: PostStatus\.ARCHIVED/
    );
  });
});
