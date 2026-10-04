import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./paypal.ts', import.meta.url), 'utf8');

describe('PayPal webhook event mapping', () => {
  it('maps each webhook event type only once', () => {
    const start = source.indexOf('private mapPayPalEventType');
    const end = source.indexOf('private mapPayPalStatus', start);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const eventMap = source.slice(start, end);
    const labels = [...eventMap.matchAll(/case '([^']+)'/g)].map(
      (match) => match[1]
    );
    const duplicates = labels.filter(
      (label, index) => labels.indexOf(label) !== index
    );

    expect(duplicates).toEqual([]);
  });
});
