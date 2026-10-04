import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const uploaderSource = readSource('./image-uploader.tsx');

describe('ImageUploader upload-size contract', () => {
  it('defaults to the server default of 2 MiB', () => {
    expect(uploaderSource).toMatch(/maxSizeMB\s*=\s*2[,\n]/);
  });

  it.each([
    ['support widget', '../blocks/support-widget.tsx'],
    ['user ticket forms', '../routes/settings/tickets.tsx'],
    ['admin ticket reply', '../routes/admin/tickets.tsx'],
  ])('%s relies on the shared 2 MiB default', (_name, relativePath) => {
    const source = readSource(relativePath);
    const uploaderCalls = source.match(/<ImageUploader\b[\s\S]*?\/>/g) ?? [];

    expect(uploaderCalls.length).toBeGreaterThan(0);
    for (const call of uploaderCalls) {
      expect(call).not.toContain('maxSizeMB=');
    }
  });
});
