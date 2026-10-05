import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pricingApi = readFileSync(
  new URL('./pricing.ts', import.meta.url),
  'utf8'
);
const checkoutApi = readFileSync(
  new URL('./payment/checkout.ts', import.meta.url),
  'utf8'
);

describe('authoritative pricing endpoints', () => {
  it('revalidates public prices instead of serving stale charge amounts', () => {
    expect(pricingApi).toContain('max-age=0, must-revalidate');
    expect(pricingApi).not.toContain('max-age=60');
  });

  it('loads checkout price and Credits from the server catalog', () => {
    expect(checkoutApi).toContain('getEffectiveProduct(product_id)');
    expect(checkoutApi).toContain('credits: product.credits');
    expect(checkoutApi).toContain('amount: chargeAmount');
  });
});
