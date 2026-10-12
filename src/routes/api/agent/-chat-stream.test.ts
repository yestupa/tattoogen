import { describe, expect, it, vi } from 'vitest';

import { POST } from './chat';

const mocks = vi.hoisted(() => ({ appendMessage: vi.fn() }));

vi.mock('@/core/auth', () => ({
  getAuth: () => ({
    api: { getSession: async () => ({ user: { id: 'user-1' } }) },
  }),
}));
vi.mock('@/modules/agent/paywall', () => ({
  checkCredits: () => ({ allowed: true }),
  insufficientCreditsBody: () => ({}),
}));
vi.mock('@/modules/agent/service', () => ({
  runAgentTurn: async function* () {
    await new Promise((resolve) => setTimeout(resolve, 10));
    yield {
      type: 'tool_call',
      data: { id: 'image-1', name: 'generate_image', arguments: '{}' },
    };
    yield {
      type: 'tool_result',
      data: {
        id: 'image-1',
        result: JSON.stringify({ files: ['https://example.com/design.png'] }),
      },
    };
    yield {
      type: 'content',
      data: { content: '![design](https://example.com/design.png)' },
    };
    yield { type: 'done' };
  },
}));
vi.mock('@/modules/chats/service', () => ({
  ensureChat: async () => undefined,
  appendMessage: mocks.appendMessage,
}));
vi.mock('@/modules/credits/service', () => ({ getBalance: async () => 100 }));
vi.mock('@/modules/subscriptions/service', () => ({
  getCurrentSubscription: async () => null,
}));

describe('agent result persistence after browser disconnect', () => {
  it('saves generated image tool results even when the SSE reader is cancelled', async () => {
    mocks.appendMessage.mockReset().mockResolvedValue(undefined);
    const response = await POST({
      request: new Request('https://example.com/api/agent/chat', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 's-1791783727607-whh39q',
          message: 'Draw a tattoo',
        }),
      }),
    });
    expect(response.status).toBe(200);
    await response.body!.getReader().cancel();

    await vi.waitFor(() => {
      const assistantCalls = mocks.appendMessage.mock.calls
        .map(([call]) => call)
        .filter((call) => call.role === 'assistant');
      expect(
        assistantCalls.some((call) =>
          call.parts.some(
            (part: { type: string; result?: string }) =>
              part.type === 'tool_call' &&
              part.result?.includes('https://example.com/design.png')
          )
        )
      ).toBe(true);
    });
  });
});
