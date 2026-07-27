import { defineTool, type ToolDefinition } from '@codeany/open-agent-sdk';

import {
  AIMediaType,
  AITaskStatus,
  FalProvider,
  GRouterProvider,
  ReplicateProvider,
  type AIProvider,
  type AITaskResult,
} from '@/core/ai';
import { envConfigs } from '@/config';
import {
  createTask,
  AITaskStatus as DbTaskStatus,
  updateTask,
} from '@/modules/ai-tasks/service';
import { getAllConfigs } from '@/modules/config/service';
import { getStorage } from '@/modules/storage/service';
import {
  AGENT_MODEL_OPTION_VALUES,
  creditsForModelOption,
  isModelOptionValue,
  providerModelFor,
  type AgentGenerationSettings,
  type ImageProviderName,
} from '@/lib/agent-settings';

// Tools the ImgAny agent can call. They are the ONLY tools the agent gets —
// no filesystem/bash base tools — so the agent loop can't touch anything
// outside image generation.

export interface AgentToolContext {
  userId: string;
  sessionId: string;
  settings?: AgentGenerationSettings;
  /** Image URLs the user attached to the message being answered. */
  attachedImages?: string[];
}

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 180_000;

/**
 * A provider's safety filter refusing the inputs is a dead end, not a hiccup.
 * The model's instinct is to reword the prompt and go again, but the filter
 * read the *images* — "The input or output was flagged as sensitive" comes
 * back identically however the sentence is phrased, and the user watches the
 * same failure scroll past three times. This remembers what was refused
 * during the turn so the second attempt is stopped here, before it costs
 * another round-trip.
 */
interface ModerationGuard {
  /** Source-image sets the filter has already rejected this turn. */
  refused: Set<string>;
  count: number;
}

function createModerationGuard(): ModerationGuard {
  return { refused: new Set(), count: 0 };
}

/** Signature of the images a call runs on — the part a reword can't change. */
function sourceSignature(kind: string, options: Record<string, unknown>) {
  const sources = Array.isArray(options.image_input)
    ? options.image_input.map(String).slice().sort().join('|')
    : '';
  return `${kind}:${sources}`;
}

/**
 * Does this provider error mean "we won't make this image", as opposed to
 * "something went wrong"? Covers the gateway's wording plus the phrasings
 * fal/Replicate/OpenAI use for the same refusal.
 */
function isContentRefusal(message: string): boolean {
  return /flagged as sensitive|content[_ ]policy|safety (system|filter|checker)|moderation|nsfw|prohibited content|violat\w* (our|the) (content|usage) polic/i.test(
    message
  );
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolveSleep, rejectSleep) => {
    const timer = setTimeout(resolveSleep, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        rejectSleep(new Error('aborted'));
      },
      { once: true }
    );
  });
}

/**
 * Reference images arrive as public URLs (uploads and previous generations
 * both live in object storage) or as data URIs. Anything else can't be read
 * from a Worker, so it's rejected instead of silently failing upstream.
 */
export function resolveReferenceImage(
  src: string,
  appUrl: string = envConfigs.app_url
): string {
  const value = src.trim();
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  // Site-relative, which is how the example browser attaches its sample
  // images. The provider fetches this URL from the outside, so it has to be
  // made absolute — `//host/x` is excluded, that points off-site.
  if (value.startsWith('/') && !value.startsWith('//')) {
    return `${appUrl.replace(/\/+$/, '')}${value}`;
  }
  throw new Error(`unsupported image reference: ${src}`);
}

