import { describe, expect, it } from 'vitest';

import * as schema from '@/config/db/schema';

describe('contact schema', () => {
  it('exports guest contact ticket tables', () => {
    const tables = schema as Record<string, unknown>;

    expect(tables.contactTicket).toBeDefined();
    expect(tables.contactMessage).toBeDefined();
  });
});
