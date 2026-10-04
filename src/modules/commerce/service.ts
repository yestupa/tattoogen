import { and, desc, eq, gt, inArray, lte } from 'drizzle-orm';

import { db } from '@/core/db';
import { discount, discountProduct, pricingOverride } from '@/config/db/schema';
import {
  getPricingProduct,
  listPricingProducts,
  type PricingProduct,
} from '@/config/pricing';
import { getUuid } from '@/lib/hash';

import type {
  DiscountInput,
  EffectiveDiscount,
  EffectivePricingProduct,
  PricingOverrideInput,
} from './types';

type ResolvableOverride = PricingOverrideInput | null | undefined;

function validPositiveInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function applyPercentageDiscount(
  priceInCents: number,
  percentage: number
): number {
  if (!validPositiveInteger(priceInCents)) {
    throw new Error('Price must be a positive integer');
  }
  if (!Number.isInteger(percentage) || percentage < 1 || percentage > 99) {
    throw new Error('Discount percentage must be between 1 and 99');
  }
  return Math.max(1, Math.round(priceInCents * (1 - percentage / 100)));
}

function isValidOverride(
  value: ResolvableOverride
): value is PricingOverrideInput {
  return Boolean(
    value &&
    validPositiveInteger(value.priceInCents) &&
    validPositiveInteger(value.credits) &&
    validPositiveInteger(value.creditsValidDays)
  );
}

function chooseDiscount(
  discounts: EffectiveDiscount[]
): EffectiveDiscount | null {
  return (
    [...discounts].sort((a, b) => {
      if (a.percentage !== b.percentage) return b.percentage - a.percentage;
      return a.startsAt.getTime() - b.startsAt.getTime();
    })[0] ?? null
  );
}

export function resolveEffectiveProduct(params: {
  product: PricingProduct;
  override?: ResolvableOverride;
  discounts?: EffectiveDiscount[];
}): EffectivePricingProduct {
  const { product, override, discounts = [] } = params;
  const useOverride = isValidOverride(override);
  const basePriceInCents = useOverride
    ? override.priceInCents
    : product.priceInCents;
  const activeDiscount = chooseDiscount(discounts);

  return {
    ...product,
    priceInCents: activeDiscount
      ? applyPercentageDiscount(basePriceInCents, activeDiscount.percentage)
      : basePriceInCents,
    basePriceInCents,
    credits: useOverride ? override.credits : product.credits,
    creditsValidDays: useOverride
      ? override.creditsValidDays
      : product.creditsValidDays,
    enabled: useOverride ? override.enabled : true,
    discount: activeDiscount,
  };
}

function toEffectiveDiscount(row: typeof discount.$inferSelect) {
  return {
    id: row.id,
    displayNameEn: row.displayNameEn,
    displayNameZh: row.displayNameZh,
    percentage: row.percentage,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  } satisfies EffectiveDiscount;
}

export async function listEffectiveProducts(
  now = new Date()
): Promise<EffectivePricingProduct[]> {
  const products = listPricingProducts();
  const productIds = products.map((item) => item.productId);
  const database = db();

  const overrides: Array<typeof pricingOverride.$inferSelect> =
    productIds.length
      ? await database
          .select()
          .from(pricingOverride)
          .where(inArray(pricingOverride.productId, productIds))
      : [];

  const activeDiscounts: Array<{
    productId: string;
    discount: typeof discount.$inferSelect;
  }> = productIds.length
    ? await database
        .select({
          productId: discountProduct.productId,
          discount,
        })
        .from(discountProduct)
        .innerJoin(discount, eq(discountProduct.discountId, discount.id))
        .where(
          and(
            inArray(discountProduct.productId, productIds),
            eq(discount.enabled, true),
            lte(discount.startsAt, now),
            gt(discount.endsAt, now)
          )
        )
    : [];

  const overrideMap = new Map(overrides.map((item) => [item.productId, item]));
  const discountMap = new Map<string, EffectiveDiscount[]>();
  for (const row of activeDiscounts) {
    const current = discountMap.get(row.productId) ?? [];
    current.push(toEffectiveDiscount(row.discount));
    discountMap.set(row.productId, current);
  }

  return products.map((product) =>
    resolveEffectiveProduct({
      product,
      override: overrideMap.get(product.productId),
      discounts: discountMap.get(product.productId),
    })
  );
}

export async function getEffectiveProduct(
  productId: string,
  now = new Date()
): Promise<EffectivePricingProduct | null> {
  if (!getPricingProduct(productId)) return null;
  const products = await listEffectiveProducts(now);
  return products.find((item) => item.productId === productId) ?? null;
}

