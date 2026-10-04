import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../../../drizzle/0001_operations_release.sql', import.meta.url),
  'utf8'
);

describe('operations release migration', () => {
  it.each([
    'pricing_override',
    'discount',
    'discount_product',
    'post_translation',
    'contact_ticket',
    'contact_message',
    'fastclaw_user_mapping',
    'fastclaw_usage_cache',
    'notification_event',
  ])('creates %s', (table) => {
    expect(migration).toContain(`CREATE TABLE \`${table}\``);
  });

  it('only adds schema and never deletes existing records', () => {
    expect(migration).not.toMatch(
      /^\s*(?:DROP|DELETE\s+FROM|TRUNCATE|ALTER\s+TABLE)\b/im
    );
  });
});