function extFromUrl(url: string): string {
  const m = url.match(/\.(png|jpe?g|gif|webp)(?:\?|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'png';
}

function contentTypeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Persist the provider's images to object storage and return their public
 * URLs. Nothing touches a local disk — the agent runs on Workers, where there
 * isn't one, and storage is the single home for generated files.
 */
async function storeGeneratedImages(
  urls: string[],
  sessionId: string
): Promise<{ files: string[]; storage: string }> {
  const storage = await getStorage();
  if (!storage) {
    throw new Error(
      'Object storage is not configured. Ask the site admin to set up R2 in Admin Settings — generated images have nowhere to live otherwise.'
    );
  }

  const files: string[] = [];
  for (let i = 0; i < urls.length; i++) {
    const buf = await fetchImageBuffer(urls[i]);
    const ext = extFromUrl(urls[i]);
    const uploaded = await storage.uploadFile({
      body: buf,
      key: `agent/sessions/${sessionId}/img_${Date.now()}_${i}.${ext}`,
      contentType: contentTypeFromExt(ext),
      disposition: 'inline',
    });
    if (!uploaded.success || !uploaded.url) {
      throw new Error(uploaded.error || 'storage upload failed');
    }
    files.push(uploaded.url);
  }
  return { files, storage: storage.getProviderNames()[0] };
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  let lastError: unknown;
  const host = safeUrlHost(url);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `image download from ${host} failed (${res.status}): ${text.slice(0, 300)}`
        );
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (error: any) {
      lastError = error;
      if (attempt < 3) {
        await sleep(attempt * 800);
        continue;
      }
    }
  }

  const cause =
    lastError instanceof Error
      ? `${lastError.message}${lastError.cause ? `; cause: ${String(lastError.cause)}` : ''}`
      : String(lastError);
  throw new Error(`image download from ${host} failed after retries: ${cause}`);
}

function safeUrlHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return 'unknown host';
  }
}

