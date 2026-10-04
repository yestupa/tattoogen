# Identity Notifications And Usage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce verified registration, add idempotent operational email notifications, expose FastClaw token usage to administrators, hide user API keys, and support safe ordinary-user deletion.

**Architecture:** Add small mapping, cache, and notification tables rather than storing provider data on Better Auth rows. Complete onboarding only after trusted email verification, and perform destructive user deletion in a guarded transaction owned by a dedicated service.

**Tech Stack:** Better Auth, FastClaw upstream API, Resend, TanStack Start, Drizzle ORM, D1, Vitest

---

### Task 1: Add identity operations schema

**Files:**

- Modify: `src/config/db/schema.ts`
- Modify: `src/config/db/schema.sqlite.ts`
- Modify: `src/config/db/schema.postgres.ts`
- Modify: `src/config/db/schema.mysql.ts`
- Test: `src/modules/identity/schema-contract.test.ts`

- [ ] **Step 1: Add a failing export contract**

```ts
expect(fastclawUserMapping).toBeDefined();
expect(fastclawUsageCache).toBeDefined();
expect(notificationEvent).toBeDefined();
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/modules/identity/schema-contract.test.ts`

Expected: FAIL because the three exports are absent.

- [ ] **Step 3: Define mapping, cache, and event tables**

Mapping fields: `userId`, `externalId`, `fastclawUserId`, `provisionedAt`, `updatedAt`.

Cache fields: `id`, `userId`, `days`, `totalsJson`, `dailyJson`, `fetchedAt` with a unique user and days pair.

Event fields: `id`, `eventKey`, `type`, `recipient`, `payloadJson`, `status`, `attempts`, `lastError`, `createdAt`, `sentAt`, `updatedAt`. Make event key unique and user-related foreign keys cascade.

- [ ] **Step 4: Run the contract test**

