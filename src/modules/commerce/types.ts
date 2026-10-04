import type { PricingProduct } from '@/config/pricing';

export type EffectiveDiscount = {
  id: string;
  displayNameEn: string;
  displayNameZh: string;
  percentage: number;
  startsAt: Date;
  endsAt: Date;
};

export type PricingOverrideInput = {
  productId: string;
  priceInCents: number;
  credits: number;
  creditsValidDays: number;
  enabled: boolean;
};

export type EffectivePricingProduct = PricingProduct & {
  basePriceInCents: number;
  enabled: boolean;
  discount: EffectiveDiscount | null;
};

export type DiscountInput = {
  id?: string;
  internalName: string;
  displayNameEn: string;
  displayNameZh?: string;
  percentage: number;
  startsAt: Date;
  endsAt: Date;
  enabled: boolean;
  productIds: string[];
};
