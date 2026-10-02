# Tattoo Generator Site-Wide Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved warm-ivory, ink-black, deep-purple Tattoo Generator visual system across every public, authentication, agent, user, admin, and error surface, then push the verified result to GitHub and publish it at `bestaitattoogenerator.com` on Cloudflare Workers.

**Architecture:** Keep all business behavior and route boundaries intact. Establish semantic theme tokens and four durable presentation components first, then migrate each surface onto those shared contracts. Preserve Better Auth, RBAC, D1, payments, credits, FastClaw proxying, and i18n behavior; only presentation composition, message copy, and accessibility metadata change. Deploy through the repository's Cloudflare skill and `cf:deploy` script, with secrets held only in Workers secrets or encrypted admin configuration.

**Tech Stack:** TanStack Start, React 19, TypeScript strict mode, Tailwind CSS 4, shadcn Base Nova primitives, Paraglide i18n, Vitest, Playwright CLI, Cloudflare Workers, D1, Wrangler.

---

## Task 1: Establish the baseline and protect existing behavior

**Files:**

- Inspect: `AGENTS.md`
- Inspect: `docs/superpowers/specs/2026-10-02-tattoo-generator-visual-system-design.md`
- Inspect: `src/routes/__root.tsx`
- Inspect: `src/components/app-layout.tsx`
- Inspect: `src/components/agent/agent-layout.tsx`
- Inspect: `src/styles/globals.css`
- Test: existing `src/**/*.test.ts` and `src/**/*.test.tsx`

- [ ] **Step 1: Confirm repository state and current commit range**

Run:

```powershell
git status --short --branch
git log --oneline -5
git diff --stat origin/main...HEAD
```

Expected: branch `main`, only the already approved design-spec commit ahead of `origin/main`, and no unrelated local edits.

- [ ] **Step 2: Run the baseline unit suite**

Run:

```powershell
pnpm.cmd test
```

Expected: all existing FastClaw, history, paywall, tool, and settings tests pass.

- [ ] **Step 3: Run baseline type and production builds**

Run:

```powershell
pnpm.cmd exec tsc --noEmit
pnpm.cmd run build
pnpm.cmd run cf:build
```

Expected: all commands exit zero. Record the existing duplicate PayPal event-case warning separately if it still appears; do not mix an unrelated payment refactor into this visual change.

## Task 2: Add testable shared presentation contracts

**Files:**

- Create: `src/components/brand-artwork.tsx`
- Create: `src/components/auth-shell.tsx`
- Create: `src/components/page-heading.tsx`
- Create: `src/components/page-state.tsx`
- Create: `src/components/design-system.test.tsx`

- [ ] **Step 1: Write the failing component contract tests**

Create `src/components/design-system.test.tsx` with React server rendering so the tests need no browser or router context:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AuthShell } from './auth-shell';
import { BrandArtwork } from './brand-artwork';
import { PageHeading } from './page-heading';
import { PageState } from './page-state';

