# Commerce Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-authoritative price, Credit, and scheduled discount management without trusting browser-submitted billing data.

**Architecture:** Keep `src/config/pricing.ts` as the immutable fallback catalog, then merge validated D1 overrides and one effective discount in a server-only commerce service. Public pricing and checkout consume the same service; admin APIs mutate only typed database records.

**Tech Stack:** TanStack Start, React 19, TanStack Query, Drizzle ORM, D1, Vitest, shadcn Base UI

---

### Task 1: Add commerce schema

**Files:**

- Modify: `src/config/db/schema.ts`
- Modify: `src/config/db/schema.sqlite.ts`
- Modify: `src/config/db/schema.postgres.ts`
- Modify: `src/config/db/schema.mysql.ts`
- Test: `src/modules/commerce/schema-contract.test.ts`

- [ ] **Step 1: Write the failing schema contract test**

```ts
import { describe, expect, it } from 'vitest';

import { discount, discountProduct, pricingOverride } from '@/config/db/schema';

describe('commerce schema', () => {
  it('exports pricing and discount tables', () => {
    expect(pricingOverride).toBeDefined();
    expect(discount).toBeDefined();
    expect(discountProduct).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm test -- src/modules/commerce/schema-contract.test.ts`

Expected: FAIL because the three schema exports do not exist.

- [ ] **Step 3: Define the tables in all four schema files**

Use these fields consistently across dialects:

```ts
pricingOverride: (productId,
  priceInCents,
  credits,
  creditsValidDays,
  enabled,
  updatedBy,
  createdAt,
  updatedAt);
discount: (id,
  internalName,
  displayNameEn,
  displayNameZh,
  percentage,
  startsAt,
  endsAt,
  enabled,
  createdBy,
  createdAt,
  updatedAt);
discountProduct: (id, discountId, productId, createdAt);
```

Add unique constraints on `pricing_override.product_id` and the pair `discount_product.discount_id, discount_product.product_id`. Use `onDelete: 'cascade'` from discount products to discounts and `onDelete: 'set null'` for administrator references.

- [ ] **Step 4: Run the schema test**

Run: `pnpm test -- src/modules/commerce/schema-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the schema change**

Run the security scan, then commit with `feat: add commerce management schema`.

### Task 2: Build the authoritative commerce service

**Files:**

- Create: `src/modules/commerce/types.ts`
- Create: `src/modules/commerce/service.ts`
- Test: `src/modules/commerce/service.test.ts`
- Modify: `src/config/pricing.ts`

- [ ] **Step 1: Write failing tests for override and discount rules**

```ts
it('uses a valid override and the highest active discount', async () => {
  const product = await getEffectiveProduct('pro_monthly', {
    now: new Date('2026-10-04T12:00:00Z'),
  });
  expect(product.basePriceInCents).toBe(2500);
  expect(product.priceInCents).toBe(1875);
  expect(product.discount?.percentage).toBe(25);
});

