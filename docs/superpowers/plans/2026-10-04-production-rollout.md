# Production Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify the complete release, apply additive D1 migrations safely, push the exact tested commit to GitHub, deploy it to Cloudflare, and prove the public and protected production behavior.

**Architecture:** Treat build artifacts and migrations as immutable release inputs. Capture pre-deploy evidence, apply additive migrations before the compatible Worker, deploy once confirmed by the user’s standing authorization, then run browser and HTTP acceptance checks against the custom domain.

**Tech Stack:** Git, Vitest, TypeScript, Vite, Wrangler, Cloudflare Workers, D1, Playwright CLI

---

### Task 1: Run the complete local quality gate

**Files:**

- Modify only when a failing check reveals an in-scope defect

- [ ] **Step 1: Confirm the worktree and diff**

Run: `git status --short --branch`

Run: `git diff --stat HEAD~1`

Expected: only planned product, test, migration, translation, legal, and documentation files are changed.

- [ ] **Step 2: Run formatting**

Run: `pnpm format:check`

Expected: all matched files use Prettier formatting.

- [ ] **Step 3: Run all tests**

Run: `pnpm test`

Expected: every Vitest file passes with no unhandled rejection.

- [ ] **Step 4: Run TypeScript**

Run: `npx tsc --noEmit`

Expected: zero TypeScript errors.

- [ ] **Step 5: Run normal and Cloudflare builds**

Run: `npm.cmd run build`

Run: `npm.cmd run cf:build`

Expected: both builds complete successfully.

- [ ] **Step 6: Run the security scanner and manual review**

Run: `$env:PYTHONUTF8='1'; python .claude/skills/security-scan/scripts/scan_staged.py --worktree`

Review every changed file for authorization, IDOR, billing trust, email and FastClaw key exposure, stored XSS, Contact spam, destructive deletes, and webhook idempotency.

Expected: no HIGH or unresolved MEDIUM finding.

### Task 2: Run real-browser local acceptance

**Files:**

- No source change unless a verified defect is found

- [ ] **Step 1: Start the production-like local server**

Run: `pnpm dev`

Expected: local URL responds and no startup error appears.

- [ ] **Step 2: Verify public desktop and mobile pages**

Use Playwright CLI with `NO_UPDATE_NOTIFIER=1` at 1440 by 900, 768 by 1024, and 390 by 844. Check home, pricing, Blog, Contact, Privacy, Terms, sign-in, sign-up, and an unknown URL.

Expected: no horizontal overflow, missing translation, broken navigation, console error, or failed critical request.

- [ ] **Step 3: Verify administrator flows**

Use a local super administrator and test article create, save, reopen, category label, English and Chinese states, price save, Credit save, discount create, token usage, Contact ticket view, and ordinary-user delete with a disposable user.

Expected: every saved value survives reload and restricted operations remain unavailable to an ordinary user.

- [ ] **Step 4: Verify registration activation**

With a test email provider configuration, register a disposable account, confirm no usable session before activation, open the activation link, and confirm onboarding happens once.

Expected: one user, one default role assignment, one signup Credit grant, and one admin notification event.

### Task 3: Prepare the exact release commit

**Files:**

- All completed implementation and documentation files

- [ ] **Step 1: Inspect final status and staged diff**

Run: `git status --short`

Run: `git diff --check`

Expected: no accidental generated output, environment file, database file, credential, or whitespace error.

- [ ] **Step 2: Run staged security scan**

Run: `$env:PYTHONUTF8='1'; python .claude/skills/security-scan/scripts/scan_staged.py`

Expected: clean.

- [ ] **Step 3: Commit final integration adjustments**

Commit with `feat: complete admin operations release` when uncommitted planned changes remain.

- [ ] **Step 4: Record release identity**

Run: `git rev-parse HEAD`

Expected: one full commit SHA used for GitHub and production verification.

### Task 4: Inspect production before migration

**Files:**

- No source change

- [ ] **Step 1: Verify Cloudflare identity and resources**

Run: `npx wrangler whoami`

Run: `npx wrangler d1 list`

Expected: the authenticated account contains D1 database `tattoo-generator`.

- [ ] **Step 2: Record migration state**

Run: `npx wrangler d1 migrations list tattoo-generator --remote`

