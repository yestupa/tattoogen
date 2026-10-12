import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runAgentTurn } from './service';

const mocks = vi.hoisted(() => ({
  updateTask: vi.fn(),
  getStorage: vi.fn(),
  readEvents: vi.fn(),
  persistFiles: vi.fn(),
}));

vi.mock('@/modules/config/service', () => ({
  getAllConfigs: async () => ({
    fastclaw_api_key: 'test-key',
    fastclaw_agent_id: 'test-agent',
    app_url: 'https://example.com',
  }),
}));
vi.mock('@/modules/ai-tasks/service', () => ({
  AITaskStatus: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    FAILED: 'failed',
  },
  createTask: async () => ({ id: 'task-1' }),
  updateTask: mocks.updateTask,
}));
vi.mock('@/modules/storage/service', () => ({ getStorage: mocks.getStorage }));
vi.mock('./fastclaw', () => ({
  resolveFastClawConfig: () => ({
    apiKey: 'test-key',
    agentId: 'test-agent',
    baseUrl: 'https://example.com',
  }),
  createFastClawBillingTask: () => ({ id: 'task-1' }),
  createFastClawRequest: () =>
    new Request('https://example.com/v1/chat/completions'),
  readFastClawEvents: mocks.readEvents,
  persistFastClawFiles: mocks.persistFiles,
  rewriteFastClawContent: (text: string) => text,
}));
vi.mock('./history', () => ({
  loadAgentHistory: async () => [],
  collectConversationImages: () => [],
}));
vi.mock('./usage', () => ({ ensureFastClawUser: async () => undefined }));

const params = {
  sessionId: 's-123',
  userId: 'user-1',
  message: 'Draw a butterfly',
};

describe('FastClaw image turn billing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('ok'))
    );
    mocks.getStorage.mockResolvedValue({ uploadFile: vi.fn() });
    mocks.updateTask.mockResolvedValue(undefined);
    mocks.persistFiles.mockResolvedValue([
      { path: 'design.png', url: 'https://example.com/design.png' },
    ]);
    mocks.readEvents.mockImplementation(async function* () {
      yield {
        type: 'files',
        data: {
          files: [
            {
              path: 'design.png',
              content_type: 'image/png',
              data_url: 'data:image/png;base64,AA==',
            },
          ],
        },
      };
      yield { type: 'done' };
    });
  });

  it('refunds a reserved image turn if the streaming client disconnects', async () => {
    const turn = runAgentTurn(params);
    expect((await turn.next()).value).toEqual({ type: 'progress' });
    await turn.return(undefined);
    expect(mocks.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 'task-1', status: 'failed' })
    );
  });

  it('does not call the paid provider when durable image storage is absent', async () => {
    mocks.getStorage.mockResolvedValue(null);
    const events = [];
    for await (const event of runAgentTurn(params)) events.push(event);
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.updateTask).not.toHaveBeenCalled();
    expect(events.some((event) => event.type === 'error')).toBe(true);
  });

  it('refunds a text-only turn and reports no generated image', async () => {
    mocks.persistFiles.mockResolvedValue([]);
    mocks.readEvents.mockImplementation(async function* () {
      yield { type: 'content', data: { content: 'I can help' } };
      yield { type: 'done' };
    });
    const events = [];
    for await (const event of runAgentTurn(params)) events.push(event);
    expect(mocks.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 'task-1', status: 'failed' })
    );
    expect(events.some((event) => event.type === 'tool_result')).toBe(false);
  });

  it('does not deliver an image as paid when SUCCESS finalization fails', async () => {
    mocks.updateTask.mockImplementation(
      async ({ status }: { status: string }) => {
        if (status === 'success') throw new Error('database unavailable');
      }
    );
    const events = [];
    for await (const event of runAgentTurn(params)) events.push(event);
    expect(events.some((event) => event.type === 'tool_result')).toBe(false);
    expect(mocks.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 'task-1', status: 'failed' })
    );
  });
});
