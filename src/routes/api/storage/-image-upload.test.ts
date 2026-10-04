import { describe, expect, it } from 'vitest';

import { validateImageUpload } from './-image-upload';

const bytes = (...values: number[]) => new Uint8Array(values);

describe('validateImageUpload', () => {
  it.each([
    ['image/jpeg', bytes(0xff, 0xd8, 0xff), 'jpg'],
    ['image/png', bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a), 'png'],
    [
      'image/webp',
      bytes(
        0x52,
        0x49,
        0x46,
        0x46,
        0x00,
        0x00,
        0x00,
        0x00,
        0x57,
        0x45,
        0x42,
        0x50
      ),
      'webp',
    ],
    ['image/gif', new TextEncoder().encode('GIF89a'), 'gif'],
    [
      'image/avif',
      bytes(
        0x00,
        0x00,
        0x00,
        0x18,
        0x66,
        0x74,
        0x79,
        0x70,
        0x61,
        0x76,
        0x69,
        0x66
      ),
      'avif',
    ],
  ])('accepts a valid %s upload', (mimeType, body, extension) => {
    expect(validateImageUpload(mimeType, body, 1024)).toEqual({ extension });
  });

  it('rejects HTML disguised as an image', () => {
    const body = new TextEncoder().encode('<script>alert(1)</script>');

    expect(validateImageUpload('image/png', body, 1024)).toEqual({
      error: 'File content does not match its image type',
    });
  });

  it.each(['image/svg+xml', 'image/x-custom'])('rejects %s', (mimeType) => {
    expect(
      validateImageUpload(
        mimeType,
        new TextEncoder().encode('<svg></svg>'),
        1024
      )
    ).toEqual({ error: 'Unsupported image type' });
  });

  it('rejects content above the configured size limit', () => {
    expect(
      validateImageUpload('image/png', new Uint8Array(1025), 1024)
    ).toEqual({ error: 'Image exceeds the upload size limit' });
  });
});
