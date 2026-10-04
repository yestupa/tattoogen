import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./posts.ts', import.meta.url), 'utf8');

describe('admin post API localization boundary', () => {
  it('passes the complete translation payload through the service boundary', () => {
    expect(source).toContain('postsService.createLocalized');
    expect(source).toContain('postsService.updateLocalized');
    expect(source).toContain('Array.isArray(translations) ? translations : []');
    expect(source).not.toContain('postsService.create({');
  });
});
