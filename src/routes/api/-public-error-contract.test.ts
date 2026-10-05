import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

describe('public API error disclosure', () => {
  it.each([
    ['./contact.ts', 'Unable to submit ticket'],
    ['./pricing.ts', 'Unable to load pricing'],
    ['./payment/checkout.ts', 'Checkout failed'],
  ])('returns a stable public error from %s', (path, message) => {
    const text = source(path);
    expect(text).toContain(`return respErr('${message}'`);
    expect(text).not.toMatch(/respErr\(error\.message/);
  });
});