export async function savePricingOverride(
  input: PricingOverrideInput,
  updatedBy: string
) {
  if (!getPricingProduct(input.productId)) throw new Error('Unknown product');
  if (!validPositiveInteger(input.priceInCents)) {
    throw new Error('Price must be a positive integer');
  }
  if (!validPositiveInteger(input.credits)) {
    throw new Error('Credits must be a positive integer');
  }
  if (!validPositiveInteger(input.creditsValidDays)) {
    throw new Error('Credit validity must be a positive integer');
  }

  const database = db();
  const [existing] = await database
    .select({ productId: pricingOverride.productId })
    .from(pricingOverride)
    .where(eq(pricingOverride.productId, input.productId))
    .limit(1);

  if (existing) {
    const [result] = await database
      .update(pricingOverride)
      .set({ ...input, updatedBy, updatedAt: new Date() })
      .where(eq(pricingOverride.productId, input.productId))
      .returning();
    return result;
  }

  const [result] = await database
    .insert(pricingOverride)
    .values({ ...input, updatedBy })
    .returning();
  return result;
}

export async function listDiscounts() {
  const database = db();
  const rows: Array<typeof discount.$inferSelect> = await database
    .select()
    .from(discount)
    .orderBy(desc(discount.startsAt), desc(discount.createdAt));
  if (!rows.length) return [];
  const targets: Array<typeof discountProduct.$inferSelect> = await database
    .select()
    .from(discountProduct)
    .where(
      inArray(
        discountProduct.discountId,
        rows.map((row) => row.id)
      )
    );
  const targetsByDiscount = new Map<string, string[]>();
  for (const target of targets) {
    const current = targetsByDiscount.get(target.discountId) ?? [];
    current.push(target.productId);
    targetsByDiscount.set(target.discountId, current);
  }
  return rows.map((row) => ({
    ...row,
    productIds: targetsByDiscount.get(row.id) ?? [],
  }));
}

function validateDiscountInput(input: DiscountInput) {
  if (!input.internalName.trim()) throw new Error('Internal name is required');
  if (!input.displayNameEn.trim()) throw new Error('Display name is required');
  if (
    !Number.isInteger(input.percentage) ||
    input.percentage < 1 ||
    input.percentage > 99
  ) {
    throw new Error('Discount percentage must be between 1 and 99');
  }
  if (
    !(input.startsAt instanceof Date) ||
    Number.isNaN(input.startsAt.valueOf())
  ) {
    throw new Error('Invalid start time');
  }
  if (!(input.endsAt instanceof Date) || Number.isNaN(input.endsAt.valueOf())) {
    throw new Error('Invalid end time');
  }
  if (input.endsAt <= input.startsAt) {
    throw new Error('End time must be after start time');
  }
  const productIds = [...new Set(input.productIds)];
  if (!productIds.length) throw new Error('Choose at least one product');
  for (const productId of productIds) {
    if (!getPricingProduct(productId)) throw new Error('Unknown product');
  }
  return productIds;
}

export async function saveDiscount(input: DiscountInput, createdBy: string) {
  const productIds = validateDiscountInput(input);
  const database = db();
  const id = input.id || getUuid();
  return database.transaction(async (tx: any) => {
    const values = {
      internalName: input.internalName.trim(),
      displayNameEn: input.displayNameEn.trim(),
      displayNameZh: input.displayNameZh?.trim() || '',
      percentage: input.percentage,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      enabled: input.enabled,
    };

    if (input.id) {
      const [existing] = await tx
        .select({ id: discount.id })
        .from(discount)
        .where(eq(discount.id, id))
        .limit(1);
      if (!existing) throw new Error('Discount not found');
      await tx
        .update(discount)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(discount.id, id));
      await tx
        .delete(discountProduct)
        .where(eq(discountProduct.discountId, id));
    } else {
      await tx.insert(discount).values({ id, ...values, createdBy });
    }

    await tx.insert(discountProduct).values(
      productIds.map((productId) => ({
        id: getUuid(),
        discountId: id,
        productId,
      }))
    );
    return id;
  });
}

export async function removeDiscount(id: string) {
  if (!id) throw new Error('Discount ID is required');
  await db().delete(discount).where(eq(discount.id, id));
}

export async function findDiscountOverlaps(input: DiscountInput) {
  const productIds = validateDiscountInput(input);
  const rows: Array<{ productId: string; discountId: string }> = await db()
    .select({ productId: discountProduct.productId, discountId: discount.id })
    .from(discountProduct)
    .innerJoin(discount, eq(discountProduct.discountId, discount.id))
    .where(
      and(
        inArray(discountProduct.productId, productIds),
        eq(discount.enabled, true),
        lte(discount.startsAt, input.endsAt),
        gt(discount.endsAt, input.startsAt)
      )
    );
  return [
    ...new Set(
      rows
        .filter((row) => !input.id || row.discountId !== input.id)
        .map((row) => row.productId)
    ),
  ];
}
