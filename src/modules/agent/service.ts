import { createAgent } from '@codeany/open-agent-sdk';

import {
  AITaskStatus,
  createTask,
  updateTask,
} from '@/modules/ai-tasks/service';
import { getAllConfigs } from '@/modules/config/service';
import { splitAttachedImages } from '@/lib/agent-chat';
import {
  AGENT_MODEL_OPTION_VALUES,
  type AgentGenerationSettings,
} from '@/lib/agent-settings';
import {
  normalizeAnthropicBaseUrl,
  normalizeOpenAIBaseUrl,
} from '@/lib/llm-base-url';

import {
  createFastClawBillingTask,
  createFastClawRequest,
  readFastClawEvents,
  resolveFastClawConfig,
} from './fastclaw';
import { collectConversationImages, loadAgentHistory } from './history';
import { createAgentTools } from './tools';
import { ensureFastClawUser } from './usage';

// FastClaw is the primary runtime for Tattoo Generator. The template's
// in-process image agent remains as a configuration fallback for local work.
// Both paths emit the same event shapes consumed by the existing chat UI:
// content / tool_call / tool_result / error / done.
//
// Nothing here touches a filesystem: history comes from `chat_message` and
// generated images go to object storage, so the whole runtime works on
// Cloudflare Workers.

export interface AgentStreamEvent {
  type: 'content' | 'tool_call' | 'tool_result' | 'error' | 'done';
  data?: Record<string, unknown>;
}

const SYSTEM_PROMPT = `You are Tattoo Generator, an AI tattoo-design specialist. You help users turn ideas, references, and placement photos into original tattoo concepts through conversation.

Rules:
- Tattoo design is the whole job. Anything unrelated to planning, generating, editing, or discussing tattoo artwork is out of scope. Say in one friendly line that you focus on tattoo concepts, then offer a concrete tattoo idea they could ask for.
- The exception is talk that surrounds the work: what you can do, what a model or aspect ratio means, why a generation failed, how credits are spent, what's in an image the conversation already has. Answer those normally — they're part of using the product.
- Ask one concise follow-up only when placement, style, subject, or color choice is essential. Otherwise make a strong first concept immediately.
- Treat skin photos as placement references. Preserve anatomy and avoid presenting a generated mockup as medical advice or a guaranteed result on real skin.
- Prefer tattoo-ready compositions: clean silhouette, intentional line weight, readable negative space, and detail scaled to the requested placement.
- Understand the user's intent, then call generate_image (text-to-image) or edit_image (when the user refers to an existing image or provides one).
- When the user message includes "Attached images", use those URLs as source images for edit_image if the request asks to transform, restyle, repair, remove, replace, extend, or otherwise modify an image.
- An attachment labelled "annotation guide" is a marked-up copy of another attached image. Use the unmarked source as the primary image and include the guide as another input to edit_image. State in the edit prompt that arrows, circles and strokes are instructions only and must never appear in the output; preserve areas outside the markings unless the user says otherwise.
- The user turn may also carry an "Images in this conversation" list — every image made or supplied so far, oldest first. Treat it as the pool of things the user can refer to; the last entry is usually "the image" in "make the image warmer".
- A request that brings together subjects from more than one image — "marry her", "put them in one photo", "have him wear this jacket", "put this logo on that mug" — is a COMPOSITION. Pass every image involved in edit_image's \`images\` array, in the order your prompt mentions them, and write the prompt in terms of those slots ("the man from image 1 and the woman from image 2 as bride and groom"). A newly attached photo plus an image generated earlier is the common case: never drop one of them and re-edit the other alone. Use the single \`image\` field only when exactly one source is involved.
- Write image prompts in English, enriching the user's request with useful visual detail (style, lighting, composition), but never changing their intent.
- Reply to the user in the language they used.
- Only ${AGENT_MODEL_OPTION_VALUES.map((value) => `"${value}"`).join(', ')} exist as image models. Never pass any other value as \`model\` — provider ids like "black-forest-labs/flux-dev" are not available here. If a generation fails, retry with the same model or one of those names; don't go looking for another engine.
- After a tool returns generated files, ALWAYS embed each one in your reply as a markdown image using the returned URL: ![description](<url>).
- If a tool returns an error, explain it briefly and suggest what the user can do (e.g. top up credits, try a simpler prompt). Never invent image paths.
- An error carrying \`"retryable": false\` is final — the provider refused these inputs and will refuse them again. End the turn there: no second call with a reworded prompt, no other model. Tell the user what was refused and what they could change (another source photo, a milder edit), in their language.
- Even for a retryable error, one retry is the limit. If it fails twice, stop and report it instead of burning the user's credits on a third attempt.`;

export interface RunAgentTurnParams {
  sessionId: string;
  userId: string;
  message: string;
  settings?: AgentGenerationSettings;
  signal?: AbortSignal;
}

type LlmProvider = 'openai' | 'anthropic';

