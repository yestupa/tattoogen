import { describe, expect, it } from 'vitest';

import {
  createFastClawBillingTask,
  createFastClawRequest,
  createFastClawUsageRequest,
  createFastClawUserRequest,
  normalizeFastClawUsage,
  persistFastClawFiles,
  readFastClawEvents,
  resolveFastClawConfig,
  rewriteFastClawContent,
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
  it('provisions a stable upstream user and queries its usage server-side', async () => {
    const config = {
      apiKey: 'test-key',
      baseUrl: 'https://cloud.fastclaw.ai/',
      agentId: 'agt_test',
    };
    const provision = createFastClawUserRequest({
      config,
      externalId: 'tattoo-generator:user-42',
      displayName: 'Avery',
    });
    expect(provision.url).toBe('https://cloud.fastclaw.ai/v1/users');
    expect(provision.headers.get('authorization')).toBe('Bearer test-key');
    expect(await provision.json()).toEqual({
      external_id: 'tattoo-generator:user-42',
      display_name: 'Avery',
    });

    const usage = createFastClawUsageRequest({
      config,
      fastClawUserId: 'u_123',
      days: 30,
    });
    expect(usage.url).toBe(
      'https://cloud.fastclaw.ai/v1/usage?user_id=u_123&days=30'
    );
  });

  it('normalizes usage totals without trusting malformed upstream values', () => {
    expect(
      normalizeFastClawUsage({
        userId: 'u_123',
        days: 30,
        daily: [{ day: '2026-09-01', inputTokens: 12 }],
        totals: {
          inputTokens: 100,
          outputTokens: 40,
          cacheReadTokens: -3,
          cacheCreationTokens: 'bad',
          requestCount: 2,
        },
      })
    ).toEqual({
      totals: {
        inputTokens: 100,
        outputTokens: 40,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        requestCount: 2,
      },
      daily: [{ day: '2026-09-01', inputTokens: 12 }],
    });
  });

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
      return_files: 'inline',
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

  it('keeps generated file metadata from the final SSE chunk', async () => {
    const files = [
      {
        name: 'tattoo.png',
        path: 'tattoo.png',
        content_type: 'image/png',
        data_url: 'data:image/png;base64,iVBORw0KGgo=',
      },
    ];
    const response = streamResponse([
      'data: {"choices":[{"delta":{"content":"Done: ![tattoo](/workspace/tattoo.png)"}}]}\n\n',
      `data: ${JSON.stringify({ choices: [{ finish_reason: 'stop' }], files })}\n\n`,
      'data: [DONE]\n\n',
    ]);

    await expect(collectEvents(response)).resolves.toEqual([
      {
        type: 'content',
        data: { content: 'Done: ![tattoo](/workspace/tattoo.png)' },
      },
      { type: 'files', data: { files } },
      { type: 'done' },
    ]);
  });

  it('rejects an empty successful response so a blank image cannot be billed', async () => {
    await expect(
      collectEvents(streamResponse(['data: [DONE]\n\n']))
    ).rejects.toThrow('FastClaw returned no content or files');
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

describe('FastClaw generated files', () => {
  const config = {
    apiKey: 'test-key',
    baseUrl: 'https://cloud.fastclaw.ai',
    agentId: 'agt_test',
  };
  const png =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==';

  it('copies an inline image into public storage and rewrites workspace links', async () => {
    const uploads: Array<{
      key: string;
      contentType: string;
      body: Uint8Array;
    }> = [];
    const stored = await persistFastClawFiles({
      files: [
        {
          name: 'tattoo.png',
          path: 'tattoo.png',
          content_type: 'image/png',
          data_url: `data:image/png;base64,${png}`,
        },
      ],
      config,
      userId: 'user-42',
      sessionId: 's-1791783727607-whh39q',
      upload: async (input) => {
        uploads.push(input);
        return { success: true, url: 'https://cdn.example.com/tattoo.png' };
      },
    });

    expect(uploads).toHaveLength(1);
    expect(uploads[0].key).toMatch(
      /^agent\/sessions\/s-1791783727607-whh39q\/fastclaw_/
    );
    expect(uploads[0].contentType).toBe('image/png');
    expect(uploads[0].body.byteLength).toBeGreaterThan(8);
    expect(stored).toEqual([
      { path: 'tattoo.png', url: 'https://cdn.example.com/tattoo.png' },
    ]);
    expect(
      rewriteFastClawContent('Done: ![tattoo](/workspace/tattoo.png)', stored)
    ).toBe('Done: ![tattoo](https://cdn.example.com/tattoo.png)');
  });

  it('downloads a private FastClaw file with server credentials only', async () => {
    const requests: Request[] = [];
    const stored = await persistFastClawFiles({
      files: [
        {
          name: 'tattoo.png',
          path: 'tattoo.png',
          content_type: 'image/png',
          url: 'https://cloud.fastclaw.ai/v1/agents/agt_test/sessions/conv/files/tattoo.png',
        },
      ],
      config,
      userId: 'user-42',
      sessionId: 's-1791783727607-whh39q',
      fetchPrivate: async (request) => {
        requests.push(request);
        return new Response(Buffer.from(png, 'base64'), {
          headers: { 'content-type': 'image/png' },
        });
      },
      upload: async () => ({
        success: true,
        url: 'https://cdn.example.com/tattoo.png',
      }),
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get('authorization')).toBe('Bearer test-key');
    expect(requests[0].headers.get('x-fastclaw-end-user')).toBe(
      'tattoo-generator:user-42'
    );
    expect(stored[0].url).toBe('https://cdn.example.com/tattoo.png');
  });

  it('refuses an off-origin private file URL', async () => {
    await expect(
      persistFastClawFiles({
        files: [
          {
            name: 'tattoo.png',
            path: 'tattoo.png',
            content_type: 'image/png',
            url: 'https://attacker.example/file.png',
          },
        ],
        config,
        userId: 'user-42',
        sessionId: 's-1791783727607-whh39q',
        fetchPrivate: async () => {
          throw new Error('should not fetch');
        },
        upload: async () => ({
          success: true,
          url: 'https://cdn.example.com/tattoo.png',
        }),
      })
    ).rejects.toThrow('Unexpected FastClaw file URL');
  });

  it('stops a private image download that exceeds the size cap without a content-length header', async () => {
    let uploaded = false;
    await expect(
      persistFastClawFiles({
        files: [
          {
            path: 'large.png',
            content_type: 'image/png',
            url: 'https://cloud.fastclaw.ai/v1/agents/agt_test/sessions/conv/files/large.png',
          },
        ],
        config,
        userId: 'user-42',
        sessionId: 's-1791783727607-whh39q',
        fetchPrivate: async () =>
          new Response(
            new ReadableStream({
              start(controller) {
                const chunk = new Uint8Array(1024 * 1024);
                for (let i = 0; i < 11; i++) controller.enqueue(chunk);
                controller.close();
              },
            })
          ),
        upload: async () => {
          uploaded = true;
          return { success: true, url: 'https://cdn.example.com/large.png' };
        },
      })
    ).rejects.toThrow('oversized');
    expect(uploaded).toBe(false);
  });

  it('appends a public image when the agent reply omitted its markdown', () => {
    expect(
      rewriteFastClawContent('Your design is ready.', [
        { path: 'tattoo.png', url: 'https://cdn.example.com/tattoo.png' },
      ])
    ).toContain('![tattoo.png](https://cdn.example.com/tattoo.png)');
  });
});