async function runImageGeneration(params: {
  ctx: AgentToolContext;
  prompt: string;
  /** Picker key (`gpt-image-2`) — mapped to the active provider's id. */
  modelKey?: string;
  kind: 'generate' | 'edit';
  options: Record<string, unknown>;
  signal?: AbortSignal;
  /** Per-turn record of what the safety filter already refused. */
  moderation: ModerationGuard;
}): Promise<string> {
  const { ctx, prompt, options, signal, kind, moderation } = params;

  // Already refused once this turn — either for these very images, or twice
  // over for anything. Answer from here instead of paying for the same "no".
  const signature = sourceSignature(kind, options);
  if (moderation.refused.has(signature) || moderation.count >= 2) {
    return JSON.stringify({
      status: 'error',
      retryable: false,
      message: "Blocked by the image provider's content filter.",
      guidance:
        'The same inputs were already refused in this turn, and the filter judges the images rather than the wording — another attempt returns the same refusal. Stop calling the tool: tell the user their image was blocked by the provider, and suggest a different source photo or a milder edit.',
    });
  }

  const configs = await getAllConfigs();

  const selectedProvider = pickImageProvider(configs);

  if (!selectedProvider) {
    return JSON.stringify({
      status: 'error',
      message:
        'Image provider is not configured. Ask the site admin to add a Replicate API token, a Fal API key, or a gRouter gateway in Admin Settings.',
    });
  }

  const model =
    providerModelFor(
      params.modelKey,
      selectedProvider,
      kind,
      selectedProvider === 'grouter' ? grouterModelMap(configs) : undefined
    ) || defaultModelFor(selectedProvider);

  if (!model) {
    return JSON.stringify({
      status: 'error',
      message: `Model "${params.modelKey ?? ''}" has no id configured for the ${selectedProvider} provider.`,
    });
  }

  let provider: AIProvider;
  if (selectedProvider === 'grouter') {
    provider = new GRouterProvider({
      apiKey: configs.grouter_api_key,
      baseUrl: configs.grouter_base_url,
      appName: envConfigs.app_name,
      appUrl: envConfigs.app_url,
    });
  } else if (selectedProvider === 'replicate') {
    provider = new ReplicateProvider({ apiToken: configs.replicate_api_token });
  } else {
    provider = new FalProvider({ apiKey: configs.fal_api_key });
  }

  // Priced from the model catalog for the model this call actually runs on,
  // never from the request body — the composer sends `creditCost` for
  // display, but trusting it would let a crafted request buy a 50-credit
  // image for nothing.
  const costCredits = creditsForModelOption(
    params.modelKey ?? ctx.settings?.modelName
  );

  // createTask consumes credits atomically and stores the credit id so a
  // failed generation can be refunded via updateTask(FAILED).
  let task: { id: string };
  try {
    task = await createTask({
      userId: ctx.userId,
      mediaType: 'image',
      provider: selectedProvider,
      model,
      prompt,
      costCredits,
      // Which chat asked for it. The gallery reads images out of the message
      // rows today, but recording it here keeps the task row self-contained
      // for support questions — and leaves the door open to serving the
      // gallery from this table instead.
      options: { ...(options ?? {}), sessionId: ctx.sessionId },
    });
  } catch (err: any) {
    if (String(err?.message).includes('Insufficient credits')) {
      return JSON.stringify({
        status: 'error',
        message:
          'Insufficient credits. The user needs to top up before generating more images.',
      });
    }
    throw err;
  }

  try {
    const providerOptions = { ...options };
    const nativeResolution = nativeResolutionForModel(
      selectedProvider,
      model,
      providerOptions.resolution
    );
    if (nativeResolution) providerOptions.resolution = nativeResolution;
    else delete providerOptions.resolution;

    const created = await provider.generate({
      params: {
        mediaType: AIMediaType.IMAGE,
        model,
        prompt,
        options: providerOptions,
      },
    });

    const deadline = Date.now() + POLL_TIMEOUT_MS;
    const pollTask = provider.query?.bind(provider);
    let result: AITaskResult = created;
    while (
      result.taskStatus !== AITaskStatus.SUCCESS &&
      result.taskStatus !== AITaskStatus.FAILED &&
      result.taskStatus !== AITaskStatus.CANCELED
    ) {
      if (!pollTask) {
        throw new Error(`provider ${selectedProvider} cannot poll tasks`);
      }
      if (Date.now() > deadline) throw new Error('image generation timed out');
      await sleep(POLL_INTERVAL_MS, signal);
      result = await pollTask({
        taskId: created.taskId,
        model,
        mediaType: AIMediaType.IMAGE,
      });
    }

    if (result.taskStatus !== AITaskStatus.SUCCESS) {
      throw new Error(
        result.taskInfo?.errorMessage || `generation ${result.taskStatus}`
      );
    }

    const urls = (result.taskInfo?.images ?? [])
      .map((img) => img.imageUrl)
      .filter((u): u is string => !!u);
    if (urls.length === 0) throw new Error('no image returned');

    const saved = await storeGeneratedImages(urls, ctx.sessionId);
    const files = saved.files;

    await updateTask({
      taskId: task.id,
      status: DbTaskStatus.SUCCESS,
      taskResult: { files, model, storage: saved.storage },
    });

    return JSON.stringify({
      status: 'success',
      files,
      storage: saved.storage,
      provider: selectedProvider,
      model,
      note:
        'Reference each file in your reply as a markdown image using the storage URL, e.g. ![alt](' +
        files[0] +
        ')',
    });
  } catch (err: any) {
    const raw = String(err?.message ?? err);
    // Refunds the consumed credits (updateTask revokes on FAILED). The raw
    // message is kept in the task record; the agent (and the chat) only get
    // the readable summary.
    await updateTask({
      taskId: task.id,
      status: DbTaskStatus.FAILED,
      taskResult: { error: raw },
    }).catch((refundErr) => {
      // This call is what gives the credits back. Swallowing it silently
      // means the user paid for an image they never got and nothing anywhere
      // says so — at minimum it has to be findable in the logs.
      console.error(
        `[agent tools] failed to refund task ${task.id} for user ${ctx.userId}`,
        refundErr
      );
    });

    const summary = summarizeProviderError(raw);
    if (isContentRefusal(raw)) {
      moderation.refused.add(signature);
      moderation.count += 1;
      return JSON.stringify({
        status: 'error',
        retryable: false,
        message: summary,
        guidance:
          "This is the provider's content filter judging the images, not the prompt wording — rewording and retrying returns the same refusal. Do not call the tool again for this request: tell the user their image was blocked by the provider's safety filter, and suggest a different source photo or a milder edit.",
      });
    }

    return JSON.stringify({ status: 'error', message: summary });
  }
}

/**
 * Providers report failures by pasting the upstream response body into their
 * error message, which drags in the echoed request (prompt, image sizes, even
 * `openai_api_key: null`). Pull out the sentence a human needs — fal's
 * `detail[].msg`, an OpenAI-style `error.message`, or a plain `detail` — and
 * keep the prefix that says who failed and with what status.
 */
