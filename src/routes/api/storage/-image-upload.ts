type ImageValidationResult = { extension: string } | { error: string };

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
