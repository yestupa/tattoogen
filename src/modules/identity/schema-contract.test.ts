import { describe, expect, it } from 'vitest';

import * as schema from '@/config/db/schema';

describe('identity operations schema', () => {
  it('exports FastClaw metering and notification tables', () => {
    const tables = schema as Record<string, unknown>;

    expect(tables.fastclawUserMapping).toBeDefined();
    expect(tables.fastclawUsageCache).toBeDefined();
    expect(tables.notificationEvent).toBeDefined();
  });
});
