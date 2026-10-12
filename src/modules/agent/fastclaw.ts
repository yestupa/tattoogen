import {
  creditsForModelOption,
  type AgentGenerationSettings,
} from '@/lib/agent-settings';

export const DEFAULT_FASTCLAW_BASE_URL = 'https://cloud.fastclaw.ai';
export const DEFAULT_FASTCLAW_AGENT_ID = 'agt_1d82e3db42549e69c6ff';

export interface FastClawConfig {
  apiKey: string;
  baseUrl: string;
  agentId: string;
}

export interface FastClawOutputFile {
  name?: string;
  path?: string;
  content_type?: string;
  data_url?: string;
  url?: string;
}

export interface StoredFastClawFile {
  path: string;
  url: string;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_OUTPUT_FILES = 9;
const IMAGE_TYPES: Record<
  string,
  { extension: string; valid: (bytes: Uint8Array) => boolean }
> = {
  'image/png': {
    extension: 'png',
    valid: (bytes) =>
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
        (value, index) => bytes[index] === value
      ),
  },
  'image/jpeg': {
    extension: 'jpg',
    valid: (bytes) =>
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  'image/webp': {
    extension: 'webp',
    valid: (bytes) =>
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP',
  },
  'image/gif': {
    extension: 'gif',
    valid: (bytes) =>
      ['GIF87a', 'GIF89a'].includes(String.fromCharCode(...bytes.slice(0, 6))),
  },
  'image/avif': {
    extension: 'avif',
    valid: (bytes) =>
      String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp' &&
      ['avif', 'avis'].includes(String.fromCharCode(...bytes.slice(8, 12))),
  },
};

function fileContentType(file: FastClawOutputFile): string {
  const inlineType = file.data_url
    ?.match(/^data:(image\/[a-z0-9.+-]+);base64,/i)?.[1]
    ?.toLowerCase();
  const declaredType = file.content_type?.split(';')[0]?.trim().toLowerCase();
  if (inlineType && declaredType && inlineType !== declaredType) {
    throw new Error('FastClaw image content type does not match its data URL');
  }
  return inlineType || declaredType || '';
}

function validateImageBytes(bytes: Uint8Array, contentType: string): string {
  const type = IMAGE_TYPES[contentType];
  if (
    !type ||
    bytes.byteLength === 0 ||
    bytes.byteLength > MAX_IMAGE_BYTES ||
    !type.valid(bytes)
  ) {
    throw new Error('FastClaw returned an invalid or oversized image');
  }
  return type.extension;
}

async function readBoundedImage(response: Response): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('FastClaw image download returned no body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_IMAGE_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new Error('FastClaw returned an oversized image');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function persistFastClawFiles(params: {
  files: FastClawOutputFile[];
  config: FastClawConfig;
  userId: string;
  sessionId: string;
  upload: (input: {
    key: string;
    contentType: string;
    body: Uint8Array;
  }) => Promise<{ success: boolean; url?: string; error?: string }>;
  fetchPrivate?: (request: Request) => Promise<Response>;
}): Promise<StoredFastClawFile[]> {
  if (params.files.length > MAX_OUTPUT_FILES) {
    throw new Error('FastClaw returned too many image files');
  }
  const stored: StoredFastClawFile[] = [];
  const baseUrl = new URL(params.config.baseUrl);
  for (const file of params.files) {
    const contentType = fileContentType(file);
    if (!contentType.startsWith('image/')) continue;
    const path = file.path?.trim() || file.name?.trim() || '';
    if (!path) throw new Error('FastClaw returned an image without a path');

    let bytes: Uint8Array;
    if (file.data_url) {
      const encoded = file.data_url.match(
        /^data:image\/[a-z0-9.+-]+;base64,([a-z0-9+/=]+)$/i
      )?.[1];
      if (!encoded || encoded.length > MAX_IMAGE_BYTES * 2) {
        throw new Error(
          'FastClaw returned an invalid or oversized inline image'
        );
      }
      bytes = Buffer.from(encoded, 'base64');
    } else if (file.url) {
      const privateUrl = new URL(file.url);
      if (
        privateUrl.origin !== baseUrl.origin ||
        !privateUrl.pathname.startsWith('/v1/agents/') ||
        !privateUrl.pathname.includes('/sessions/') ||
        !privateUrl.pathname.includes('/files/')
      ) {
        throw new Error('Unexpected FastClaw file URL');
      }
      const response = await (params.fetchPrivate ?? fetch)(
        new Request(privateUrl, {
          headers: {
            Authorization: `Bearer ${params.config.apiKey}`,
            'X-Fastclaw-End-User': `tattoo-generator:${params.userId}`,
          },
        })
      );
      if (!response.ok)
        throw new Error(
          `FastClaw image download failed with status ${response.status}`
        );
      const length = Number(response.headers.get('content-length'));
      if (Number.isFinite(length) && length > MAX_IMAGE_BYTES) {
        throw new Error('FastClaw returned an oversized image');
      }
      bytes = await readBoundedImage(response);
    } else {
      throw new Error('FastClaw returned an image without downloadable data');
    }

    const extension = validateImageBytes(bytes, contentType);
    const result = await params.upload({
      body: bytes,
      key: `agent/sessions/${params.sessionId}/fastclaw_${crypto.randomUUID()}.${extension}`,
      contentType,
    });
    if (!result.success || !result.url) {
      throw new Error(result.error || 'FastClaw image storage failed');
    }
    stored.push({ path, url: result.url });
  }
  return stored;
}

