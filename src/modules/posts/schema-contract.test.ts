import { describe, expect, it } from 'vitest';

import * as schema from '@/config/db/schema';

describe('post translation schema', () => {
  it('exports the post translation table', () => {
    expect((schema as Record<string, unknown>).postTranslation).toBeDefined();
  });
});