Run: `pnpm test -- src/modules/identity/schema-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit schema**

Run the security scan, then commit with `feat: add identity operations schema`.

### Task 2: Provision FastClaw users and read real usage

**Files:**

- Modify: `src/modules/agent/fastclaw.ts`
- Modify: `src/modules/agent/fastclaw.test.ts`
- Create: `src/modules/agent/usage.ts`
- Create: `src/modules/agent/usage.test.ts`

- [ ] **Step 1: Write failing provisioning tests**

```ts
it('provisions with the stable local user id once', async () => {
  expect(await ensureFastClawUser({ userId: 'user-42', name: 'Ada' })).toBe(
    'u_42'
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Write failing usage normalization tests**

```ts
expect(normalizeUsage(apiResult).totals).toEqual({
  inputTokens: 100,
  outputTokens: 50,
  cacheReadTokens: 10,
  cacheCreationTokens: 0,
  requestCount: 2,
});
```

- [ ] **Step 3: Run tests and verify failure**

Run: `pnpm test -- src/modules/agent/fastclaw.test.ts src/modules/agent/usage.test.ts`

Expected: FAIL because mapping and usage functions do not exist.

- [ ] **Step 4: Implement explicit provisioning**

POST `/v1/users` with `external_id` equal to the stable local user ID and a bounded display name. Upsert the returned FastClaw user ID. Call this before chat so prior lazy mappings resolve idempotently.

- [ ] **Step 5: Implement usage fetch and cache**

GET `/v1/usage` with `user_id` and days restricted to 7, 30, or 90. Validate every numeric field, cache successful responses for ten minutes, preserve stale cache when FastClaw is temporarily unavailable, and never log authorization headers.

- [ ] **Step 6: Run module tests**

Run: `pnpm test -- src/modules/agent/fastclaw.test.ts src/modules/agent/usage.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit FastClaw metering**

Run the security scan, then commit with `feat: meter FastClaw usage by user`.

### Task 3: Add the admin token usage page

**Files:**

- Create: `src/routes/api/admin/usage.ts`
- Create: `src/routes/admin/usage.tsx`
- Modify: `src/routes/admin/route.tsx`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`
- Test: `src/routes/api/admin/usage.test.ts`

- [ ] **Step 1: Write failing access and partial-failure tests**

```ts
it('keeps successful rows when one FastClaw user fails', async () => {
  const page = await getUsagePage();
  expect(page.items).toHaveLength(2);
  expect(page.items[1].usageError).toBe(true);
});
```

- [ ] **Step 2: Run the route test and verify failure**

Run: `pnpm test -- src/routes/api/admin/usage.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement paged usage API**

Require `admin.*`, accept bounded page, search, and days inputs, load at most 20 users, fetch usage with concurrency four, include Credit consumption for the same date window, and return per-row errors without leaking provider messages.

- [ ] **Step 4: Implement the usage page**

Render search, 7, 30, and 90 day controls, token totals, request count, Credit usage, last sync, manual refresh, and a selected-user daily chart.

- [ ] **Step 5: Run usage and locale tests**

Run: `pnpm test -- src/routes/api/admin/usage.test.ts src/lib/i18n-message-parity.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit usage UI**

Run the security scan, then commit with `feat: add admin token usage`.

### Task 4: Complete onboarding only after verification

**Files:**

- Modify: `src/core/auth/index.ts`
- Create: `src/modules/auth/onboarding.ts`
- Create: `src/modules/auth/onboarding.test.ts`
- Modify: `src/routes/(auth)/sign-up.tsx`
- Test: `src/routes/-auth-visual-contract.test.ts`

- [ ] **Step 1: Write failing onboarding idempotency tests**

```ts
it('grants the default role and signup Credit once after verification', async () => {
  await completeOnboarding(user, configs);
  await completeOnboarding(user, configs);
  expect(grantRoleForNewUser).toHaveBeenCalledTimes(2);
  expect(grantForNewUser).toHaveBeenCalledTimes(2);
  expect(await countGrantTransactions(user.id)).toBe(1);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test -- src/modules/auth/onboarding.test.ts`

Expected: FAIL because onboarding is still tied directly to user creation.

- [ ] **Step 3: Extract idempotent onboarding**

Call the existing role and Credit functions behind their database uniqueness checks. For an unverified email-password account, skip onboarding during creation. For a verified social account, complete it immediately.

- [ ] **Step 4: Wire Better Auth verification hook**

Use `emailVerification.afterEmailVerification` to run onboarding and the registration notification. Keep `requireEmailVerification: true`, `autoSignIn: false`, and `autoSignInAfterVerification: true` when the production flag is enabled.

- [ ] **Step 5: Fail closed when email is required but unavailable**

When verification is enabled and no provider is configured, reject new password registration with a localized service-unavailable message. Never fall back to an unverified usable account.

- [ ] **Step 6: Run auth tests**

Run: `pnpm test -- src/modules/auth/onboarding.test.ts src/routes/-auth-visual-contract.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit verified onboarding**

Run the security scan, then commit with `fix: require verified registration`.

### Task 5: Add idempotent operational email notifications

**Files:**

- Create: `src/modules/notifications/service.ts`
- Create: `src/modules/notifications/service.test.ts`
- Create: `src/core/email/templates/admin-notification.tsx`
- Modify: `src/modules/config/settings.ts`
- Modify: `src/modules/payment/service.ts`
- Modify: `src/core/auth/index.ts`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`

- [ ] **Step 1: Write a failing event-key test**

```ts
it('sends one message for duplicate payment callbacks', async () => {
  await notifyPaymentPaid(order);
  await notifyPaymentPaid(order);
  expect(emailProvider.sendEmail).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run notification tests and verify failure**

Run: `pnpm test -- src/modules/notifications/service.test.ts`

Expected: FAIL because the notification service does not exist.

- [ ] **Step 3: Add notification settings**

Add `notification_email` with default `yestupaofficial@gmail.com` and a boolean notification toggle to the email settings group. Keep the destination non-secret and provider credentials secret.

- [ ] **Step 4: Implement event reservation and send**

Insert the unique event key before sending, use the existing configured email provider, mark sent or failed, bound error text to 500 characters, and provide a retry method for failed events.

- [ ] **Step 5: Hook registration and payments**

Send registration notifications after verification, initial payment notifications only after the paid transaction commits, and renewal notifications only after renewal order insertion commits. Use business IDs in event keys.

- [ ] **Step 6: Run notification and payment tests**

Run: `pnpm test -- src/modules/notifications/service.test.ts src/modules/payment`

Expected: PASS.

- [ ] **Step 7: Commit notifications**

Run the security scan, then commit with `feat: add admin registration and payment alerts`.

### Task 6: Hide user API keys

**Files:**

- Modify: `src/routes/settings/apikeys.tsx`
- Modify: `src/routes/api/apikeys.ts`
- Modify: `src/components/dashboard-contract.test.tsx`
- Modify: `src/routes/settings/route.tsx`

- [ ] **Step 1: Add failing access contracts**

Assert that settings navigation has no API Key entry, the page redirects ordinary users, and the API checks `admin.*` before list, create, or delete.

- [ ] **Step 2: Run the contract test and verify failure**

Run: `pnpm test -- src/components/dashboard-contract.test.tsx`

Expected: FAIL on direct-route and API authorization assertions.

- [ ] **Step 3: Restrict page and API**

Keep the underlying service, but redirect non-admin page access to `/settings` and return Forbidden from all API handlers without admin permission.

- [ ] **Step 4: Run contracts**

Run: `pnpm test -- src/components/dashboard-contract.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit restriction**

Run the security scan, then commit with `fix: hide user API key management`.

### Task 7: Add safe ordinary-user deletion

**Files:**

- Create: `src/modules/users/service.ts`
- Create: `src/modules/users/service.test.ts`
- Modify: `src/routes/api/admin/users/index.ts`
- Modify: `src/routes/admin/users.tsx`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`

- [ ] **Step 1: Write failing guard tests**

```ts
await expect(deleteUser({ actorId: 'a', targetId: 'a' })).rejects.toThrow(
  'self'
);
await expect(deleteUser({ actorId: 'a', targetId: 'root' })).rejects.toThrow(
  'administrator'
);
```

- [ ] **Step 2: Write a failing cleanup test**

Create an ordinary user with ticket, invite, session, account, Credit, and FastClaw mapping records. Delete the user and assert that no dependent record blocks deletion and the email can be inserted again.

- [ ] **Step 3: Run tests and verify failure**

Run: `pnpm test -- src/modules/users/service.test.ts`

Expected: FAIL because the deletion service does not exist.

- [ ] **Step 4: Implement guarded transaction**

Require a super administrator actor, block self and any target with management permission, delete non-cascading ticket messages, tickets and invites, null invite-code creator, then delete the user so existing cascades remove credentials and business data.

- [ ] **Step 5: Add DELETE handler and confirmation UI**

Require target ID plus exact email confirmation. The dialog explains permanent deletion, disables submission until the email matches, and refreshes the list on success.

- [ ] **Step 6: Run user and locale tests**

Run: `pnpm test -- src/modules/users/service.test.ts src/lib/i18n-message-parity.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit user deletion**

Run the security scan, then commit with `feat: delete ordinary users safely`.

### Task 8: Generate and verify identity migration

**Files:**

- Create: `drizzle/0003_identity_notifications_usage.sql`
- Modify: `drizzle/meta/_journal.json`
- Create: `drizzle/meta/0003_snapshot.json`

- [ ] **Step 1: Generate migration**

Run: `pnpm db:generate -- --name=identity-notifications-usage`

Expected: one additive migration for mapping, cache, and notification tables.

- [ ] **Step 2: Inspect and apply locally**

Reject destructive statements, then run `npx wrangler d1 migrations apply tattoo-generator --local`.

Expected: migration applies once.

- [ ] **Step 3: Run identity tests and build**

Run: `pnpm test -- src/modules/agent src/modules/auth src/modules/notifications src/modules/users src/routes/api/admin/usage.test.ts`

Run: `npm.cmd run build`

Expected: all tests and build pass.

- [ ] **Step 4: Commit migration**

Run the security scan, then commit with `db: add identity operations migration`.