export function rewriteFastClawContent(
  content: string,
  files: StoredFastClawFile[]
): string {
  let rewritten = content;
  for (const file of files) {
    rewritten = rewritten.replaceAll(`/workspace/${file.path}`, file.url);
    rewritten = rewritten.replaceAll(
      `/workspace/${encodeURI(file.path)}`,
      file.url
    );
  }
  const missing = files.filter((file) => !rewritten.includes(file.url));
  if (missing.length > 0) {
    const images = missing.map((file) => {
      const name = (file.path.split('/').pop() || 'tattoo design').replace(
        /[\[\]()]/g,
        ''
      );
      return `![${name}](${file.url})`;
    });
    rewritten = [rewritten.trim(), ...images].filter(Boolean).join('\n\n');
  }
  return rewritten;
}

export interface FastClawStreamEvent {
  type: 'content' | 'files' | 'error' | 'done';
  data?: Record<string, unknown>;
}

export interface FastClawBillingTask {
  userId: string;
  mediaType: 'image';
  provider: 'fastclaw';
  model: string;
  prompt: string;
  costCredits: number;
  options: { sessionId: string };
}

export interface FastClawUsageTotals {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  requestCount: number;
}

export interface NormalizedFastClawUsage {
  totals: FastClawUsageTotals;
  daily: Record<string, unknown>[];
}

interface FastClawPayload {
  choices?: Array<{
    delta?: { content?: unknown };
    message?: { content?: unknown };
  }>;
  error?: { message?: unknown };
  message?: unknown;
  files?: unknown;
}

function payloadFiles(payload: FastClawPayload): FastClawOutputFile[] {
  if (!Array.isArray(payload.files)) return [];
  return payload.files.filter(
    (file): file is FastClawOutputFile => !!file && typeof file === 'object'
  );
}

export function resolveFastClawConfig(
  configs: Record<string, string>
): FastClawConfig | null {
  const apiKey = configs.fastclaw_api_key?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: configs.fastclaw_base_url?.trim() || DEFAULT_FASTCLAW_BASE_URL,
    agentId: configs.fastclaw_agent_id?.trim() || DEFAULT_FASTCLAW_AGENT_ID,
  };
}

function fastClawHeaders(config: FastClawConfig) {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
}

export function createFastClawUserRequest(params: {
  config: FastClawConfig;
  externalId: string;
  displayName?: string;
}) {
  const baseUrl = params.config.baseUrl.replace(/\/+$/, '');
  const displayName = params.displayName?.trim();
  return new Request(`${baseUrl}/v1/users`, {
    method: 'POST',
    headers: fastClawHeaders(params.config),
    body: JSON.stringify({
      external_id: params.externalId,
      ...(displayName ? { display_name: displayName } : {}),
    }),
  });
}

export function createFastClawUsageRequest(params: {
  config: FastClawConfig;
  fastClawUserId: string;
  days: number;
}) {
  const baseUrl = params.config.baseUrl.replace(/\/+$/, '');
  const days = Math.min(90, Math.max(1, Math.floor(params.days)));
  const query = new URLSearchParams({
    user_id: params.fastClawUserId,
    days: String(days),
  });
  return new Request(`${baseUrl}/v1/usage?${query}`, {
    headers: { Authorization: `Bearer ${params.config.apiKey}` },
  });
}

function nonNegativeInteger(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

export function normalizeFastClawUsage(
  payload: unknown
): NormalizedFastClawUsage {
  const record =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : {};
  const totals =
    record.totals && typeof record.totals === 'object'
      ? (record.totals as Record<string, unknown>)
      : {};
  return {
    totals: {
      inputTokens: nonNegativeInteger(totals.inputTokens),
      outputTokens: nonNegativeInteger(totals.outputTokens),
      cacheReadTokens: nonNegativeInteger(totals.cacheReadTokens),
      cacheCreationTokens: nonNegativeInteger(totals.cacheCreationTokens),
      requestCount: nonNegativeInteger(totals.requestCount),
    },
    daily: Array.isArray(record.daily)
      ? record.daily.filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === 'object'
        )
      : [],
  };
}

