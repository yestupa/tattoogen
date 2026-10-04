import { describe, expect, it } from 'vitest';

import * as schema from '@/config/db/schema';

describe('commerce schema', () => {
  it('exports pricing and discount tables', () => {
    const tables = schema as Record<string, unknown>;

    expect(tables.pricingOverride).toBeDefined();
    expect(tables.discount).toBeDefined();
    expect(tables.discountProduct).toBeDefined();
  });
});