interface LlmSetup {
  provider: LlmProvider;
  apiKey: string;
  baseURL?: string;
  apiType: 'openai-completions' | 'anthropic-messages';
  model: string;
}

/**
 * Resolve which LLM the agent talks to, entirely from Admin Settings.
 *
 * `default_llm_provider` picks the card whose credentials are used; `auto`
 * prefers OpenAI and falls back to Anthropic. The protocol follows from that
 * choice rather than being guessed from the URL — an OpenAI-compatible
 * gateway can live on any host.
 */
function resolveLlm(configs: Record<string, string>): LlmSetup | null {
  const openaiKey = configs.openai_api_key?.trim();
  const anthropicKey = configs.anthropic_api_key?.trim();
  const preference = configs.default_llm_provider?.trim() || 'auto';

  // Either preference still falls back to the other card, so a missing key
  // degrades to "whatever is configured" instead of a dead agent.
  const order: LlmProvider[] =
    preference === 'anthropic'
      ? ['anthropic', 'openai']
      : ['openai', 'anthropic'];

  const provider = order.find((name) =>
    name === 'openai' ? openaiKey : anthropicKey
  );
  if (!provider) return null;

  const model = configs.agent_model?.trim();
  if (provider === 'anthropic') {
    return {
      provider,
      apiKey: anthropicKey!,
      baseURL: normalizeAnthropicBaseUrl(configs.anthropic_base_url),
      apiType: 'anthropic-messages',
      model: model || 'claude-sonnet-4-6',
    };
  }
  return {
    provider,
    apiKey: openaiKey!,
    baseURL: normalizeOpenAIBaseUrl(configs.openai_base_url),
    apiType: 'openai-completions',
    model,
  };
}

/** Whether an LLM provider is configured in Admin Settings. */
export async function isAgentConfigured(): Promise<boolean> {
  const configs = await getAllConfigs();
  return (
    resolveFastClawConfig(configs) !== null || resolveLlm(configs) !== null
  );
}

/**
 * Run one chat turn through the in-process agent loop, yielding stream
 * events as they happen.
 */
export async function* runAgentTurn(
  params: RunAgentTurnParams
): AsyncGenerator<AgentStreamEvent> {
  const { sessionId, userId, message, settings, signal } = params;

  const configs = await getAllConfigs();
  const fastClaw = resolveFastClawConfig(configs);

  if (fastClaw) {
    let billingTaskId: string | undefined;
    try {
      await ensureFastClawUser({ config: fastClaw, userId });
      const history = await loadAgentHistory(sessionId, userId);
      const current = splitAttachedImages(message);
      const prompt =
        current.text.trim() ||
        'Create a tattoo design from the attached reference.';
      const images = Array.from(
        new Set([...collectConversationImages(history), ...current.images])
      );
      const billingTask = await createTask(
        createFastClawBillingTask({
          agentId: fastClaw.agentId,
          userId,
          sessionId,
          message: prompt,
          settings,
        })
      );
      const taskId = String(billingTask?.id ?? '');
      if (!taskId) throw new Error('FastClaw billing task was not created.');
      billingTaskId = taskId;
      await updateTask({
        taskId,
        status: AITaskStatus.PROCESSING,
      });

      const response = await fetch(
        createFastClawRequest({
          config: fastClaw,
          userId,
          sessionId,
          message: prompt,
          images,
          settings,
          signal,
        })
      );

      let responseText = '';
      for await (const event of readFastClawEvents(response)) {
        if (signal?.aborted) break;
        if (event.type === 'content') {
          responseText += String(event.data?.content ?? '');
        }
        yield event;
      }
      if (signal?.aborted) {
        throw new DOMException(
          'The FastClaw request was cancelled.',
          'AbortError'
        );
      }
      await updateTask({
        taskId,
        status: AITaskStatus.SUCCESS,
        taskResult: { response: responseText.slice(0, 20_000) },
      }).catch((err) => {
        console.error(
          `[fastclaw] failed to finalize billing task ${billingTaskId}`,
          err
        );
      });
    } catch (err: any) {
      if (billingTaskId) {
        await updateTask({
          taskId: billingTaskId,
          status: AITaskStatus.FAILED,
          taskResult: { error: String(err?.message ?? err).slice(0, 2_000) },
        }).catch((refundErr) => {
          console.error(
            `[fastclaw] failed to refund billing task ${billingTaskId}`,
            refundErr
          );
        });
      }
      if (err?.name !== 'AbortError' && !signal?.aborted) {
        yield {
          type: 'error',
          data: { message: String(err?.message ?? err) },
        };
        yield { type: 'done' };
      }
    }
    return;
  }

  const llm = resolveLlm(configs);

  if (!llm) {
    yield {
      type: 'error',
      data: {
        message:
          'The chat model is not configured: add an OpenAI or Anthropic API key under Admin Settings → AI.',
      },
    };
    yield { type: 'done' };
    return;
  }

  if (!llm.model) {
    yield {
      type: 'error',
      data: {
        message:
          'No chat model set: fill in Admin Settings → AI → Chat Model → Model (OpenAI-compatible endpoints have no safe default).',
      },
    };
    yield { type: 'done' };
    return;
  }

  // Stateless: the transcript comes from the database and goes back to it
  // (the chat route persists each round), so the SDK never reads or writes
  // session files — there's no disk to write to on Workers.
  const history = await loadAgentHistory(sessionId, userId);

  const agent = createAgent({
    model: llm.model,
    apiKey: llm.apiKey,
    baseURL: llm.baseURL,
    apiType: llm.apiType,
    sessionId,
    history,
    persistSession: false,
    systemPrompt: SYSTEM_PROMPT,
    tools: createAgentTools({
      userId,
      sessionId,
      settings,
      // What the user attached to *this* message. The tools use it to catch
      // an edit that quietly drops the photo the request was about.
      attachedImages: splitAttachedImages(message).images,
    }),
    maxTurns: 12,
    permissionMode: 'bypassPermissions',
    abortSignal: signal,
  });

  try {
    for await (const msg of agent.query(
      withGenerationSettings(
        withConversationImages(message, collectConversationImages(history)),
        settings
      )
    )) {
      if (signal?.aborted) break;
      switch (msg.type) {
        case 'assistant': {
          for (const block of msg.message.content) {
            if (block.type === 'text' && block.text) {
              yield { type: 'content', data: { content: block.text } };
            } else if (block.type === 'tool_use') {
              yield {
                type: 'tool_call',
                data: {
                  id: block.id,
                  name: block.name,
                  arguments: JSON.stringify(block.input ?? {}),
                },
              };
            }
          }
          break;
        }
        case 'tool_result': {
          yield {
            type: 'tool_result',
            data: {
              id: msg.result.tool_use_id,
              name: msg.result.tool_name,
              result: msg.result.output,
            },
          };
          break;
        }
        case 'result': {
          // The engine's failure results don't always set is_error (a plain
          // `subtype: 'error'` is emitted when the LLM call fails after
          // retries) — treat any non-success subtype as an error.
          if (msg.is_error || msg.subtype !== 'success') {
            const errors = Array.isArray(msg.errors)
              ? msg.errors.filter(Boolean).map(String)
              : [];
            yield {
              type: 'error',
              data: {
                message:
                  errors.join('; ') ||
                  String(msg.result || '') ||
                  `agent run failed (${msg.subtype})`,
              },
            };
          }
          break;
        }
        default:
          break;
      }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError' && !signal?.aborted) {
      yield {
        type: 'error',
        data: { message: String(err?.message ?? err) },
      };
    }
  } finally {
    // Closes MCP links and drops the engine; persistence is the database's
    // job (persistSession: false), so nothing is written here.
    await agent.close().catch(() => {});
  }

  yield { type: 'done' };
}