export function createFastClawRequest(params: {
  config: FastClawConfig;
  userId: string;
  sessionId: string;
  message: string;
  images?: string[];
  settings?: AgentGenerationSettings;
  signal?: AbortSignal;
}): Request {
  const { config, userId, sessionId, message, settings, signal } = params;
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const externalUserId = `tattoo-generator:${userId}`;
  const images = Array.from(
    new Set((params.images ?? []).map((image) => image.trim()).filter(Boolean))
  );

  const body = {
    agent_id: config.agentId,
    stream: true,
    return_files: 'inline',
    user: externalUserId,
    messages: [{ role: 'user', content: message }],
    ...(images.length > 0 ? { images } : {}),
    params: {
      app: 'tattoo-generator',
      conversation_id: sessionId,
      ...(settings?.modelName
        ? { selected_image_model: settings.modelName }
        : {}),
      ...(settings?.aspectRatio ? { aspect_ratio: settings.aspectRatio } : {}),
      ...(settings?.resolution ? { resolution: settings.resolution } : {}),
    },
  };

  return new Request(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream, application/json',
      ...fastClawHeaders(config),
      'X-Fastclaw-Session-Key': `tattoo-generator:${userId}:${sessionId}`,
    },
    body: JSON.stringify(body),
    signal,
  });
}

export function createFastClawBillingTask(params: {
  agentId: string;
  userId: string;
  sessionId: string;
  message: string;
  settings?: AgentGenerationSettings;
}): FastClawBillingTask {
  const selectedModel = params.settings?.modelName?.trim();
  return {
    userId: params.userId,
    mediaType: 'image',
    provider: 'fastclaw',
    model: selectedModel
      ? `${params.agentId}:${selectedModel}`
      : params.agentId,
    prompt: params.message,
    // Never trust the creditCost field sent by the browser. The server-side
    // model catalog is the only pricing source.
    costCredits: creditsForModelOption(selectedModel),
    options: { sessionId: params.sessionId },
  };
}

function sanitizeFastClawMessage(message: string): string {
  return message
    .replace(/\b(?:fc|fcak)_[a-z0-9_-]{12,}\b/gi, 'redacted')
    .replace(/\bBearer\s+\S+/gi, 'Bearer redacted');
}

function payloadContent(payload: FastClawPayload): string {
  const content =
    payload.choices?.[0]?.delta?.content ??
    payload.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : '';
}

function payloadError(payload: FastClawPayload): string {
  const error = payload.error?.message;
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (!payload.choices && typeof payload.message === 'string') {
    return payload.message.trim();
  }
  return '';
}

function parsePayload(raw: string): FastClawPayload {
  try {
    return JSON.parse(raw) as FastClawPayload;
  } catch {
    throw new Error('FastClaw returned an invalid response.');
  }
}

async function requestError(response: Response): Promise<Error> {
  const raw = await response.text().catch(() => '');
  let message = raw.trim();
  if (raw) {
    try {
      message = payloadError(JSON.parse(raw) as FastClawPayload) || message;
    } catch {
      // Plain-text errors are valid upstream responses.
    }
  }
  const detail = message
    ? `: ${sanitizeFastClawMessage(message).slice(0, 500)}`
    : '';
  return new Error(
    `FastClaw request failed with status ${response.status}${detail}`
  );
}

function parseSseEvent(
  rawEvent: string
):
  | { kind: 'payload'; content: string; files: FastClawOutputFile[] }
  | { kind: 'done' }
  | { kind: 'empty' } {
  const data = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n')
    .trim();

  if (!data) return { kind: 'empty' };
  if (data === '[DONE]') return { kind: 'done' };

  const payload = parsePayload(data);
  const error = payloadError(payload);
  if (error) throw new Error(sanitizeFastClawMessage(error));
  const content = payloadContent(payload);
  const files = payloadFiles(payload);
  return content || files.length > 0
    ? { kind: 'payload', content, files }
    : { kind: 'empty' };
}

export async function* readFastClawEvents(
  response: Response
): AsyncGenerator<FastClawStreamEvent> {
  if (!response.ok) throw await requestError(response);

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/event-stream')) {
    const payload = parsePayload(await response.text());
    const error = payloadError(payload);
    if (error) throw new Error(sanitizeFastClawMessage(error));
    const content = payloadContent(payload);
    const files = payloadFiles(payload);
    if (!content && files.length === 0) {
      throw new Error('FastClaw returned no content or files');
    }
    if (content) yield { type: 'content', data: { content } };
    if (files.length > 0) yield { type: 'files', data: { files } };
    yield { type: 'done' };
    return;
  }

  if (!response.body) throw new Error('FastClaw returned an empty response.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;
  let hasOutput = false;

  const emitParsed = function* (rawEvent: string) {
    const parsed = parseSseEvent(rawEvent);
    if (parsed.kind === 'payload') {
      hasOutput = true;
      if (parsed.content) {
        yield {
          type: 'content' as const,
          data: { content: parsed.content },
        };
      }
      if (parsed.files.length > 0) {
        yield { type: 'files' as const, data: { files: parsed.files } };
      }
    }
    if (parsed.kind === 'done') {
      if (!hasOutput) throw new Error('FastClaw returned no content or files');
      finished = true;
      yield { type: 'done' as const };
    }
  };

  while (!finished) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || '';

    for (const event of events) {
      yield* emitParsed(event);
      if (finished) return;
    }

    if (done) break;
  }

  if (buffer.trim()) yield* emitParsed(buffer);
  if (!finished) {
    if (!hasOutput) throw new Error('FastClaw returned no content or files');
    yield { type: 'done' };
  }
}
