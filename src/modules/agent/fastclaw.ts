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

export interface FastClawStreamEvent {
  type: 'content' | 'error' | 'done';
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

interface FastClawPayload {
  choices?: Array<{
    delta?: { content?: unknown };
    message?: { content?: unknown };
  }>;
  error?: { message?: unknown };
  message?: unknown;
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
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
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
): { kind: 'content'; content: string } | { kind: 'done' } | { kind: 'empty' } {
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
  return content ? { kind: 'content', content } : { kind: 'empty' };
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
    if (content) yield { type: 'content', data: { content } };
    yield { type: 'done' };
    return;
  }

  if (!response.body) throw new Error('FastClaw returned an empty response.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;

  const emitParsed = function* (rawEvent: string) {
    const parsed = parseSseEvent(rawEvent);
    if (parsed.kind === 'content') {
      yield {
        type: 'content' as const,
        data: { content: parsed.content },
      };
    }
    if (parsed.kind === 'done') {
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
  if (!finished) yield { type: 'done' };
}
