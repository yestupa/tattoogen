# Content And Public Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static demo posts with an admin-managed bilingual blog, add public contact tickets, and align Sitemap, legal, footer, and 404 behavior with the product.

**Architecture:** Keep shared post metadata in `post`, store independently publishable locale content in `post_translation`, and query only the current locale. Public contact submissions use dedicated guest-safe tables while the admin ticket screen presents them beside authenticated tickets.

**Tech Stack:** TanStack Start, React 19, Drizzle ORM, D1, MDX, React Markdown, TanStack Query, Vitest

---

### Task 1: Add bilingual post and contact schema

**Files:**

- Modify: `src/config/db/schema.ts`
- Modify: `src/config/db/schema.sqlite.ts`
- Modify: `src/config/db/schema.postgres.ts`
- Modify: `src/config/db/schema.mysql.ts`
- Test: `src/modules/posts/schema-contract.test.ts`
- Test: `src/modules/contact/schema-contract.test.ts`

- [ ] **Step 1: Add failing schema contract tests**

```ts
expect(postTranslation).toBeDefined();
expect(contactTicket).toBeDefined();
expect(contactMessage).toBeDefined();
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `pnpm test -- src/modules/posts/schema-contract.test.ts src/modules/contact/schema-contract.test.ts`

Expected: FAIL because the exports do not exist.

- [ ] **Step 3: Define `post_translation`**

Add `id`, `postId`, `locale`, `slug`, `title`, `description`, `content`, `status`, `publishedAt`, `createdAt`, and `updatedAt`. Add a unique locale and slug index, plus a post, locale, status index. Cascade on post deletion.

- [ ] **Step 4: Define guest contact tables**

Add `contact_ticket` with optional user, requester fields, category, subject, status, locale, IP hash, and timestamps. Add `contact_message` with ticket, role, content, and timestamp. Cascade messages on ticket deletion and set user references to null.

- [ ] **Step 5: Run schema tests**

Run: `pnpm test -- src/modules/posts/schema-contract.test.ts src/modules/contact/schema-contract.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the schema**

Run the security scan, then commit with `feat: add bilingual content and contact schema`.

### Task 2: Refactor post service around translations

**Files:**

- Modify: `src/modules/posts/service.ts`
- Modify: `src/modules/posts/service.test.ts`
- Modify: `src/routes/api/admin/posts.ts`
- Modify: `src/routes/admin/posts.tsx`

- [ ] **Step 1: Write failing locale service tests**

```ts
it('returns only the requested published locale', async () => {
  const posts = await listPublishedArticles({ locale: 'zh' });
  expect(posts.every((post) => post.locale === 'zh')).toBe(true);
});

it('loads all translations before editing', async () => {
  const post = await getAdminPostById('post-1');
  expect(post.translations.en.title).toBe('English title');
  expect(post.translations.zh.title).toBe('中文标题');
});
```

- [ ] **Step 2: Run the service tests and verify failure**

Run: `pnpm test -- src/modules/posts/service.test.ts`

Expected: FAIL because translations and locale filters are unsupported.

- [ ] **Step 3: Implement typed translation input and output**

```ts
type TranslationInput = {
  locale: 'en' | 'zh';
  slug: string;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
};
```

Create and update the shared post plus both supplied translations in one transaction. Enforce slug normalization and locale allowlisting on the server.

- [ ] **Step 4: Fix the editor initialization race**

Change `openEdit` to await the complete detail response, then set the editing record and reset every field once. Track `loadingPostId`, display a spinner on that row, and surface a toast on failure.

- [ ] **Step 5: Render category titles explicitly**

Resolve `selectedCategory` from `categoryOptions` and render its title in `SelectValue`. Disable the selector until category options load.

- [ ] **Step 6: Add English and Chinese editor tabs**

Use one shared metadata section and two translation sections. Save both translation payloads in a single admin request; permit one locale to remain draft.

- [ ] **Step 7: Run service and route contract tests**