/**
 * Restate the conversation's images as a plain list on the turn.
 *
 * The URLs are all in the history, but as JSON inside tool results and
 * markdown inside replies — far enough from the tool call that "marry her"
 * was composing with the attachment alone and forgetting the portrait
 * generated two turns earlier. URLs the message already names (the just-
 * attached files) are skipped so each one appears once.
 */
function withConversationImages(message: string, images: string[]) {
  const earlier = images.filter((url) => !message.includes(url));
  if (earlier.length === 0) return message;
  const lines = earlier.map((url, index) => `- image ${index + 1}: ${url}`);
  return `${message}\n\nImages in this conversation (oldest first; use them as edit_image sources when the request refers to them):\n${lines.join('\n')}`;
}

function withGenerationSettings(
  message: string,
  settings: AgentGenerationSettings | undefined
) {
  if (!settings?.modelName && !settings?.aspectRatio && !settings?.resolution)
    return message;
  const lines = [
    '',
    'UI generation settings:',
    // The tools resolve this name to whatever id the active provider uses —
    // the agent should pass the name through, not invent a provider id.
    settings.modelName
      ? `- The user picked the "${settings.modelName}" image model. Leave the \`model\` argument of generate_image/edit_image empty so it is used, unless the user explicitly asks for a different one — in which case pick from ${AGENT_MODEL_OPTION_VALUES.join(', ')} and nothing else.`
      : '',
    settings.aspectRatio
      ? `- Use aspect_ratio "${settings.aspectRatio}" when calling generate_image or edit_image unless the user explicitly asks for a different aspect ratio.`
      : '',
    settings.resolution
      ? `- Target ${settings.resolution.toUpperCase()} output quality. If the selected image model supports a resolution/quality parameter, use it; otherwise incorporate "${settings.resolution.toUpperCase()} high-resolution, sharp detail" into the image prompt.`
      : '',
    settings.creditCost
      ? `- The selected image model costs ${settings.creditCost} credits per generation.`
      : '',
  ].filter(Boolean);
  return `${message}\n\n${lines.join('\n')}`;
}
