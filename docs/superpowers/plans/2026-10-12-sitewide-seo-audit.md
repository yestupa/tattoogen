# Sitewide SEO Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for inline implementation. Steps use checkboxes for tracking.

**Goal:** Remove indexable empty blog archives, localize Chinese topic H1s, and remove the unsupported free-use CTA.

**Architecture:** Published translation rows determine blog-locale availability. The blog page and sitemap consume the same canonical-slug filter, while database errors retain the prior crawlable fallback. Existing metadata and route patterns remain in place.

**Tech Stack:** TanStack Start, Paraglide messages, Vitest, Cloudflare Workers and D1.

---

### Task 1: Published blog locale contract

**Files:** Modify `src/content/posts/index.ts`; test `src/content/posts/index.test.ts`.

- [ ] Add a failing test for `publishedBlogLocales` with no rows, English-only rows, bilingual rows, and invalid slugs. Expected results are respectively `[]`, `['en']`, `['en', 'zh']`, and `[]`.

```ts
expect(publishedBlogLocales([])).toEqual([]);
expect(publishedBlogLocales([{ locale: 'en', slug: 'fine-line' }])).toEqual([
  'en',
]);
expect(
  publishedBlogLocales([
    { locale: 'en', slug: 'fine-line' },
    { locale: 'zh', slug: 'xi-xian' },
  ])
).toEqual(['en', 'zh']);
expect(publishedBlogLocales([{ locale: 'zh', slug: 'bad slug' }])).toEqual([]);
```

- [ ] Run `pnpm.cmd exec vitest run src/content/posts/index.test.ts` and confirm the new test fails because the helper is missing.
- [ ] Add `publishedBlogLocales(rows: Array<{ locale: string; slug: string }>): BlogLocale[]` in `index.ts`; return the supported locales for rows whose slug passes `isCanonicalPostSlug`.

```ts
export function publishedBlogLocales(
  rows: ReadonlyArray<{ locale: string; slug: string }>
): BlogLocale[] {
  const available = new Set(
    rows.filter((row) => isCanonicalPostSlug(row.slug)).map((row) => row.locale)
  );
  return (['en', 'zh'] as const).filter((locale) => available.has(locale));
}
```

- [ ] Re-run the focused test and confirm it passes.

### Task 2: Sitemap excludes known-empty blog archives

**Files:** Modify `src/routes/sitemap[.]xml.ts`; test `src/lib/sitemap-robots-contract.test.ts`.

- [ ] Add failing assertions: zero published rows omit both blog archive URLs; English-only rows include `/blog` but omit `/zh/blog`; bilingual rows include both; a rejected availability query keeps both blog archive URLs as an outage fallback.

```ts
expect(emptyXml).not.toContain('<loc>https://tattoo.example/blog</loc>');
expect(englishXml).toContain('<loc>https://tattoo.example/blog</loc>');
expect(englishXml).not.toContain('<loc>https://tattoo.example/zh/blog</loc>');
expect(offlineXml).toContain('<loc>https://tattoo.example/zh/blog</loc>');
```

- [ ] Run `pnpm.cmd exec vitest run src/lib/sitemap-robots-contract.test.ts` and confirm the failure matches the missing conditional rule.
- [ ] Build the `/blog` sitemap entry from `publishedBlogLocales(translations)`. Keep the existing static and article entries. When the query throws, retain both locales for the blog entry.

```ts
let blogLocales: Locale[] = [...locales];
try {
  const translations = await getPublishedLocaleAvailability();
  blogLocales = publishedBlogLocales(translations);
} catch {
  blogLocales = [...locales];
}
const paths = path === '/blog' ? blogLocales : locales;
if (paths.length === 0) return [];
return [
  {
    paths: Object.fromEntries(paths.map((locale) => [locale, path])),
    changeFrequency: path === '/blog' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  },
];
```

- [ ] Re-run the focused test and confirm it passes.

### Task 3: Empty blog pages do not advertise indexability

**Files:** Modify `src/content/posts/server.ts` and `src/routes/blog/index.tsx`; test `src/lib/i18n-message-parity.test.ts`.

- [ ] Extend the existing route-head test harness with optional blog locale availability. Add failing tests: a known-empty locale has a `robots` noindex tag and no alternate pointing to it; a published locale retains its self-canonical and only real alternates; unknown availability retains the current indexable fallback.

```ts
expect(emptyHead.meta).toContainEqual({
  name: 'robots',
  content: 'noindex, follow',
});
expect(emptyHead.links.some((link) => link.rel === 'alternate')).toBe(false);
expect(englishHead.links.filter((link) => link.hrefLang === 'zh')).toEqual([]);
```

- [ ] Run `pnpm.cmd exec vitest run src/lib/i18n-message-parity.test.ts` and confirm the new assertions fail on the current head.
- [ ] Add a server function that returns `{ locales, known }` from published translation availability and returns `known: false` on database error. The blog loader supplies this plus its existing posts to `head`, which sets robots and language alternates accordingly.

```ts
export const getBlogLocaleAvailabilityFn = createServerFn().handler(
  async () => {
    try {
      const { getPublishedLocaleAvailability } =
        await import('@/modules/posts/service');
      return {
        locales: publishedBlogLocales(await getPublishedLocaleAvailability()),
        known: true,
      };
    } catch {
      return { locales: ['en', 'zh'] as BlogLocale[], known: false };
    }
  }
);
```

- [ ] Re-run the focused test and confirm it passes.

### Task 4: Visible topic and CTA copy

**Files:** Modify `messages/zh.json`, `messages/en.json`; test `src/lib/i18n-message-parity.test.ts`.

- [ ] Add failing assertions that the five Chinese topic H1 keys contain Chinese characters, and that both homepage CTA labels avoid an unsupported free-use promise.

```ts
for (const key of [
  'fear.hero.title',
  'butterfly.hero.title',
  'couple.hero.title',
  'angel.hero.title',
  'joker.hero.title',
]) {
  expect(dictionaries.zh[key]).toMatch(/[\u3400-\u9fff]/);
}
expect(dictionaries.en['landing.cta.primary']).not.toMatch(/free/i);
expect(dictionaries.zh['landing.cta.primary']).not.toMatch(/免费/);
```

- [ ] Run `pnpm.cmd exec vitest run src/lib/i18n-message-parity.test.ts` and confirm the copy assertions fail.
- [ ] Translate the five Chinese H1s and change the CTA labels to `Start Creating` and `开始创作` without changing the CTA destinations or pricing.
- [ ] Re-run the focused test and confirm it passes.

### Task 5: Verification and publication

**Files:** No new implementation files.

- [ ] Run the focused and full Vitest suites, `pnpm.cmd exec tsc --noEmit`, and `pnpm.cmd build`.
- [ ] Inspect the diff and run the security-scan skill on both the worktree and staged commit; resolve any finding before committing.
- [ ] Browser-check a representative English page, Chinese topic page, empty blog, and private route at mobile and desktop widths. Verify console, network, canonicals, and images.
- [ ] Commit, synchronize the exact tree to GitHub without force, deploy to Cloudflare with the repository script, and audit the new production sitemap and page HTML. Record any unverified Google indexing or Core Web Vitals data as separate follow-up.
