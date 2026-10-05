import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  new URL('./posts/translate.ts', import.meta.url),
  'utf8'
);
const editorSource = readFileSync(
  new URL('../../admin/posts.tsx', import.meta.url),
  'utf8'
);

describe('admin post translation FastClaw flow', () => {
  it('provisions the admin mapping before starting the agent request', () => {
    const provision = source.indexOf('ensureFastClawUser({');
    const request = source.indexOf('createFastClawRequest({');

    expect(provision).toBeGreaterThan(-1);
    expect(request).toBeGreaterThan(provision);
  });

  it('fills a safe Chinese slug when the translated draft has none', () => {
    expect(editorSource).toContain("form.setFieldValue('zhSlug'");
    expect(editorSource).toContain('values.enSlug');
  });
});
