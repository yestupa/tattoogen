import type { SQL } from 'drizzle-orm';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST_SLUG_ERROR } from '@/lib/post-slug';

import {
  create,
  findPublishedBySlug,
  getPublishedLocaleAvailability,
  PostType,
  update,
} from './service';

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

describe('published blog article selection', () => {
  function capturePublishedWhere(withLimit: boolean) {
    let condition: SQL | undefined;
    fixture.database = {
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            where: (value: SQL) => {
              condition = value;
              return withLimit
                ? { limit: async () => [] }
                : Promise.resolve([]);
            },
          }),
        }),
      }),
    };
    return () => {
      expect(condition).toBeDefined();
      return new SQLiteSyncDialect().sqlToQuery(condition!).params;
    };
  }

  it('excludes published pages and logs from blog locale availability', async () => {
    const params = capturePublishedWhere(false);
    await getPublishedLocaleAvailability();
    expect(params()).toContain(PostType.ARTICLE);
  });

  it('does not resolve a published page or log as a blog article', async () => {
    const params = capturePublishedWhere(true);
    await findPublishedBySlug('tattoo-aftercare', 'en');
    expect(params()).toContain(PostType.ARTICLE);
  });
});