function summarizeProviderError(message: string): string {
  const start = message.search(/[[{]/);
  if (start === -1) return truncate(message);

  const prefix = message
    .slice(0, start)
    .trim()
    .replace(/[:\s]+$/, '');
  let payload: any;
  try {
    payload = JSON.parse(message.slice(start));
  } catch {
    return truncate(message);
  }

  const detail = payload?.detail ?? payload;
  const first = Array.isArray(detail) ? detail[0] : detail;
  const summary =
    (typeof first?.msg === 'string' && first.msg) ||
    (typeof first?.message === 'string' && first.message) ||
    (typeof payload?.error?.message === 'string' && payload.error.message) ||
    (typeof detail === 'string' && detail) ||
    '';
  if (!summary) return truncate(message);

  const type = typeof first?.type === 'string' ? ` (${first.type})` : '';
  return truncate(
    prefix ? `${prefix}: ${summary}${type}` : `${summary}${type}`
  );
}

function truncate(value: string, max = 300): string {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function promptWithResolution(prompt: string, resolution: unknown) {
  const value = typeof resolution === 'string' ? resolution.trim() : '';
  if (!value) return prompt;
  const upper = value.toUpperCase();
  return `${prompt}. ${upper} high-resolution output, sharp detail, clean edges.`;
}

/**
 * Resolve which provider serves this call.
 *
 * The admin's `default_image_provider` decides; `auto` prefers the gRouter
 * gateway (a configured gateway exists to be the single egress for image
 * traffic), then Replicate, then Fal. An explicitly chosen provider that
 * isn't usable falls back to whatever is configured rather than failing.
 * Returns null when nothing usable is configured.
 */
function pickImageProvider(
  configs: Record<string, any>
): ImageProviderName | null {
  const configured: Record<ImageProviderName, boolean> = {
    grouter: !!configs.grouter_api_key && !!configs.grouter_base_url,
    fal: !!configs.fal_api_key,
    replicate: !!configs.replicate_api_token,
  };

  // Configuring a gateway takes deliberate work, so `auto` treats it as the
  // stated preference when both its keys are present.
  const preferred = String(configs.default_image_provider || 'auto');
  const order: ImageProviderName[] =
    preferred === 'auto'
      ? ['grouter', 'replicate', 'fal']
      : [preferred as ImageProviderName, 'grouter', 'replicate', 'fal'];

  return order.find((name) => configured[name]) ?? null;
}

/**
 * Admin-supplied picker-key → gRouter route-name overrides, stored as JSON in
 * `grouter_model_map` (route names are chosen inside the gateway, so the
 * built-in defaults can't always be right). Malformed JSON is ignored rather
 * than failing the generation.
 */
function grouterModelMap(
  configs: Record<string, any>
): Record<string, string> | undefined {
  const raw = String(configs.grouter_model_map ?? '').trim();
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return undefined;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim()) out[key] = value.trim();
    }
    return Object.keys(out).length > 0 ? out : undefined;
  } catch {
    console.warn('[agent tools] grouter_model_map is not valid JSON');
    return undefined;
  }
}

/** Last-resort model when the picker key maps to nothing for this provider. */
function defaultModelFor(provider: ImageProviderName): string {
  switch (provider) {
    case 'replicate':
      return 'black-forest-labs/flux-schnell';
    case 'fal':
      return 'fal-ai/flux/schnell';
    default:
      return '';
  }
}

/**
 * `resolution` is a Fal-only input — the same model id on Replicate takes
 * `quality`/`aspect_ratio` instead and rejects unknown fields, and the gateway
 * speaks `size`. Everywhere else the target clarity rides along in the prompt.
 */
function nativeResolutionForModel(
  provider: ImageProviderName,
  model: string,
  resolution: unknown
) {
  const value = typeof resolution === 'string' ? resolution.trim() : '';
  if (!value || provider !== 'fal') return undefined;
  const supported = [
    'openai/gpt-image-2',
    'openai/gpt-image-2/edit',
    'fal-ai/nano-banana-2',
    'fal-ai/nano-banana-2/edit',
    'fal-ai/nano-banana-pro',
    'fal-ai/nano-banana-pro/edit',
  ];
  return supported.includes(model) ? value.toUpperCase() : undefined;
}

