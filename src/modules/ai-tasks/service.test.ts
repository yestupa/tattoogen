import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AITaskStatus, updateTask } from './service';

const mocks = vi.hoisted(() => ({
  revoke: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/core/db', () => ({
  db: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [{ taskInfo: '{"creditId":"spent-1"}' }],
        }),
      }),
    }),
    update: mocks.update,
  }),
}));
vi.mock('@/modules/credits/service', () => ({
  consume: vi.fn(),
  revoke: mocks.revoke,
}));

describe('AI task failure refunds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockReturnValue({
      set: () => ({ where: async () => undefined }),
    });
  });

  it('does not record failure as fully handled when credit reversal fails', async () => {
    mocks.revoke.mockRejectedValueOnce(new Error('credit ledger unavailable'));
    await expect(
      updateTask({ taskId: 'task-1', status: AITaskStatus.FAILED })
    ).rejects.toThrow('credit ledger unavailable');
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('records failure after reversing the consumed credit', async () => {
    mocks.revoke.mockResolvedValueOnce(undefined);
    await updateTask({ taskId: 'task-1', status: AITaskStatus.FAILED });
    expect(mocks.revoke).toHaveBeenCalledWith('spent-1');
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });
});
