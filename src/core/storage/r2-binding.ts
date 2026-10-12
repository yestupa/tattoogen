import type {
  StorageDownloadUploadOptions,
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
} from '.';

type R2ObjectBody = {
  body: ReadableStream<Uint8Array>;
  httpMetadata?: { contentType?: string };
};

export type R2Binding = {
  get(key: string): Promise<R2ObjectBody | null>;
  head(key: string): Promise<unknown | null>;
  put(
    key: string,
    body: Uint8Array,
    options: {
      httpMetadata: { contentType: string; contentDisposition: string };
    }
  ): Promise<unknown>;
};

const MEDIA_PREFIX = '/api/storage/media/';
const UPLOAD_PREFIX = 'uploads/';
const SAFE_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function safeObjectKey(key: string): boolean {
  return (
    key.length > 0 &&
    key.length <= 512 &&
    /^[a-zA-Z0-9/_.-]+$/.test(key) &&
    key.split('/').every((part) => part !== '' && part !== '.' && part !== '..')
  );
}

export function getR2Binding(): R2Binding | null {
  const globals = globalThis as typeof globalThis & {
    __CF_ENV__?: { IMAGES?: R2Binding };
    __env__?: { IMAGES?: R2Binding };
  };
  return globals.__CF_ENV__?.IMAGES ?? globals.__env__?.IMAGES ?? null;
}

export class R2BindingProvider implements StorageProvider {
  readonly name = 'r2-binding';
  readonly configs = {};

  constructor(
    private readonly bucket: R2Binding,
    private readonly publicBaseUrl: string
  ) {}

  getPublicUrl = ({ key }: { key: string; bucket?: string }): string => {
    if (!safeObjectKey(key)) throw new Error('Invalid image storage key');
    const origin = new URL(this.publicBaseUrl).origin;
    return `${origin}${MEDIA_PREFIX}${UPLOAD_PREFIX}${key}`;
  };

  exists = ({ key }: { key: string; bucket?: string }): Promise<boolean> => {
    if (!safeObjectKey(key)) return Promise.resolve(false);
    return this.bucket.head(`${UPLOAD_PREFIX}${key}`).then(Boolean);
  };

  async uploadFile(
    options: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    if (!safeObjectKey(options.key)) {
      return {
        success: false,
        error: 'Invalid image storage key',
        provider: this.name,
      };
    }
    if (!options.contentType || !SAFE_IMAGE_TYPES.has(options.contentType)) {
      return {
        success: false,
        error: 'Unsupported image content type',
        provider: this.name,
      };
    }
    try {
      await this.bucket.put(`${UPLOAD_PREFIX}${options.key}`, options.body, {
        httpMetadata: {
          contentType: options.contentType || 'application/octet-stream',
          contentDisposition: options.disposition || 'inline',
        },
      });
      return {
        success: true,
        key: options.key,
        url: this.getPublicUrl({ key: options.key }),
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image upload failed',
        provider: this.name,
      };
    }
  }

  async downloadAndUpload(
    options: StorageDownloadUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const response = await fetch(options.url);
      if (!response.ok)
        throw new Error(`Image download failed: ${response.status}`);
      return this.uploadFile({
        key: options.key,
        body: new Uint8Array(await response.arrayBuffer()),
        contentType:
          options.contentType ||
          response.headers.get('content-type') ||
          undefined,
        disposition: options.disposition,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image download failed',
        provider: this.name,
      };
    }
  }
}

export async function serveR2Media(
  request: Request,
  bucket: R2Binding
): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith(MEDIA_PREFIX))
    return new Response('Invalid path', { status: 400 });
  let key: string;
  try {
    key = decodeURIComponent(pathname.slice(MEDIA_PREFIX.length));
  } catch {
    return new Response('Invalid path', { status: 400 });
  }
  if (!key.startsWith(UPLOAD_PREFIX) || !safeObjectKey(key)) {
    return new Response('Invalid path', { status: 400 });
  }
  const object = await bucket.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const contentType =
    object.httpMetadata?.contentType || 'application/octet-stream';
  if (!SAFE_IMAGE_TYPES.has(contentType)) {
    return new Response('Unsupported image', { status: 415 });
  }
  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
