import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { m } from '@/paraglide/messages.js';
import { overwriteGetLocale } from '@/paraglide/runtime.js';
import { uploadImageFile } from '@/components/image-uploader';
import { uploadRichTextImage } from '@/components/rich-text-editor';

import { uploadChatImage, uploadChatImages } from './agent';

const file = new File(['png'], 'tattoo.png', { type: 'image/png' });
const serverMessage = 'Invalid image MIME type from server';

function validationFailure() {
  return new Response(JSON.stringify({ code: -1, message: serverMessage }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function errorMessage(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    throw new Error('Expected upload to fail');
  } catch (error) {
    return (error as Error).message;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  overwriteGetLocale(() => 'en');
});

describe.each([
  ['en', 'Upload failed'],
  ['zh', '上传失败'],
] as const)(
  'localized upload validation failures in %s',
  (locale, expected) => {
    it('keeps ImageUploader independent of the server English message', async () => {
      overwriteGetLocale(() => locale);
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => validationFailure())
      );

      const message = await errorMessage(uploadImageFile(file));
      expect(message).toBe(expected);
      expect(message).not.toContain(serverMessage);
    });

    it('keeps the rich editor on its supplied localized label', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => validationFailure())
      );

      const message = await errorMessage(uploadRichTextImage(file, expected));
      expect(message).toBe(expected);
      expect(message).not.toContain(serverMessage);
    });

    it('keeps chat uploads independent of the server English message', async () => {
      overwriteGetLocale(() => locale);
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => validationFailure())
      );

      const message = await errorMessage(uploadChatImage(file));
      expect(message).toBe(expected);
      expect(message).not.toContain(serverMessage);
    });

    it('localizes chat upload HTTP status failures', async () => {
      overwriteGetLocale(() => locale);
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(null, { status: 413 }))
      );

      expect(await errorMessage(uploadChatImage(file))).toBe(
        m['common.upload.failed_status']({ status: 413 }, { locale })
      );
    });
  }
);

it('does not read a server message in any upload-image browser client', () => {
  const sources = [
    new URL('../components/image-uploader.tsx', import.meta.url),
    new URL('../components/rich-text-editor.tsx', import.meta.url),
    new URL('./agent.ts', import.meta.url),
  ];
  for (const url of sources) {
    const source = readFileSync(url, 'utf8');
    expect(source).not.toMatch(/(?:result|data|json)\.message/);
  }
});

describe('ordered batch chat uploads', () => {
  it('sends the source and annotation in one multipart request and keeps URL order', async () => {
    const guide = new File(['guide'], 'guide.png', { type: 'image/png' });
    const fetch = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(
          JSON.stringify({
            code: 0,
            data: { urls: ['/uploads/source.png', '/uploads/guide.png'] },
          }),
          { status: 200 }
        )
    );
    vi.stubGlobal('fetch', fetch);
    expect(await uploadChatImages([file, guide])).toEqual([
      '/uploads/source.png',
      '/uploads/guide.png',
    ]);
    expect(fetch).toHaveBeenCalledTimes(1);
    const body = fetch.mock.calls[0][1]?.body as FormData;
    expect(body.getAll('files').map((part) => (part as File).name)).toEqual([
      'tattoo.png',
      'guide.png',
    ]);
  });

  it('keeps the single image API compatible and skips empty batches', async () => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ code: 0, data: { urls: ['/uploads/source.png'] } }),
          { status: 200 }
        )
    );
    vi.stubGlobal('fetch', fetch);
    expect(await uploadChatImages([])).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
    expect(await uploadChatImage(file)).toBe('/uploads/source.png');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    { urls: ['/uploads/only-one.png'] },
    { urls: ['/uploads/source.png', 42] },
    { urls: ['/uploads/source.png', ''] },
  ])('rejects partial or malformed batch responses', async (data) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ code: 0, data }), { status: 200 })
      )
    );
    expect(await errorMessage(uploadChatImages([file, file]))).toBe(
      'Upload failed'
    );
  });

  it('rejects unsupported files and batches above the server count before requesting', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(
      uploadChatImages(Array.from({ length: 10 }, () => file))
    ).rejects.toThrow('Upload failed');
    await expect(
      uploadChatImages([
        new File(['svg'], 'bad.svg', { type: 'image/svg+xml' }),
      ])
    ).rejects.toThrow('Upload failed');
    expect(fetch).not.toHaveBeenCalled();
  });
});
