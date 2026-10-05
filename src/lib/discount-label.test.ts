import { describe, expect, it } from 'vitest';

import { getDiscountDisplayName } from './discount-label';

describe('discount display name', () => {
  const discount = {
    displayNameEn: 'Launch offer',
    displayNameZh: '上线优惠',
  };

  it('uses the name for the active locale', () => {
    expect(getDiscountDisplayName(discount, 'en')).toBe('Launch offer');
    expect(getDiscountDisplayName(discount, 'zh')).toBe('上线优惠');
  });

  it('falls back to English when the Chinese name is empty', () => {
    expect(
      getDiscountDisplayName({ ...discount, displayNameZh: ' ' }, 'zh')
    ).toBe('Launch offer');
  });
});