describe('shared visual system components', () => {
  it('renders the original tattoo artwork as decorative by default', () => {
    const html = renderToStaticMarkup(<BrandArtwork />);
    expect(html).toContain('data-brand-artwork="tattoo-generator"');
    expect(html).toContain('aria-hidden="true"');
  });

  it('gives authentication content a single main landmark', () => {
    const html = renderToStaticMarkup(
      <AuthShell
        eyebrow="Tattoo Generator"
        title="Welcome back"
        benefits={['Private by design']}
      >
        <form aria-label="Sign in" />
      </AuthShell>
    );
    expect(html.match(/<main/g)).toHaveLength(1);
    expect(html).toContain('Welcome back');
    expect(html).toContain('Private by design');
  });

  it('renders reusable heading and status actions', () => {
    const html = renderToStaticMarkup(
      <>
        <PageHeading
          title="Library"
          description="Saved designs"
          action={<button>Upload</button>}
        />
        <PageState
          code="404"
          title="Lost in the ink"
          description="Try another path"
          primaryAction={<a href="/">Home</a>}
        />
      </>
    );
    expect(html).toContain('Saved designs');
    expect(html).toContain('Lost in the ink');
    expect(html).toContain('Home');
  });
});
```

- [ ] **Step 2: Verify the new tests fail for the missing components**

Run:

```powershell
pnpm.cmd test -- src/components/design-system.test.tsx
```

Expected: FAIL with unresolved imports for the four new components.

- [ ] **Step 3: Implement the smallest reusable components**

Implementation requirements:

- `BrandArtwork` is an original inline SVG composed from botanical, moon, star, needle, and flowing line motifs. Use `currentColor`, no copied asset, no remote request, and no embedded raster image.
- `AuthShell` accepts all copy and content through props, renders one `main`, uses a desktop two-column card, and compresses the artwork/benefits on screens below `md`.
- `PageHeading` owns title, description, optional eyebrow, and optional action alignment.
- `PageState` owns status code/artwork, title, description, optional detail, and up to two action slots. It supports `loading`, `empty`, `forbidden`, `error`, and `not-found` visual variants without reading translations.
- Each component keeps a visible focus path for its interactive children and uses semantic theme classes only.

- [ ] **Step 4: Run focused tests and formatting**

Run:

```powershell
pnpm.cmd test -- src/components/design-system.test.tsx
pnpm.cmd exec prettier --write src/components/brand-artwork.tsx src/components/auth-shell.tsx src/components/page-heading.tsx src/components/page-state.tsx src/components/design-system.test.tsx
```

Expected: focused tests pass and Prettier reports the five files formatted.

- [ ] **Step 5: Security-scan and commit the shared contracts**

Run the project security-scan skill against the worktree, review the diff with its checklist, stage only these files, scan the staged set, then commit:

```powershell
git add src/components/brand-artwork.tsx src/components/auth-shell.tsx src/components/page-heading.tsx src/components/page-state.tsx src/components/design-system.test.tsx
git commit -m "feat: add shared visual system shells"
```

Expected: both security scans have no HIGH findings and the commit succeeds.

## Task 3: Implement the approved color, shape, focus, and motion tokens

**Files:**

- Modify: `src/styles/globals.css`
- Create: `src/styles/globals.test.ts`

- [ ] **Step 1: Write a failing token regression test**

Create `src/styles/globals.test.ts` that reads `globals.css` and asserts the approved light and dark anchor values, radius, focus ring, reduced-motion rule, and minimum touch-target utility:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('./globals.css', import.meta.url)),
  'utf8'
).toLowerCase();

describe('global visual tokens', () => {
  it('keeps the approved light and dark brand anchors', () => {
    expect(css).toContain('#fbf8f3');
    expect(css).toContain('#7137f2');
    expect(css).toContain('#17151c');
    expect(css).toContain('#9668ff');
  });

  it('preserves accessible focus, touch, and reduced-motion rules', () => {
    expect(css).toContain(':focus-visible');
    expect(css).toContain('.touch-target');
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});
```

- [ ] **Step 2: Run the token test and confirm failure**

Run:

```powershell
pnpm.cmd test -- src/styles/globals.test.ts
```

Expected: FAIL because the current vermilion palette does not contain the purple anchors.

- [ ] **Step 3: Replace the global visual tokens**

Update `globals.css` with:

- Light anchors `#FBF8F3`, `#FFFDFC`, `#171827`, `#676779`, `#7137F2`, `#5F28D8`, `#F1EAFF`, and `#E6E0D8`.
- Dark anchors `#17151C`, `#211E28`, `#2A2632`, `#F5F1EA`, `#AAA3B4`, `#9668FF`, and `#393441`.
- Semantic chart and sidebar tokens derived from the same palette.
- Base radius `0.75rem`, ordinary card radius near 14 pixels, and large shell radius near 18 pixels.
- Warm violet low-opacity shadows, a paper-grain background utility, clear `:focus-visible` treatment, a 44-pixel `.touch-target`, and reduced-motion overrides.
- No manual edits inside `src/components/ui`; existing shadcn primitives inherit the revised semantic variables.

- [ ] **Step 4: Verify token tests and the existing unit suite**

