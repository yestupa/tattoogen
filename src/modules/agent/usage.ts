import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';

import { db } from '@/core/db';
import {
  fastclawUsageCache,
  fastclawUserMapping,
  user,
} from '@/config/db/schema';
import { getAllConfigs } from '@/modules/config/service';
import { getUuid } from '@/lib/hash';

import {
  createFastClawUsageRequest,
  createFastClawUserRequest,
  normalizeFastClawUsage,
  resolveFastClawConfig,
  type FastClawConfig,
  type NormalizedFastClawUsage,
} from './fastclaw';

const USAGE_CACHE_MS = 10 * 60_000;

export function fastClawExternalId(userId: string) {
  return `tattoo-generator:${userId}`;
}

async function findMapping(userId: string) {
  const [mapping] = await db()
    .select()
    .from(fastclawUserMapping)
    .where(eq(fastclawUserMapping.userId, userId))
    .limit(1);
  return mapping;
}

export async function ensureFastClawUser(params: {
  config: FastClawConfig;
  userId: string;
  displayName?: string;
}) {
  const existing = await findMapping(params.userId);
  if (existing) return existing;

  const externalId = fastClawExternalId(params.userId);
  const response = await fetch(
    createFastClawUserRequest({
      config: params.config,
      externalId,
      displayName: params.displayName,
    })
  );
  if (!response.ok) {
    throw new Error(
      `FastClaw user provisioning failed with status ${response.status}`
    );
  }
  const payload = (await response.json().catch(() => null)) as {
    user_id?: unknown;
    external_id?: unknown;
  } | null;
  const fastClawUserId =
    typeof payload?.user_id === 'string' ? payload.user_id.trim() : '';
  if (!fastClawUserId) {
    throw new Error('FastClaw user provisioning returned no user ID');
  }

  const now = new Date();
  try {
    const [created] = await db()
      .insert(fastclawUserMapping)
      .values({
        userId: params.userId,
        externalId,
        fastclawUserId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  } catch (error) {
    const raced = await findMapping(params.userId);
    if (raced) return raced;
    throw error;
  }
}

function parseCache(row: {
  totalsJson: string;
  dailyJson: string;
}): NormalizedFastClawUsage {
  try {
    return normalizeFastClawUsage({
      totals: JSON.parse(row.totalsJson),
      daily: JSON.parse(row.dailyJson),
    });
  } catch {
    return normalizeFastClawUsage(null);
  }
}

async function saveUsageCache(params: {
  userId: string;
  days: number;
  usage: NormalizedFastClawUsage;
}) {
  const now = new Date();
  const values = {
    totalsJson: JSON.stringify(params.usage.totals),
    dailyJson: JSON.stringify(params.usage.daily),
    fetchedAt: now,
  };
  const updated = await db()
    .update(fastclawUsageCache)
    .set(values)
    .where(
      and(
        eq(fastclawUsageCache.userId, params.userId),
        eq(fastclawUsageCache.days, params.days)
      )
    )
    .returning({ id: fastclawUsageCache.id });
  if (updated.length) return;

  try {
    await db()
      .insert(fastclawUsageCache)
      .values({
        id: getUuid(),
        userId: params.userId,
        days: params.days,
        ...values,
      });
  } catch {
    await db()
      .update(fastclawUsageCache)
      .set(values)
      .where(
        and(
          eq(fastclawUsageCache.userId, params.userId),
          eq(fastclawUsageCache.days, params.days)
        )
      );
  }
}

export async function getFastClawUsage(params: {
  config: FastClawConfig;
  userId: string;
  fastClawUserId: string;
  days: number;
  force?: boolean;
}) {
  const days = Math.min(90, Math.max(1, Math.floor(params.days)));
  const [cached] = await db()
    .select()
    .from(fastclawUsageCache)
    .where(
      and(
        eq(fastclawUsageCache.userId, params.userId),
        eq(fastclawUsageCache.days, days)
      )
    )
    .limit(1);

  const fetchedAt = cached?.fetchedAt
    ? new Date(cached.fetchedAt).getTime()
    : 0;
  if (!params.force && cached && Date.now() - fetchedAt < USAGE_CACHE_MS) {
    return { ...parseCache(cached), fetchedAt: cached.fetchedAt, stale: false };
  }

  try {
    const response = await fetch(
      createFastClawUsageRequest({
        config: params.config,
        fastClawUserId: params.fastClawUserId,
        days,
      })
    );
    if (!response.ok) {
      throw new Error(`FastClaw usage failed with status ${response.status}`);
    }
    const usage = normalizeFastClawUsage(await response.json());
    await saveUsageCache({ userId: params.userId, days, usage });
    return { ...usage, fetchedAt: new Date(), stale: false };
  } catch (error) {
    if (cached) {
      return {
        ...parseCache(cached),
        fetchedAt: cached.fetchedAt,
        stale: true,
      };
    }
    throw error;
  }
}

export async function listFastClawUserUsage(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  days?: number;
  force?: boolean;
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
  const days = Math.min(90, Math.max(1, Math.floor(params.days ?? 30)));
  const conditions: SQL[] = [];
  if (params.search) {
    conditions.push(
      or(
        like(user.email, `%${params.search}%`),
        like(user.name, `%${params.search}%`)
      )!
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const countQuery = db().select({ count: count() }).from(user);
  const [countResult] = await (where ? countQuery.where(where) : countQuery);
  const listQuery = db()
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      fastClawUserId: fastclawUserMapping.fastclawUserId,
    })
    .from(user)
    .leftJoin(fastclawUserMapping, eq(fastclawUserMapping.userId, user.id));
  const rows = await (where ? listQuery.where(where) : listQuery)
    .orderBy(desc(user.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const config = resolveFastClawConfig(await getAllConfigs());
  const items = await Promise.all(
    rows.map(async (row: (typeof rows)[number]) => {
      const empty = normalizeFastClawUsage(null);
      if (!config || !row.fastClawUserId) {
        return {
          ...row,
          ...empty.totals,
          totalTokens: 0,
          fetchedAt: null,
          stale: false,
          status: !config ? 'unavailable' : 'unused',
        };
      }
      try {
        const usage = await getFastClawUsage({
          config,
          userId: row.userId,
          fastClawUserId: row.fastClawUserId,
          days,
          force: params.force,
        });
        const totalTokens =
          usage.totals.inputTokens +
          usage.totals.outputTokens +
          usage.totals.cacheReadTokens +
          usage.totals.cacheCreationTokens;
        return {
          ...row,
          ...usage.totals,
          totalTokens,
          fetchedAt: usage.fetchedAt,
          stale: usage.stale,
          status: 'ready',
        };
      } catch {
        return {
          ...row,
          ...empty.totals,
          totalTokens: 0,
          fetchedAt: null,
          stale: false,
          status: 'error',
        };
      }
    })
  );

  return {
    items,
    total: countResult.count,
    configured: !!config,
    days,
  };
}