/**
 * Resolve which catalog model this call runs on.
 *
 * Only the keys the composer offers are accepted. Raw provider ids used to be
 * passed through, which let the agent "try another model" with something like
 * `black-forest-labs/flux-dev` — a model the user can't pick, that we hold no
 * price for, and that the configured provider usually rejects outright.
 * Anything off the list comes back as an error the agent can act on, before
 * any credits are spent.
 */
function modelSelection(
  requested: string,
  ctx: AgentToolContext
): { modelKey?: string; error?: string } {
  if (requested && !isModelOptionValue(requested)) {
    return {
      error: JSON.stringify({
        status: 'error',
        message: `Unsupported model "${requested}".`,
        guidance: `This app only generates with: ${AGENT_MODEL_OPTION_VALUES.join(', ')}. Leave \`model\` empty to use the one the user picked in the composer, or pass exactly one of those names.`,
      }),
    };
  }
  return { modelKey: requested || ctx.settings?.modelName };
}

/**
 * Refuse an edit that uses none of the images the user just attached.
 *
 * Someone who attaches a photo and says "swap the partner for her" wants both
 * pictures in the result, but the model kept sending one source and rewriting
 * the older image alone — the attachment silently did nothing, and the user
 * paid for an image they didn't ask for. Nothing has been charged at this
 * point, so bouncing the call costs a retry and nothing else.
 */
function missingAttachment(
  sources: string[],
  ctx: AgentToolContext
): string | null {
  const attached = ctx.attachedImages ?? [];
  if (attached.length === 0) return null;
  // Compare on resolved URLs. The message carries an attachment however the
  // composer wrote it — a site-relative `/imgs/examples/x.webp` for the
  // bundled samples — while `sources` has already been made absolute, so a
  // raw string match reads a used attachment as an ignored one.
  const used = new Set(sources.map(resolveAttachmentForCompare));
  if (attached.some((url) => used.has(resolveAttachmentForCompare(url))))
    return null;
  return JSON.stringify({
    status: 'error',
    message: `The ${attached.length} image(s) attached to this message were not used.`,
    guidance: `Attached but left out: ${attached.join(', ')}. If the result should show what's in them — a new person, a garment, a logo, a background — call edit_image again with every source in \`images\` (the attachment plus whichever earlier image the request builds on) and describe them as "image 1", "image 2" in the prompt. If the attachment genuinely has nothing to do with this edit, don't call the tool again — say so in your reply and ask the user what they meant.`,
  });
}

/** Best-effort absolute form, for comparing two references to one image. */
function resolveAttachmentForCompare(url: string): string {
  try {
    return resolveReferenceImage(url);
  } catch {
    return url;
  }
}

