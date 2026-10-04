import { describe, expect, it } from 'vitest';

import { pricingCatalog } from '@/config/pricing';

import { applyPercentageDiscount, resolveEffectiveProduct } from './service';

describe('commerce catalog rules', () => {
  it('uses a valid override and the highest active discount', () => {
    const product = resolveEffectiveProduct({
      product: pricingCatalog.pro_monthly,
      override: {
        productId: 'pro_monthly',
        priceInCents: 2500,
        credits: 6000,
        creditsValidDays: 30,
        enabled: true,
      },
      discounts: [
        {
          id: 'ten',
          displayNameEn: 'Ten percent off',
          displayNameZh: '九折',
          percentage: 10,
          startsAt: new Date('2026-10-01T00:00:00Z'),
          endsAt: new Date('2026-11-01T00:00:00Z'),
        },
        {
          id: 'twenty-five',
          displayNameEn: 'Twenty-five percent off',
          displayNameZh: '七五折',
          percentage: 25,
          startsAt: new Date('2026-10-02T00:00:00Z'),
          endsAt: new Date('2026-11-01T00:00:00Z'),
        },
      ],
    });

    expect(product.basePriceInCents).toBe(2500);
    expect(product.priceInCents).toBe(1875);
    expect(product.credits).toBe(6000);
    expect(product.discount?.id).toBe('twenty-five');
  });

  it('never returns a zero-cent paid product', () => {
    expect(applyPercentageDiscount(1, 99)).toBe(1);
  });

  it('ignores invalid overrides and breaks discount ties by earliest start', () => {
    const product = resolveEffectiveProduct({
      product: pricingCatalog.lite_monthly,
      override: {
        productId: 'lite_monthly',
        priceInCents: -1,
        credits: 0,
        creditsValidDays: 0,
        enabled: true,
      },
      discounts: [
        {
          id: 'later',
          displayNameEn: 'Later',
          displayNameZh: '',
          percentage: 20,
          startsAt: new Date('2026-10-03T00:00:00Z'),
          endsAt: new Date('2026-11-01T00:00:00Z'),
        },
        {
          id: 'earlier',
          displayNameEn: 'Earlier',
          displayNameZh: '',
          percentage: 20,
          startsAt: new Date('2026-10-01T00:00:00Z'),
          endsAt: new Date('2026-11-01T00:00:00Z'),
        },
      ],
    });

    expect(product.basePriceInCents).toBe(990);
    expect(product.discount?.id).toBe('earlier');
  });
});
