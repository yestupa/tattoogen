import { describe, expect, it, vi } from 'vitest';

import {
  ImageUploadRequestError,
  parseBoundedMultipartFormData,
  prepareImageUploads,
  uploadErrorResponse,
  validateImageUpload,
} from './-image-upload';

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

const png = () =>
  new File(
    [bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)],
    'image.png',
    { type: 'image/png' }
  );

describe('parseBoundedMultipartFormData', () => {
  it('rejects an oversized Content-Length before reading the body', async () => {
    let bodyRead = false;
    const body = new ReadableStream<Uint8Array>(
      {
        pull(controller) {
          bodyRead = true;
          controller.enqueue(bytes(1));
        },
      },
      { highWaterMark: 0 }
    );
    const request = new Request('http://localhost/api/storage/upload-image', {
      method: 'POST',
      headers: {
        'content-length': '101',
        'content-type': 'multipart/form-data; boundary=test',
      },
      body,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    await expect(parseBoundedMultipartFormData(request, 100)).rejects.toThrow(
      ImageUploadRequestError
    );
    expect(bodyRead).toBe(false);
  });

  it('aborts a chunked body as soon as the streamed bytes exceed the limit', async () => {
    let canceled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes(1, 2, 3, 4, 5, 6));
        controller.enqueue(bytes(7, 8, 9, 10, 11, 12));
      },
      cancel() {
        canceled = true;
      },
    });
    const request = new Request('http://localhost/api/storage/upload-image', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=test' },
      body,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    expect(request.headers.has('content-length')).toBe(false);
    await expect(parseBoundedMultipartFormData(request, 10)).rejects.toThrow(
      ImageUploadRequestError
    );
    expect(canceled).toBe(true);
  });

  it('parses standard browser FormData with multiple files', async () => {
    const formData = new FormData();
    formData.append('files', png());
    formData.append(
      'files',
      new File([new TextEncoder().encode('GIF89a')], 'image.gif', {
        type: 'image/gif',
      })
    );
    const request = new Request('http://localhost/api/storage/upload-image', {
      method: 'POST',
      body: formData,
    });

    const parsed = await parseBoundedMultipartFormData(request, 4096);
    const uploads = await prepareImageUploads(parsed, {
      maxFiles: 2,
      maxFileBytes: 1024,
      maxAggregateBytes: 2048,
    });

    expect(
      uploads.map(({ file, extension }) => [file.name, extension])
    ).toEqual([
      ['image.png', 'png'],
      ['image.gif', 'gif'],
    ]);
  });
});

describe('prepareImageUploads', () => {
  it('rejects more files than the configured maximum', async () => {
    const formData = new FormData();
    formData.append('files', png());
    formData.append('files', png());
    formData.append('files', png());

    await expect(
      prepareImageUploads(formData, {
        maxFiles: 2,
        maxFileBytes: 1024,
        maxAggregateBytes: 2048,
      })
    ).rejects.toThrow('Too many images');
  });

  it('rejects files whose aggregate bytes exceed the configured maximum', async () => {
    const formData = new FormData();
    formData.append('files', png());
    formData.append('files', png());

    await expect(
      prepareImageUploads(formData, {
        maxFiles: 2,
        maxFileBytes: 1024,
        maxAggregateBytes: 15,
      })
    ).rejects.toThrow('Combined images exceed the upload size limit');
  });
});

describe('uploadErrorResponse', () => {
  it('logs unexpected details but returns a generic client error', async () => {
    const error = new Error('private storage path failed');
    const logger = vi.fn();

    const response = uploadErrorResponse(error, logger);

    expect(await response.json()).toEqual({
      code: -1,
      message: 'Upload failed',
    });
    expect(logger).toHaveBeenCalledWith('upload image failed:', error);
  });
});
