import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST_SLUG_ERROR } from '@/lib/post-slug';

import { create, update } from './service';

const fixture = vi.hoisted(() => ({
  database: {} as any,
}));

vi.mock('@/core/db', () => ({ db: () => fixture.database }));

describe('post service slug defense', () => {
  const insertValues = vi.fn();
  const updateSet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    insertValues.mockImplementation((value) => ({
      returning: async () => [value],
    }));
    updateSet.mockImplementation((value) => ({
      where: () => ({ returning: async () => [value] }),
    }));
    fixture.database = {
      insert: vi.fn(() => ({ values: insertValues })),
      update: vi.fn(() => ({ set: updateSet })),
    };
  });

  it('normalizes a valid slug before creating a post', async () => {
    await create({
      userId: 'user-1',
      slug: '  Tattoo-Style-101  ',
      title: 'Tattoo Style',
    });

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'tattoo-style-101' })
    );
  });

  it('rejects an invalid create slug before touching the database', async () => {
    await expect(
      create({ userId: 'user-1', slug: 'tattoo/style', title: 'Tattoo' })
    ).rejects.toThrow(POST_SLUG_ERROR);
    expect(fixture.database.insert).not.toHaveBeenCalled();
  });

  it('normalizes a valid update slug', async () => {
    await update('post-1', { slug: '  Fine-Line  ' });

    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'fine-line' })
    );
  });

  it('rejects an invalid update slug before touching the database', async () => {
    await expect(update('post-1', { slug: 'fine--line' })).rejects.toThrow(
      POST_SLUG_ERROR
    );
    expect(fixture.database.update).not.toHaveBeenCalled();
  });
});