Expected: existing migration state is readable before applying new files.

- [ ] **Step 3: Record critical row counts**

Query user, role, user_role, order, subscription, credit, post, ticket, and config counts without selecting secret values.

Expected: a compact pre-migration snapshot for comparison.

### Task 5: Apply production D1 migrations

**Files:**

- No source change

- [ ] **Step 1: Apply remote migrations**

Run: `npx wrangler d1 migrations apply tattoo-generator --remote`

Expected: only migrations 0001 through 0003 apply, each once.

- [ ] **Step 2: Verify new tables and old counts**

Query SQLite schema names plus prior critical table counts.

Expected: all new tables exist and old data counts remain unchanged.

- [ ] **Step 3: Verify super administrator role**

Query the role join for `success@yestupa.com` without selecting credentials.

Expected: one `super_admin` row.

### Task 6: Configure production non-secret settings and email prerequisites

**Files:**

- No Git-tracked file changes

- [ ] **Step 1: Set operational config**

Write `notification_email` as `yestupaofficial@gmail.com`, enable email authentication, and keep email verification disabled until a provider key and verified sender are both present.

- [ ] **Step 2: Configure provider credentials securely**

Store the Resend API Key and verified sender through encrypted admin settings or Wrangler secret input. Do not echo values.

- [ ] **Step 3: Test provider and enable verification**

Use the existing admin email test endpoint. Only after a successful delivery, set `email_verification_enabled` to true.

Expected: provider test succeeds and registration is fail-closed thereafter.

### Task 7: Push and deploy

**Files:**

- No source change

- [ ] **Step 1: Push the tested commit**

Run: `git push origin main`

Expected: GitHub `yestupa/tattoogen` main points to the recorded release SHA.

- [ ] **Step 2: Deploy the same checkout**

Run: `npm.cmd run cf:deploy`

Expected: Wrangler reports a successful Worker version and the custom-domain route.

- [ ] **Step 3: Record Worker version**

Run: `npx wrangler deployments list --name tattoo-generator`

Expected: newest deployment timestamp and version correspond to this release.

### Task 8: Verify production HTTP and browser behavior

**Files:**

- No source change unless a production-only defect is reproduced locally

- [ ] **Step 1: Run HTTP smoke checks**

Check `/`, `/zh`, `/pricing`, `/blog`, `/zh/blog`, `/contact`, `/privacy-policy`, `/terms-of-service`, `/sign-in`, `/sign-up`, `/robots.txt`, `/sitemap.xml`, and `/api/config/public`.

Expected: public pages and public APIs return 200; protected APIs return Unauthorized without a session; unknown pages return 404.

- [ ] **Step 2: Inspect Sitemap**

Confirm Contact appears, static demo posts do not appear, no draft appears, URLs are unique, and each alternate points to a real published translation.

- [ ] **Step 3: Run production browser checks**

Use Playwright CLI with `NO_UPDATE_NOTIFIER=1` on desktop and mobile. Check navigation, footer, theme, locale switching, Contact submission, 404 CTA, console, and network failures.

- [ ] **Step 4: Verify administrator production pages**

Sign out and sign in again as `success@yestupa.com`, then verify pricing, discounts, bilingual posts, usage, users, and tickets. Do not create a destructive price or user change beyond disposable test records.

- [ ] **Step 5: Verify activation and notifications**

After email credentials are configured, register a disposable mailbox, open its activation link, confirm login, then use a payment-provider test mode transaction if configured.

Expected: registration, activation, admin registration notification, payment fulfillment, and admin payment notification each happen once.

### Task 9: Final code review and handoff

**Files:**

- No source change unless review finds an actionable defect

- [ ] **Step 1: Review final commit range**

Run: `git diff e22664fa7ad86420c832c8105de0497049f2e9f5..HEAD --stat`

Review business logic, access control, schema compatibility, translations, and public routes separately from test results.

- [ ] **Step 2: Confirm clean repository**

Run: `git status --short --branch`

Expected: clean and synchronized with `origin/main`.

- [ ] **Step 3: Report exact evidence**

Report release SHA, Worker version, applied migrations, test totals, build results, browser viewports, verified production routes, email delivery result, and any credential-dependent limitation.
