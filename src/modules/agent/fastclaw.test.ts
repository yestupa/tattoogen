import { describe, expect, it } from 'vitest';

import {
  createFastClawBillingTask,
  createFastClawRequest,
  readFastClawEvents,
  resolveFastClawConfig,
} from './fastclaw';

async function collectEvents(response: Response) {
  const events = [];
  for await (const event of readFastClawEvents(response)) events.push(event);
  return events;
}

function streamResponse(chunks: string[], status = 200) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
    {
      status,
      headers: { 'content-type': 'text/event-stream' },
    }
  );
}

describe('FastClaw configuration', () => {
  it('uses the tattoo agent defaults once a key is configured', () => {
    expect(resolveFastClawConfig({ fastclaw_api_key: '  test-key  ' })).toEqual(
      {
        apiKey: 'test-key',
        baseUrl: 'https://cloud.fastclaw.ai',
        agentId: 'agt_1d82e3db42549e69c6ff',
      }
    );
  });

  it('stays disabled when no server-side key is configured', () => {
    expect(resolveFastClawConfig({ fastclaw_api_key: '  ' })).toBeNull();
  });
});

describe('FastClaw request contract', () => {
  it('sends stable app identity, conversation identity, images, and settings', async () => {
    const request = createFastClawRequest({
      config: {
        apiKey: 'test-key',
        baseUrl: 'https://cloud.fastclaw.ai/',
        agentId: 'agt_test',
      },
      userId: 'user-42',
      sessionId: 'chat-123',
      message: 'Design a fine-line crane tattoo.',
      images: ['https://cdn.example.com/reference.png'],
      settings: {
        modelName: 'nano-banana-2',
        aspectRatio: '3:4',
        resolution: '2k',
      },
    });

    expect(request.url).toBe('https://cloud.fastclaw.ai/v1/chat/completions');
    expect(request.headers.get('authorization')).toBe('Bearer test-key');
    expect(request.headers.get('x-fastclaw-session-key')).toBe(
      'tattoo-generator:user-42:chat-123'
    );
    expect(await request.json()).toEqual({
      agent_id: 'agt_test',
      stream: true,
      user: 'tattoo-generator:user-42',
      messages: [{ role: 'user', content: 'Design a fine-line crane tattoo.' }],
      images: ['https://cdn.example.com/reference.png'],
      params: {
        app: 'tattoo-generator',
        conversation_id: 'chat-123',
        selected_image_model: 'nano-banana-2',
        aspect_ratio: '3:4',
        resolution: '2k',
      },
    });
  });

  it('prices a FastClaw turn from the trusted server model catalog', () => {
    expect(
      createFastClawBillingTask({
        agentId: 'agt_test',
        userId: 'user-42',
        sessionId: 'chat-123',
        message: 'Design a fine-line crane tattoo.',
        settings: {
          modelName: 'nano-banana-2',
          creditCost: 0,
        },
      })
    ).toMatchObject({
      userId: 'user-42',
      mediaType: 'image',
      provider: 'fastclaw',
      model: 'agt_test:nano-banana-2',
      prompt: 'Design a fine-line crane tattoo.',
      costCredits: 40,
      options: { sessionId: 'chat-123' },
    });
  });
});

describe('FastClaw streaming responses', () => {
  it('reads OpenAI SSE chunks split across arbitrary network boundaries', async () => {
    const response = streamResponse([
      ': keep-alive\n\n',
      'data: {"choices":[{"delta":{"content":"Your tattoo"}}]}\n',
      '\ndata: {"choices":[{"delta":{"content":" is ready."}}]}\n\n',
      'data: [DONE]\n\n',
    ]);

    await expect(collectEvents(response)).resolves.toEqual([
      { type: 'content', data: { content: 'Your tattoo' } },
      { type: 'content', data: { content: ' is ready.' } },
      { type: 'done' },
    ]);
  });

  it('supports a non-streaming OpenAI response', async () => {
    const response = Response.json({
      choices: [
        {
          message: { content: '![tattoo](https://cdn.example.com/tattoo.png)' },
        },
      ],
    });

    await expect(collectEvents(response)).resolves.toEqual([
      {
        type: 'content',
        data: {
          content: '![tattoo](https://cdn.example.com/tattoo.png)',
        },
      },
      { type: 'done' },
    ]);
  });

  it('surfaces an upstream error without leaking credentials', async () => {
    const response = Response.json(
      { error: { message: 'agent not accessible' } },
      { status: 404 }
    );

    await expect(collectEvents(response)).rejects.toThrow(
      'FastClaw request failed with status 404: agent not accessible'
    );
  });

  it('redacts FastClaw-shaped credentials echoed by an upstream error', async () => {
    const response = new Response(
      'request rejected for fc_example_secret_1234567890 and fcak_current_secret_1234567890',
      { status: 401 }
    );

    await expect(collectEvents(response)).rejects.toThrow(
      'FastClaw request failed with status 401: request rejected for redacted and redacted'
    );
  });
});
