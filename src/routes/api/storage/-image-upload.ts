import { respErr } from '@/lib/resp';

type ImageValidationResult = { extension: string } | { error: string };

export type PreparedImageUpload = {
  file: File;
  body: Uint8Array;
  extension: string;
};

export type ImageUploadLimits = {
  maxFiles: number;
  maxFileBytes: number;
  maxAggregateBytes: number;
};

export class ImageUploadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadRequestError';
  }
}

type ImageType = {
  extension: string;
  matches: (body: Uint8Array) => boolean;
};

const startsWith = (body: Uint8Array, signature: number[]) =>
  signature.every((byte, index) => body[index] === byte);

const asciiAt = (body: Uint8Array, offset: number, value: string) =>
  [...value].every(
    (character, index) => body[offset + index] === character.charCodeAt(0)
  );

const imageTypes: Record<string, ImageType> = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (body) => startsWith(body, [0xff, 0xd8, 0xff]),
  },
  'image/png': {
    extension: 'png',
    matches: (body) =>
      startsWith(body, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  'image/webp': {
    extension: 'webp',
    matches: (body) => asciiAt(body, 0, 'RIFF') && asciiAt(body, 8, 'WEBP'),
  },
  'image/gif': {
    extension: 'gif',
    matches: (body) => asciiAt(body, 0, 'GIF87a') || asciiAt(body, 0, 'GIF89a'),
  },
  'image/avif': {
    extension: 'avif',
    matches: (body) =>
      asciiAt(body, 4, 'ftyp') &&
      (asciiAt(body, 8, 'avif') || asciiAt(body, 8, 'avis')),
  },
};

export function validateImageUpload(
  mimeType: string,
  body: Uint8Array,
  maxBytes: number
): ImageValidationResult {
  if (body.byteLength > maxBytes) {
    return { error: 'Image exceeds the upload size limit' };
  }

  const imageType = imageTypes[mimeType.toLowerCase()];
  if (!imageType) {
    return { error: 'Unsupported image type' };
  }

  if (!imageType.matches(body)) {
    return { error: 'File content does not match its image type' };
  }

  return { extension: imageType.extension };
}

export async function parseBoundedMultipartFormData(
  request: Request,
  maxBytes: number
): Promise<FormData> {
  const contentType = request.headers.get('content-type')?.toLowerCase();
  if (!contentType?.startsWith('multipart/form-data;')) {
    throw new ImageUploadRequestError('Invalid multipart upload');
  }

  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
      throw new ImageUploadRequestError('Invalid multipart upload');
    }
    if (contentLength > maxBytes) {
      throw new ImageUploadRequestError(
        'Upload request exceeds the size limit'
      );
    }
  }

  if (!request.body) {
    throw new ImageUploadRequestError('Invalid multipart upload');
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // The size error below is still the client-facing result.
        }
        throw new ImageUploadRequestError(
          'Upload request exceeds the size limit'
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const headers = new Headers(request.headers);
  headers.delete('content-length');
  const boundedRequest = new Request(request.url, {
    method: request.method,
    headers,
    body,
  });

  try {
    return await boundedRequest.formData();
  } catch {
    throw new ImageUploadRequestError('Invalid multipart upload');
  }
}

export async function prepareImageUploads(
  formData: FormData,
  limits: ImageUploadLimits
): Promise<PreparedImageUpload[]> {
  const values = formData.getAll('files');
  if (!values.length) {
    throw new ImageUploadRequestError('No files provided');
  }
  if (values.length > limits.maxFiles) {
    throw new ImageUploadRequestError('Too many images');
  }

  const files: File[] = [];
  let aggregateBytes = 0;
  for (const value of values) {
    if (!(value instanceof File)) {
      throw new ImageUploadRequestError('Invalid image upload');
    }
    if (value.size > limits.maxFileBytes) {
      throw new ImageUploadRequestError('Image exceeds the upload size limit');
    }

    aggregateBytes += value.size;
    if (aggregateBytes > limits.maxAggregateBytes) {
      throw new ImageUploadRequestError(
        'Combined images exceed the upload size limit'
      );
    }
    files.push(value);
  }

  return Promise.all(
    files.map(async (file) => {
      const body = new Uint8Array(await file.arrayBuffer());
      const validation = validateImageUpload(
        file.type,
        body,
        limits.maxFileBytes
      );
      if ('error' in validation) {
        throw new ImageUploadRequestError(validation.error);
      }
      return { file, body, extension: validation.extension };
    })
  );
}

export function uploadErrorResponse(
  error: unknown,
  logger: (...args: unknown[]) => void = console.error
): Response {
  if (error instanceof ImageUploadRequestError) {
    return respErr(error.message);
  }

  logger('upload image failed:', error);
  return respErr('Upload failed');
}

export function storageUploadFailureResponse(
  result: { provider?: string; error?: string },
  key: string,
  logger: (...args: unknown[]) => void = console.error
): Response {
  logger('storage upload failed:', {
    provider: result.provider || 'unknown',
    key,
    error: result.error || 'Storage provider returned no upload URL',
  });
  return respErr('Upload failed');
}