export function createAgentTools(ctx: AgentToolContext): ToolDefinition[] {
  // One guard per turn: the tools are rebuilt for every request, so a refusal
  // stops the retries inside this turn without following the user forever.
  const moderation = createModerationGuard();

  const generateImage = defineTool({
    name: 'generate_image',
    description:
      'Generate one image from a text prompt. Returns JSON with `files` — public URLs of the generated images. Always show the result to the user as a markdown image.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description:
            'Detailed English prompt describing the image to generate',
        },
        aspect_ratio: {
          type: 'string',
          description:
            'Aspect ratio, e.g. "1:1", "16:9", "9:16", "4:3". Default "1:1".',
        },
        model: {
          type: 'string',
          enum: [...AGENT_MODEL_OPTION_VALUES],
          description: `Optional image model, and only one of: ${AGENT_MODEL_OPTION_VALUES.join(', ')}. No other model exists here — never pass a provider id such as "black-forest-labs/flux-dev". Leave empty to use the model the user selected in the composer.`,
        },
        resolution: {
          type: 'string',
          description:
            'Optional target output clarity, e.g. "2k" or "4k". If the model does not support a native resolution field, include it in the prompt.',
        },
      },
      required: ['prompt'],
    },
    isConcurrencySafe: true,
    async call(input, context) {
      const selection = modelSelection(String(input.model ?? ''), ctx);
      if (selection.error) return selection.error;
      const options: Record<string, unknown> = {};
      const aspectRatio = input.aspect_ratio || ctx.settings?.aspectRatio;
      if (aspectRatio) options.aspect_ratio = aspectRatio;
      const resolution = input.resolution || ctx.settings?.resolution;
      if (resolution) options.resolution = resolution;
      return runImageGeneration({
        ctx,
        prompt: promptWithResolution(String(input.prompt ?? ''), resolution),
        modelKey: selection.modelKey,
        kind: 'generate',
        options,
        signal: context.abortSignal,
        moderation,
      });
    },
  });

  const editImage = defineTool({
    name: 'edit_image',
    description:
      'Edit, restyle or combine existing images based on instructions. Accepts the http(s) URLs of uploaded or previously generated images. Pass several in `images` whenever the result must contain elements from more than one of them — two people in one wedding photo, a person plus a garment for a virtual try-on, a logo onto a product. An image the user just attached and an image generated earlier in the conversation combine the same way: send both rather than editing one of them alone. Returns JSON with `files` — public URLs of the edited images.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'English instruction describing the desired edit',
        },
        image: {
          type: 'string',
          description:
            'Source image: the http(s) URL of an uploaded or previously generated image. Use this ONLY when exactly one image is involved; anything that merges two subjects goes in `images`.',
        },
        images: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Two or more source images, in the order the prompt refers to them (e.g. ["<person A>", "<person B>"] or ["<person>", "<garment>"]). Takes precedence over `image`. Refer to them in the prompt as "image 1", "image 2", … so the model knows which is which.',
        },
        aspect_ratio: {
          type: 'string',
          description: 'Optional output aspect ratio, e.g. "match_input_image"',
        },
        model: {
          type: 'string',
          enum: [...AGENT_MODEL_OPTION_VALUES],
          description: `Optional image model, and only one of: ${AGENT_MODEL_OPTION_VALUES.join(', ')}. No other model exists here — never pass a provider id such as "black-forest-labs/flux-dev". Leave empty to use the model the user selected in the composer.`,
        },
        resolution: {
          type: 'string',
          description:
            'Optional target output clarity, e.g. "2k" or "4k". If the model does not support a native resolution field, include it in the prompt.',
        },
      },
      required: ['prompt'],
    },
    isConcurrencySafe: true,
    async call(input, context) {
      const selection = modelSelection(String(input.model ?? ''), ctx);
      if (selection.error) return selection.error;
      const sources = (
        Array.isArray(input.images) && input.images.length > 0
          ? input.images
          : [input.image]
      )
        .map((item: unknown) => String(item ?? '').trim())
        .filter(Boolean);
      if (sources.length === 0) {
        return JSON.stringify({
          status: 'error',
          message: 'edit_image needs at least one source image',
        });
      }
      const inputImages = sources.map((src: string) =>
        resolveReferenceImage(src)
      );
      const ignoredAttachment = missingAttachment(inputImages, ctx);
      if (ignoredAttachment) return ignoredAttachment;
      // Normalized key — each provider's formatInput() maps this to the
      // field name the selected model actually expects (e.g. `image_url`
      // for fal-ai/flux-pro/kontext, `input_image` for Replicate's
      // flux-kontext family). Don't hardcode a provider-specific key here.
      const options: Record<string, unknown> = { image_input: inputImages };
      const aspectRatio = input.aspect_ratio || ctx.settings?.aspectRatio;
      if (aspectRatio) options.aspect_ratio = aspectRatio;
      const resolution = input.resolution || ctx.settings?.resolution;
      if (resolution) options.resolution = resolution;
      return runImageGeneration({
        ctx,
        prompt: promptWithResolution(String(input.prompt ?? ''), resolution),
        modelKey: selection.modelKey,
        kind: 'edit',
        options,
        signal: context.abortSignal,
        moderation,
      });
    },
  });

  return [generateImage, editImage];
}