Run: `pnpm test -- src/modules/posts/service.test.ts src/routes/api/admin/-post-slug-contract.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit bilingual editing**

Run the security scan, then commit with `feat: add bilingual post editing`.

### Task 3: Add FastClaw Chinese draft generation

**Files:**

- Create: `src/routes/api/admin/posts/translate.ts`
- Modify: `src/modules/agent/fastclaw.ts`
- Modify: `src/routes/admin/posts.tsx`
- Test: `src/routes/api/admin/posts/translate.test.ts`

- [ ] **Step 1: Write failing authorization and output tests**

```ts
it('never publishes translated output', async () => {
  const result = await translatePost(validEnglishPost);
  expect(result.status).toBe('draft');
  expect(result.locale).toBe('zh');
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `pnpm test -- src/routes/api/admin/posts/translate.test.ts`

Expected: FAIL because the translation route does not exist.

- [ ] **Step 3: Implement a delimited translation request**

Send a fixed server instruction and a JSON data block containing only title, description, and content. Require a JSON object response with the same three string fields, impose length limits, and reject invalid output.

- [ ] **Step 4: Add the draft button**

Show Generate Chinese draft only when English content exists. Ask for confirmation before overwriting non-empty Chinese fields and never change Chinese status to published.

- [ ] **Step 5: Run translation tests**

Run: `pnpm test -- src/routes/api/admin/posts/translate.test.ts src/modules/agent/fastclaw.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit translation drafts**

Run the security scan, then commit with `feat: generate Chinese post drafts`.

### Task 4: Replace static blog loading

**Files:**

- Modify: `src/content/posts/server.ts`
- Modify: `src/content/posts/index.ts`
- Modify: `src/content/posts/index.test.ts`
- Delete: `src/content/posts/design-a-tattoo-with-ai.en.mdx`
- Delete: `src/content/posts/design-a-tattoo-with-ai.zh.mdx`
- Delete: `src/content/posts/tattoo-style-prompt-guide.en.mdx`
- Delete: `src/content/posts/tattoo-style-prompt-guide.zh.mdx`
- Modify: `src/routes/blog/index.tsx`
- Modify: `src/routes/blog/$slug.tsx`

- [ ] **Step 1: Rewrite tests to require database-only locale content**

```ts
expect(await getBlogPosts('zh')).toEqual([
  expect.objectContaining({ locale: 'zh', slug: 'zh-slug' }),
]);
expect(await getBlogPost('en', 'zh-slug')).toBeNull();
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/content/posts/index.test.ts`

Expected: FAIL because static MDX posts are still merged.

- [ ] **Step 3: Remove the four static posts and registry entries**

Keep shared blog types and Markdown rendering helpers, but make database translations the sole content source.

- [ ] **Step 4: Render the current locale only**

Pass locale through list and detail server functions. Return not found when a translation is absent or not published.

- [ ] **Step 5: Run blog tests**

Run: `pnpm test -- src/content/posts/index.test.ts src/routes/-public-visual-contract.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the blog source change**

Run the security scan, then commit with `feat: serve bilingual database posts`.

### Task 5: Make Sitemap and language metadata dynamic

**Files:**

- Modify: `src/routes/sitemap[.]xml.ts`
- Modify: `src/routes/llms[.]txt.ts`
- Modify: `src/routes/llms-full[.]txt.ts`
- Modify: `src/lib/sitemap-robots-contract.test.ts`

- [ ] **Step 1: Add failing locale availability tests**

Test an English-only post, a Chinese-only post, and a bilingual post. Assert that only real URLs appear and only bilingual posts receive both alternates.

- [ ] **Step 2: Run the contract test and verify failure**

Run: `pnpm test -- src/lib/sitemap-robots-contract.test.ts`

Expected: FAIL because database posts are duplicated into both locales.

- [ ] **Step 3: Build entries from published translations**

Group translation rows by shared post ID, emit one URL per row, attach alternates only for group members, XML-escape every URL, and add `/contact` to static paths.

- [ ] **Step 4: Set revalidation headers**

Return `Cache-Control: public, max-age=0, must-revalidate` on Sitemap and keep XML content type.

- [ ] **Step 5: Update llms text routes**

Use only published English content for the unlocalized root file and include localized paths without duplicating missing languages.

- [ ] **Step 6: Run the contract test**

Run: `pnpm test -- src/lib/sitemap-robots-contract.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit SEO updates**

Run the security scan, then commit with `fix: localize dynamic sitemap content`.

### Task 6: Add public Contact tickets

**Files:**

- Create: `src/modules/contact/service.ts`
- Create: `src/modules/contact/service.test.ts`
- Create: `src/routes/api/contact.ts`
- Create: `src/routes/contact.tsx`
- Modify: `src/routes/admin/tickets.tsx`
- Modify: `src/routes/api/admin/tickets.ts`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`

- [ ] **Step 1: Write failing validation and rate-limit tests**

```ts
it('rejects bots that fill the honeypot', async () => {
  expect(await submitContact({ ...validInput, company: 'spam' })).toMatchObject(
    {
      ok: false,
    }
  );
});

it('stores only an irreversible IP hash', async () => {
  await submitContact(validInput, '203.0.113.4');
  expect(inserted.ipHash).not.toContain('203.0.113.4');
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/modules/contact/service.test.ts`

Expected: FAIL because the contact module does not exist.

- [ ] **Step 3: Implement service validation**

Use Zod length and email validation, hash the normalized IP with the server auth secret, enforce a three-per-hour D1 count, require a minimum two-second form age, and insert ticket plus first message in a transaction.

- [ ] **Step 4: Implement the public route and page**

The API accepts only the documented form fields. The page uses TanStack Form, locale messages, a hidden honeypot, a client start timestamp, success state, and no attachment upload.

- [ ] **Step 5: Add an admin guest-ticket tab**

List guest tickets with status and requester email, show messages, permit admin replies, and send email only through the shared notification service when configured.

- [ ] **Step 6: Run contact and locale tests**

Run: `pnpm test -- src/modules/contact/service.test.ts src/lib/i18n-message-parity.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Contact tickets**

Run the security scan, then commit with `feat: add public contact tickets`.

### Task 7: Update public navigation, legal pages, and 404

**Files:**

- Modify: `src/blocks/footer.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/blocks/header.tsx`
- Modify: `src/routes/__root.tsx`
- Create: `src/components/blog-recommendations.tsx`
- Modify: `src/content/pages/privacy-policy.en.mdx`
- Modify: `src/content/pages/privacy-policy.zh.mdx`
- Modify: `src/content/pages/terms-of-service.en.mdx`
- Modify: `src/content/pages/terms-of-service.zh.mdx`
- Modify: `src/routes/-public-visual-contract.test.ts`

- [ ] **Step 1: Add failing visual contracts**

Assert that the footer has Blog and Contact, contains no ShipAny attribution or public admin/create link, and the 404 imports blog recommendations plus `/chat` and `/` actions.

- [ ] **Step 2: Run the visual contract and verify failure**

Run: `pnpm test -- src/routes/-public-visual-contract.test.ts`

Expected: FAIL on the old footer and 404 contracts.

- [ ] **Step 3: Update header and footer**

Keep Blog in desktop and mobile navigation, add Contact to the footer, remove ShipAny links and `BuiltWithShipAny`, and retain pricing plus legal links.

- [ ] **Step 4: Add locale-aware 404 recommendations**

Fetch up to three published posts for the active locale. Render nothing when empty and keep the generator CTA usable when the query fails.

- [ ] **Step 5: Replace legal copy**

Write product-specific English and Chinese policies covering uploads, prompts, generated images, providers, FastClaw, account deletion, billing, Credit, tattoo safety, prohibited use, and Contact tickets.

- [ ] **Step 6: Run visual and locale tests**

Run: `pnpm test -- src/routes/-public-visual-contract.test.ts src/lib/i18n-message-parity.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit public page updates**

Run the security scan, then commit with `feat: finish public support pages`.

### Task 8: Verify auth and dashboard visual consistency

**Files:**

- Modify: `src/components/auth-shell.tsx`
- Modify: `src/components/app-layout.tsx`
- Modify: `src/routes/(auth)/sign-in.tsx`
- Modify: `src/routes/(auth)/sign-up.tsx`
- Modify: `src/routes/(auth)/verify-email.tsx`
- Modify: `src/routes/settings/route.tsx`
- Modify: `src/routes/admin/route.tsx`
- Modify: `src/routes/-auth-visual-contract.test.ts`
- Modify: `src/components/dashboard-contract.test.tsx`

- [ ] **Step 1: Extend the failing visual contracts**

Require auth pages to use `AuthShell`, branded serif headings, shared warm surfaces and minimum touch sizes. Require settings and admin layouts to use `AppLayout`, the shared workspace marker, rounded cards, mobile sidebar triggers, and the same semantic color tokens as the homepage.

- [ ] **Step 2: Run visual contracts**

Run: `pnpm test -- src/routes/-auth-visual-contract.test.ts src/components/dashboard-contract.test.tsx`

Expected: any remaining template-default or inconsistent page fails with a file-specific assertion.

- [ ] **Step 3: Apply the smallest shared-shell fixes**

Move repeated styling into `AuthShell` or `AppLayout`, keep existing authentication and data-fetching code unchanged, and avoid per-page hard-coded colors.

- [ ] **Step 4: Run visual contracts again**

Run: `pnpm test -- src/routes/-auth-visual-contract.test.ts src/components/dashboard-contract.test.tsx src/components/design-system.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit visual consistency fixes**

Run the security scan, then commit with `fix: align auth and dashboard styling`.

### Task 9: Generate and verify the content migration

**Files:**

- Create: `drizzle/0002_bilingual_content_contact.sql`
- Modify: `drizzle/meta/_journal.json`
- Create: `drizzle/meta/0002_snapshot.json`

- [ ] **Step 1: Generate migration**

Run: `pnpm db:generate -- --name=bilingual-content-contact`

Expected: a migration containing only translation and contact tables plus indexes.

- [ ] **Step 2: Inspect and apply locally**

Reject destructive SQL, then run `npx wrangler d1 migrations apply tattoo-generator --local`.

Expected: migration applies once.

- [ ] **Step 3: Run content tests and build**

Run: `pnpm test -- src/modules/posts src/modules/contact src/content/posts src/lib/sitemap-robots-contract.test.ts src/routes/-public-visual-contract.test.ts`

Run: `npm.cmd run build`

Expected: all tests and build pass.

- [ ] **Step 4: Commit migration**

Run the security scan, then commit with `db: add content and contact migration`.