Run:

```powershell
pnpm.cmd test -- src/styles/globals.test.ts
pnpm.cmd test
pnpm.cmd exec prettier --write src/styles/globals.css src/styles/globals.test.ts
```

Expected: token tests and the full unit suite pass.

- [ ] **Step 5: Security-scan and commit the token layer**

After worktree and staged security scans:

```powershell
git add src/styles/globals.css src/styles/globals.test.ts
git commit -m "feat: establish tattoo generator theme tokens"
```

## Task 4: Unify authentication and root error states

**Files:**

- Modify: `src/routes/(auth)/sign-in.tsx`
- Modify: `src/routes/(auth)/sign-up.tsx`
- Modify: `src/routes/(auth)/forgot-password.tsx`
- Modify: `src/routes/(auth)/reset-password.tsx`
- Modify: `src/routes/(auth)/verify-email.tsx`
- Modify: `src/routes/(auth)/redeem-invite.tsx`
- Modify: `src/routes/__root.tsx`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`

- [ ] **Step 1: Add matched English and Chinese presentation copy**

Add flat message keys for authentication artwork benefits, privacy/support copy, branded loading text, permission errors, empty/search states, and the 404 secondary action. Keep both locale files key-for-key identical.

- [ ] **Step 2: Move all six authentication routes onto `AuthShell`**

Keep every form field, validation schema, provider button, callback URL, mutation, invite check, and redirect unchanged. Replace only the duplicated centered-card wrappers with the shared shell. Pass translated copy from the route into the pure component.

- [ ] **Step 3: Replace the root fallback screens with `PageState`**

Update `NotFound` and `RootError` in `__root.tsx` to provide:

- Original brand artwork.
- A localized home action and a localized start-creating action.
- Retry only for retryable root errors.
- Correct semantic heading order and focusable actions.
- Existing TanStack not-found status behavior.

- [ ] **Step 4: Run tests, typecheck, and build**

Run:

```powershell
pnpm.cmd test
pnpm.cmd exec tsc --noEmit
pnpm.cmd run build
```

Expected: zero test, type, or build failures; auth business logic diff contains no behavioral changes.

- [ ] **Step 5: Security-scan and commit authentication/error styling**

After both scans and manual auth-flow diff review:

```powershell
git add -- messages/en.json messages/zh.json src/routes/__root.tsx 'src/routes/(auth)' src/components/auth-shell.tsx src/components/page-state.tsx
git commit -m "feat: unify authentication and error pages"
```

Use PowerShell literal paths when staging route-group files if parentheses are interpreted by the shell.

## Task 5: Recompose the public marketing experience

**Files:**

- Modify: `src/routes/index.tsx`
- Modify: `src/routes/pricing.tsx`
- Modify: `src/routes/blog/index.tsx`
- Modify: `src/routes/blog/$slug.tsx`
- Modify: `src/routes/(pages)/route.tsx`
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/components/blog-card.tsx`
- Modify: `src/components/pricing-table.tsx`
- Modify: `src/blocks/header.tsx`
- Modify: `src/blocks/hero.tsx`
- Modify: `src/blocks/models-strip.tsx`
- Modify: `src/blocks/features.tsx`
- Modify: `src/blocks/gallery.tsx`
- Modify: `src/blocks/stats.tsx`
- Modify: `src/blocks/pricing.tsx`
- Modify: `src/blocks/faq.tsx`
- Modify: `src/blocks/blog.tsx`
- Modify: `src/blocks/cta.tsx`
- Modify: `src/blocks/footer.tsx`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`

- [ ] **Step 1: Build the split hero with original art**

Rework `Hero` into a two-column composition: value proposition and actions on the left, `BrandArtwork` plus a compact preview treatment on the right. Keep `PromptLauncher` as the primary path into creation and preserve signed-in redirect behavior in `index.tsx`.

- [ ] **Step 2: Restore the complete landing-page narrative**

Compose the homepage in this order:

```tsx
<Hero />
<ModelsStrip />
<Features />
<Gallery />
<Stats />
<Pricing />
<Faq />
<Blog />
<Cta />
```

Keep one `h1`, use a consistent section-width and heading rhythm, and lazy-load every below-the-fold content image with explicit dimensions.

- [ ] **Step 3: Apply the same public shell to pricing, blog, and legal pages**

Use the transparent-to-paper header, warm card surfaces, deep-purple selected/action states, readable article measure, and shared footer. Preserve route loaders, metadata, canonical URLs, hreflang, blog queries, and MDX rendering.

- [ ] **Step 4: Verify public routes**

Run:

```powershell
pnpm.cmd test
pnpm.cmd exec tsc --noEmit
pnpm.cmd run build
```

Expected: public routes compile, only one `h1` is rendered per page, and no external reference-site asset is introduced.

- [ ] **Step 5: Security-scan and commit the marketing surface**

After scans:

```powershell
git add -- messages/en.json messages/zh.json src/routes/index.tsx src/routes/pricing.tsx src/routes/blog 'src/routes/(pages)' src/components/site-header.tsx src/components/site-footer.tsx src/components/blog-card.tsx src/components/pricing-table.tsx src/blocks
git commit -m "feat: redesign the public tattoo generator experience"
```

## Task 6: Redesign the Agent workspace without changing FastClaw behavior

**Files:**

- Modify: `src/components/agent/agent-layout.tsx`
- Modify: `src/components/agent/chats-sidebar.tsx`
- Modify: `src/components/agent/chat-cover.tsx`
- Modify: `src/components/agent/chat-transcript.tsx`
- Modify: `src/components/agent/chat-composer.tsx`
- Modify: `src/components/agent/composer-controls.tsx`
- Modify: `src/components/agent/composer-settings.tsx`
- Modify: `src/components/agent/prompt-launcher.tsx`
- Modify: `src/components/agent/preview-pane.tsx`
- Modify: `src/components/agent/upgrade-dialog.tsx`
- Modify: `src/routes/(agent)/chat/index.tsx`
- Modify: `src/routes/(agent)/chat/$sessionId.tsx`
- Modify: `src/routes/(agent)/chats.tsx`
- Modify: `src/routes/(agent)/library.tsx`
- Modify: `src/routes/(agent)/editor.tsx`
- Test: `src/lib/agent-settings.test.ts`
- Test: `src/modules/agent/*.test.ts`

- [ ] **Step 1: Lock down the current Agent behavior with focused tests**

Run:

```powershell
pnpm.cmd test -- src/lib/agent-settings.test.ts src/modules/agent/fastclaw.test.ts src/modules/agent/history.test.ts src/modules/agent/paywall.test.ts src/modules/agent/tools.test.ts
```

Expected: focused suite passes before presentation work.

- [ ] **Step 2: Apply the approved three-pane desktop workspace**

- Left: branded navigation, conversation history, active purple state, user entry.
- Center: readable transcript, larger rounded prompt editor, visible attachment and settings controls.
- Right: preview gallery, generation metadata, download actions, and an empty state built from `PageState`.
- Keep the existing session guards, streaming transport, credits, refund behavior, uploads, annotations, and FastClaw API routes untouched.

- [ ] **Step 3: Implement tablet and mobile behavior**

At 768 to 1279 pixels, collapse the left sidebar and keep chat plus preview. Below 768 pixels, make chat the primary view and open settings/preview through the existing sheet or drawer primitives. Every icon-only action gets an accessible label and every touch action is at least 44 pixels.

- [ ] **Step 4: Run focused and full verification**

Run:

```powershell
pnpm.cmd test -- src/lib/agent-settings.test.ts src/modules/agent
pnpm.cmd test
pnpm.cmd exec tsc --noEmit
pnpm.cmd run build
```

Expected: no Agent logic regression and a clean production build.

- [ ] **Step 5: Security-scan and commit the workspace redesign**

After scans and a manual check that no secret or provider request moved to client code:

```powershell
git add -- src/components/agent 'src/routes/(agent)'
git commit -m "feat: redesign the tattoo agent workspace"
```

## Task 7: Unify user settings, admin, tables, and empty states

**Files:**

- Modify: `src/components/app-layout.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/components/data-table.tsx`
- Modify: `src/components/user-menu.tsx`
- Modify: `src/routes/settings/-settings-form.tsx`
- Modify: `src/routes/settings/index.tsx`
- Modify: `src/routes/settings/profile.tsx`
- Modify: `src/routes/settings/billing.tsx`
- Modify: `src/routes/settings/credits.tsx`
- Modify: `src/routes/settings/payments.tsx`
- Modify: `src/routes/settings/apikeys.tsx`
- Modify: `src/routes/settings/tickets.tsx`
- Modify: `src/routes/settings/route.tsx`
- Modify: `src/routes/admin/index.tsx`
- Modify: `src/routes/admin/users.tsx`
- Modify: `src/routes/admin/invite-codes.tsx`
- Modify: `src/routes/admin/roles.tsx`
- Modify: `src/routes/admin/permissions.tsx`
- Modify: `src/routes/admin/payments.tsx`
- Modify: `src/routes/admin/subscriptions.tsx`
- Modify: `src/routes/admin/credits.tsx`
- Modify: `src/routes/admin/categories.tsx`
- Modify: `src/routes/admin/posts.tsx`
- Modify: `src/routes/admin/chats.tsx`
- Modify: `src/routes/admin/tickets.tsx`
- Modify: `src/routes/admin/settings.tsx`
- Modify: `src/routes/admin/route.tsx`

- [ ] **Step 1: Upgrade the shared authenticated shell**

Give `AppLayout` and `AppSidebar` the warm-paper main surface, purple active item, compact mobile top bar, branded loading state, and contained scrolling. Keep session, invite, permission, and redirect effects byte-for-byte equivalent where possible.

- [ ] **Step 2: Standardize page headings and actions**

Replace route-specific heading wrappers with `PageHeading`. User pages retain comfortable spacing; admin pages use the same shell with a denser content modifier. Keep every existing query, mutation, permission gate, and dialog invocation unchanged.

- [ ] **Step 3: Standardize tables, filters, and state feedback**

Use bordered card containers, purple focus/selected states, contained horizontal scrolling, skeleton loading, and `PageState` for empty/error results. Preserve manual pagination and the existing `loading` contract in `DataTable`.

- [ ] **Step 4: Run type, tests, and build verification**

Run:

```powershell
pnpm.cmd test
pnpm.cmd exec tsc --noEmit
pnpm.cmd run build
```

Expected: all route data types and permission logic compile and tests remain green.

- [ ] **Step 5: Security-scan and commit dashboard changes**

After scans, including explicit review of auth and admin permission paths:

```powershell
git add src/components/app-layout.tsx src/components/app-sidebar.tsx src/components/data-table.tsx src/components/user-menu.tsx src/routes/settings src/routes/admin
git commit -m "feat: unify user and admin workspaces"
```

## Task 8: Complete localization, accessibility, and public metadata

**Files:**

- Modify: `messages/en.json`
- Modify: `messages/zh.json`
- Create: `src/lib/i18n-message-parity.test.ts`
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/routes/pricing.tsx`
- Modify: `src/routes/blog/index.tsx`
- Modify: `src/routes/blog/$slug.tsx`
- Verify: `src/routes/sitemap[.]xml.ts`
- Verify: `src/routes/robots[.]txt.ts`

- [ ] **Step 1: Add a locale-key parity regression test**

The test loads both JSON files, compares sorted keys, and reports keys missing from either locale. It must also reject empty values for the new visual-system messages.

- [ ] **Step 2: Remove remaining hardcoded user-facing strings**

Search:

```powershell
rg -n 'Loading\.\.\.|No results|Not found|Try again|Unauthorized' src/routes src/components
```

Move matching user-facing text into flat message keys in both locales. Keep technical console-only messages unchanged.

- [ ] **Step 3: Audit accessibility and metadata in code**

Confirm:

- One meaningful `h1` on every public page.
- Visible keyboard focus and accessible names for icon buttons.
- Form errors remain linked to their fields.
- Decorative SVGs use empty/hidden semantics; meaningful imagery has alt text.
- Public pages retain unique title, description, canonical, and locale alternates.
- `robots.txt` still blocks `/admin`, `/settings`, and `/api`.
- `sitemap.xml` still includes every public static route and published article.

- [ ] **Step 4: Run localization and production checks**

Run:

```powershell
pnpm.cmd test -- src/lib/i18n-message-parity.test.ts
pnpm.cmd test
pnpm.cmd exec tsc --noEmit
pnpm.cmd run build
pnpm.cmd run cf:build
```

Expected: locale parity, all unit tests, both type/build paths pass.

- [ ] **Step 5: Security-scan and commit the completion pass**

After scans:

```powershell
git add -- messages/en.json messages/zh.json src/lib/i18n-message-parity.test.ts src/routes/__root.tsx src/routes/index.tsx src/routes/pricing.tsx src/routes/blog
git commit -m "feat: complete localized visual system coverage"
```

## Task 9: Verify the real UI in a browser and fix regressions

**Files:**

- Modify as needed: only files already in scope above
- Create locally only: browser screenshots under an ignored temporary QA directory

- [ ] **Step 1: Read and use the Playwright CLI skill**

Use `NO_UPDATE_NOTIFIER=1` on every Playwright CLI invocation on this machine. Start the app with `pnpm.cmd run dev` in a persistent terminal session and wait for the local URL.

- [ ] **Step 2: Verify public and auth routes**

Check `/`, `/pricing`, `/blog`, `/privacy-policy`, `/terms-of-service`, `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, and an unknown route in this matrix:

- 1440-pixel desktop, 768-pixel tablet, 390-pixel mobile.
- Light and dark themes.
- English and Chinese locale URLs.
- No horizontal overflow.
- Keyboard focus reaches navigation, fields, and primary actions in a sensible order.
- Console has no new errors and required network responses succeed.

- [ ] **Step 3: Verify authenticated route shells**

Use an existing safe local test account or create a local-only account. Check `/chat`, a session page, `/chats`, `/library`, `/editor`, all `/settings` pages, `/admin`, an admin table page, and `/admin/settings`. Do not weaken route guards for visual testing.

- [ ] **Step 4: Fix and re-run until the matrix is clean**

For each issue, reproduce at the failing viewport/theme/locale, make the smallest fix, then repeat the same route and one neighboring route. Delete temporary screenshots after review unless the user asks to keep them.

- [ ] **Step 5: Security-scan and commit browser-found fixes**

Run both scans and commit only if browser QA required changes:

```powershell
git diff --name-only
git add -p
git diff --cached --check
git commit -m "fix: resolve cross-surface visual regressions"
```

## Task 10: Run the launch audit, review the branch, and push GitHub

**Files:**

- Review: all changes from `origin/main...HEAD`
- Verify: `.gitignore`
- Verify: `wrangler.example.jsonc`
- Verify: `.env.example`

- [ ] **Step 1: Run the repository launch-audit skill in `all` mode**

Perform responsive, theme, SEO, performance, and security passes in that order. Fix only real launch blockers or issues directly caused by this branch.

- [ ] **Step 2: Run the final automated gate**

Run:

```powershell
pnpm.cmd run format:check
pnpm.cmd test
pnpm.cmd exec tsc --noEmit
pnpm.cmd run build
pnpm.cmd run cf:build
git diff --check origin/main...HEAD
```

Expected: all commands exit zero. Record any pre-existing non-blocking compiler warning precisely.

- [ ] **Step 3: Perform a distinct code-review pass**

Inspect:

```powershell
git diff --stat origin/main...HEAD
git diff origin/main...HEAD -- src messages package.json wrangler.example.jsonc .env.example
git status --short --branch
```

Review for copied reference assets, hardcoded colors that break dark mode, missing translations, client-visible secrets, auth/RBAC changes, responsive overflow, unreachable actions, and unintended generated files.

- [ ] **Step 4: Run the final security gate**

Use the security-scan skill on the complete worktree and staged state. HIGH findings block the push. Confirm the FastClaw API key and all production secrets are absent from tracked files and Git history.

- [ ] **Step 5: Push the verified branch**

Run:

```powershell
git push origin main
git status --short --branch
```

Expected: GitHub repository `yestupa/tattoogen` advances to the verified local HEAD and the branch is synchronized.

## Task 11: Provision and publish Cloudflare production

**Files:**

- Local ignored config: `wrangler.jsonc`
- Local ignored config: `.env.production`
- Generated/reviewed migrations: `drizzle/`
- Verify: `wrangler.example.jsonc`
- Verify: `scripts/cf-deploy.mjs`

- [ ] **Step 1: Invoke the repository deploy-cloudflare skill with the chosen domain**

Use D1, Worker name `tattoo-generator`, D1 name `tattoo-generator`, domain `bestaitattoogenerator.com`, FastClaw base URL `https://cloud.fastclaw.ai`, and Agent ID `agt_1d82e3db42549e69c6ff`. Check Wrangler authentication, account identity, existing resources, migration counts, RBAC seed, secret names, admin count, and current deployment state.

- [ ] **Step 2: Complete first-time infrastructure setup after its required confirmation**

If this is the first deploy, announce the exact Worker and D1 names and pause at the deploy skill's first-time checkpoint. After confirmation:

- Create or reuse the D1 database.
- Put the real D1 ID only in ignored `wrangler.jsonc`.
- Generate and review migrations, then apply them remotely.
- Seed RBAC roles and permissions idempotently.
- Generate and pipe `AUTH_SECRET` and `CONFIG_ENCRYPTION_KEY` into Wrangler secrets without printing their values.
- Configure `FASTCLAW_API_KEY` only through a Workers secret or the encrypted admin settings flow; never place it in `vars`, source, plan, command output, or Git.
- Keep `FASTCLAW_BASE_URL` and `FASTCLAW_AGENT_ID` as non-secret Worker variables.

- [ ] **Step 3: Validate the custom-domain prerequisites**

Confirm the domain or parent zone belongs to the authenticated Cloudflare account. Ensure both ignored `.env.production` and ignored `wrangler.jsonc` use `https://bestaitattoogenerator.com`, and the custom-domain route is present.

- [ ] **Step 4: Present the final deployment summary and request the required deploy confirmation**

Report account name/ID, Worker, D1, migration count, RBAC state, configured secret names only, and domain. The deploy-cloudflare skill requires an explicit final `yes` before running the irreversible production deploy.

- [ ] **Step 5: Deploy only through the repository script**

After confirmation, run:

```powershell
pnpm.cmd run cf:deploy
```

Expected: Wrangler reports a successful Worker version and the custom domain.

- [ ] **Step 6: Smoke-test production and browser-test the live site**

Verify HTTPS responses and rendered behavior for:

- `/`
- `/api/config/public`
- `/robots.txt`
- `/sitemap.xml`
- `/sign-in`
- `/sign-up`
- `/pricing`
- `/zh`
- a deliberate 404 path

Open the live site at desktop and mobile widths, check light/dark themes, console output, key network requests, canonical URLs, auth page rendering, and no horizontal overflow. A real FastClaw generation smoke test is completed after the secret is securely available and an authenticated account has credits.

- [ ] **Step 7: Defer the first super administrator exactly as requested**

Skip automatic admin creation during deployment. After the user registers at the live `/sign-up` page and provides the account email, assign `super_admin` with the deployment skill's promote-existing-user flow, verify one matching role row, then ask the user to sign out and sign back in before opening `/admin/settings`.

- [ ] **Step 8: Final handoff evidence**

Report:

- GitHub commit SHA and synchronized branch.
- Cloudflare Worker name and deployment version.
- D1 name, migration count, and RBAC status.
- Live custom-domain URL and HTTP smoke results.
- Automated test, typecheck, format, normal build, Cloudflare build, security, and browser QA outcomes.
- The single remaining manual action: register the intended account and send its email for `super_admin` promotion, if that step has not yet happened.
