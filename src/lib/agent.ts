import { m } from '@/paraglide/messages.js';

// Mint a new chat session id in the `s-<ts_ms>-<rand6>` format
// (e.g. `s-1777280106721-q5mzjc`). The same id is used as the chat row id,
// the open-agent-sdk session id, and the per-session workspace directory
// name, so it must stay filesystem- and URL-safe.
export function newAgentSessionId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `s-${ts}-${rand}`;
}

export function isAgentSessionId(value: string): boolean {
  return /^s-\d{10,}-[a-z0-9]{4,}$/.test(value);
}

/** An image the user attached to a composer, tracked through its upload. */
export interface PendingAttachment {
  id: string;
  name: string;
  /** Object URL while uploading, remote URL once uploaded. */
  preview: string;
  url?: string;
  status: 'uploading' | 'uploaded' | 'error';
  /** A marked-up copy that explains how its paired source image should change. */
  kind?: 'source' | 'annotation';
  error?: string;
}

export function newAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Upload one image and return its public URL. Requires a signed-in session. */
export async function uploadChatImage(file: File): Promise<string> {
  return (await uploadChatImages([file]))[0];
}

/** Send an ordered batch in one request so paired references share the rate-limit slot. */
export async function uploadChatImages(
  files: readonly File[]
): Promise<string[]> {
  if (files.length === 0) return [];
  const supported = new Set([
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/avif',
  ]);
  if (
    files.length > 9 ||
    files.some(
      (file) =>
        !supported.has(file.type.toLowerCase()) ||
        !Number.isFinite(file.size) ||
        file.size <= 0
    )
  )
    throw new Error(m['common.upload.failed']());
  const formData = new FormData();
  for (const file of files) formData.append('files', file);

  const res = await fetch('/api/storage/upload-image', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error(m['common.upload.failed_status']({ status: res.status }));
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(m['common.upload.failed']());
  }
  const urls: unknown = json?.data?.urls;
  if (
    json?.code !== 0 ||
    !Array.isArray(urls) ||
    urls.length !== files.length ||
    !urls.every(
      (url): url is string => typeof url === 'string' && url.trim().length > 0
    )
  ) {
    throw new Error(m['common.upload.failed']());
  }
  return urls;
}

/**
 * Image files carried by a paste event. Screenshots arrive as a single
 * `image/*` item with no name, so we synthesize one.
 */
export function imageFilesFromClipboard(data: DataTransfer | null): File[] {
  if (!data) return [];
  const files = Array.from(data.files).filter((file) =>
    file.type.startsWith('image/')
  );
  if (files.length > 0) return files;

  return Array.from(data.items)
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => !!file);
}