it('never returns a zero-cent paid product', () => {
  expect(applyPercentageDiscount(1, 99)).toBe(1);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `pnpm test -- src/modules/commerce/service.test.ts`

Expected: FAIL because the commerce service does not exist.

- [ ] **Step 3: Implement focused types**

```ts
export type EffectiveDiscount = {
  id: string;
  displayNameEn: string;
  displayNameZh: string;
  percentage: number;
  startsAt: Date;
  endsAt: Date;
};

export type EffectivePricingProduct = PricingProduct & {
  basePriceInCents: number;
  discount: EffectiveDiscount | null;
};
```

- [ ] **Step 4: Implement validated catalog resolution**

`getEffectiveProduct` must reject unknown product IDs, ignore invalid overrides, query active discounts with `startsAt <= now` and `endsAt > now`, select the highest percentage and earliest start, and return integer cents. Add `listEffectiveProducts` for public and admin consumers.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test -- src/modules/commerce/service.test.ts`

Expected: PASS for fallback, override, inactive discount, overlap, rounding, and disabled product cases.

- [ ] **Step 6: Commit the service**

Run the security scan, then commit with `feat: add authoritative commerce catalog`.

### Task 3: Add admin price and Credit management

**Files:**

- Create: `src/routes/api/admin/pricing.ts`
- Create: `src/routes/admin/pricing.tsx`
- Modify: `src/routes/admin/route.tsx`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`
- Test: `src/routes/api/admin/pricing.test.ts`

- [ ] **Step 1: Write failing authorization and validation tests**

```ts
it('rejects a non-admin price update', async () => {
  const response = await callPut({ productId: 'pro_monthly', priceInCents: 1 });
  expect(response.status).toBe(403);
});

it('rejects negative Credit', async () => {
  const response = await callPut({ productId: 'pro_monthly', credits: -1 });
  expect(response.status).toBe(400);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `pnpm test -- src/routes/api/admin/pricing.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement GET and PUT handlers**

GET returns every configured product with defaults, overrides, and effective values. PUT accepts only `productId`, integer `priceInCents`, integer `credits`, integer `creditsValidDays`, and boolean `enabled`; it requires `admin.*` and a super administrator role.

- [ ] **Step 4: Build the admin page**

Render one editable row per product, show dollars while submitting integer cents, require explicit Save per row, and display the current effective discount separately from base values.

- [ ] **Step 5: Add English and Chinese messages**

Add matching `admin.pricing.*` keys to both locale files and run `pnpm test -- src/lib/i18n-message-parity.test.ts`.

- [ ] **Step 6: Run route and parity tests**

Run: `pnpm test -- src/routes/api/admin/pricing.test.ts src/lib/i18n-message-parity.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the admin pricing page**

Run the security scan, then commit with `feat: add admin pricing management`.

### Task 4: Add scheduled discount management

**Files:**

- Create: `src/routes/api/admin/discounts.ts`
- Create: `src/routes/admin/discounts.tsx`
- Modify: `src/routes/admin/route.tsx`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`
- Test: `src/routes/api/admin/discounts.test.ts`

- [ ] **Step 1: Write failing CRUD and overlap tests**

```ts
it('normalizes dates and returns overlapping targets', async () => {
  const result = await createDiscount(validPayload);
  expect(result.overlaps).toEqual(['pro_monthly']);
  expect(result.discount.percentage).toBe(20);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/routes/api/admin/discounts.test.ts`

Expected: FAIL because the route and service methods do not exist.

- [ ] **Step 3: Implement CRUD validation**

Require non-empty internal and English display names, optional Chinese display name, percentage from 1 to 99, at least one known product, and an end time after the start time. Replace target rows in one transaction during update.

- [ ] **Step 4: Implement the admin UI**

Provide active, upcoming, expired, and disabled states; multi-select products; local datetime inputs converted to UTC; overlap warning; enable switch; edit and delete confirmation.

- [ ] **Step 5: Run focused and locale tests**

Run: `pnpm test -- src/routes/api/admin/discounts.test.ts src/lib/i18n-message-parity.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit discount management**

Run the security scan, then commit with `feat: add scheduled discounts`.

### Task 5: Use the catalog on public pricing and checkout

**Files:**

- Create: `src/routes/api/pricing.ts`
- Modify: `src/blocks/pricing.tsx`
- Modify: `src/components/credit-topup-dialog.tsx`
- Modify: `src/routes/api/payment/checkout.ts`
- Modify: `src/modules/payment/service.ts`
- Test: `src/routes/api/payment/checkout.test.ts`
- Test: `src/modules/commerce/public-catalog.test.ts`

- [ ] **Step 1: Write a failing forged-price regression test**

```ts
it('ignores a client supplied price and credits', async () => {
  await postCheckout({
    product_id: 'pro_monthly',
    price: 1,
    credits: 999999,
  });
  expect(createCheckout).toHaveBeenCalledWith(
    expect.objectContaining({ credits: 4800 })
  );
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm test -- src/routes/api/payment/checkout.test.ts src/modules/commerce/public-catalog.test.ts`

Expected: FAIL because checkout still uses the static catalog and no public endpoint exists.

- [ ] **Step 3: Add the public catalog endpoint**

Return only product ID, localized names already present in messages, base price, effective price, currency, Credit, validity, enabled state, and localized discount metadata. Do not return internal discount names or administrator IDs.

- [ ] **Step 4: Replace hard-coded pricing data**

Load `/api/pricing` with TanStack Query in both pricing and top-up components. Preserve loading, error, monthly, yearly, current-plan, and checkout states.

- [ ] **Step 5: Make checkout use `getEffectiveProduct`**

Ignore all client pricing fields, reject disabled products, snapshot the discount code and amount, and reject Creem when its fixed external amount cannot be proven equal to the computed amount.

- [ ] **Step 6: Preserve application discount metadata after payment**

When provider payment information omits discount fields, retain `existingOrder.discountCode` and `existingOrder.discountAmount` during the paid update.

- [ ] **Step 7: Run focused tests**

Run: `pnpm test -- src/routes/api/payment/checkout.test.ts src/modules/commerce/public-catalog.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the public and checkout integration**

Run the security scan, then commit with `feat: connect pricing to checkout`.

### Task 6: Generate and verify the commerce migration

**Files:**

- Create: `drizzle/0001_commerce_management.sql`
- Modify: `drizzle/meta/_journal.json`
- Create: `drizzle/meta/0001_snapshot.json`

- [ ] **Step 1: Generate the migration**

Run: `pnpm db:generate -- --name=commerce-management`

Expected: one new migration containing only pricing and discount tables, indexes, and foreign keys.

- [ ] **Step 2: Review generated SQL**

Confirm it contains no DROP TABLE, DROP COLUMN, user-data update, or secret value.

- [ ] **Step 3: Apply to local D1 and verify tables**

Run: `npx wrangler d1 migrations apply tattoo-generator --local`

Expected: migration applied once and the three new tables are queryable.

- [ ] **Step 4: Run commerce tests and build**

Run: `pnpm test -- src/modules/commerce src/routes/api/admin/pricing.test.ts src/routes/api/admin/discounts.test.ts src/routes/api/payment/checkout.test.ts`

Run: `npm.cmd run build`

Expected: all tests and build pass.

- [ ] **Step 5: Commit the migration**

Run the security scan, then commit with `db: add commerce management migration`.
