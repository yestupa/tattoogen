# Tattoo Generator Black Ink Site Refresh Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task by task. This repository must be implemented inline because delegated subagents are not available for this task.

Goal: Rebuild the homepage from the approved black-ink reference, carry the same visual system through every public, authentication, agent, user, admin, and error surface, then push and deploy the verified result.

Architecture: Preserve the existing TanStack routes, query boundaries, API contracts, authentication guards, FastClaw flow, pricing data, blog data, and RBAC behavior. Replace the visual foundation first, then migrate durable shells, disposable landing blocks, and route-level composition. Tests will lock down section order, translation parity, business markers, responsive contracts, and the removal of the credit-card disclaimer before browser QA.

Tech Stack: TanStack Start, React 19, TypeScript strict mode, Tailwind CSS 4, shadcn Base Nova primitives, Paraglide i18n, TanStack Query, Vitest, Playwright CLI, Cloudflare Workers, D1, Wrangler.

## File responsibility map

- src/styles/globals.css owns theme tokens, font families, section surfaces, focus, motion, and reusable layout utilities.
- src/routes/\_\_root.tsx owns font imports, document defaults, root error handling, and the four-zero-four composition.
- src/components/site-header.tsx and src/components/site-footer.tsx own the public shell.
- src/components/auth-shell.tsx owns all authentication page presentation.
- src/components/app-layout.tsx and src/components/app-sidebar.tsx own user and admin workspaces.
- src/components/agent owns the generator workspace presentation.
- src/blocks owns translated homepage composition.
- messages/en.json and messages/zh.json own all visible English and Chinese copy.
- src/routes/-black-ink-refresh-contract.test.ts owns new source-level visual regression contracts.
- Existing business tests remain authoritative for auth, pricing, posts, credits, FastClaw, and permissions.

## Task 1: Record the baseline and add failing visual contracts

Files:

- Create: src/routes/-black-ink-refresh-contract.test.ts
- Modify: src/styles/globals.test.ts
- Modify: src/routes/-public-visual-contract.test.ts
- Inspect: src/routes/-auth-visual-contract.test.ts
- Inspect: src/components/agent/workspace-visual.test.tsx
- Inspect: src/components/dashboard-contract.test.tsx

☐ Step 1: Run the clean baseline

    git status --short --branch
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: the branch is ahead only by the approved design commit, every current test passes, typecheck exits zero, and the production build exits zero.

☐ Step 2: Create the failing black-ink contract test

The new test reads source files as UTF-8 and asserts the approved palette, homepage composition, local asset policy, global shell markers, and forbidden copy.

    import { readFileSync } from 'node:fs';
    import { describe, expect, it } from 'vitest';

    const source = (path: string) =>
      readFileSync(new URL(path, import.meta.url), 'utf8');

    describe('black ink site refresh contracts', () => {
      it('uses the approved ink paper and vermilion anchors', () => {
        const css = source('../styles/globals.css').toLowerCase();
        expect(css).toContain('--ink-bg: #111110;');
        expect(css).toContain('--ink-panel: #1a1a18;');
        expect(css).toContain('--paper-bg: #faf8f4;');
        expect(css).toContain('--vermilion: #a83e2c;');
      });

      it('composes the approved homepage narrative', () => {
        const home = source('./index.tsx');
        expect(home.indexOf('<Hero')).toBeLessThan(home.indexOf('<Stats'));
        expect(home.indexOf('<Stats')).toBeLessThan(home.indexOf('<StartWays'));
        expect(home.indexOf('<StartWays')).toBeLessThan(home.indexOf('<Workbench'));
        expect(home.indexOf('<Workbench')).toBeLessThan(home.indexOf('<Features'));
        expect(home.indexOf('<Features')).toBeLessThan(home.indexOf('<Steps'));
        expect(home.indexOf('<Steps')).toBeLessThan(home.indexOf('<Gallery'));
        expect(home.indexOf('<Gallery')).toBeLessThan(home.indexOf('<TryOn'));
        expect(home.indexOf('<TryOn')).toBeLessThan(home.indexOf('<Studio'));
        expect(home.indexOf('<Studio')).toBeLessThan(home.indexOf('<Reviews'));
        expect(home.indexOf('<Reviews')).toBeLessThan(home.indexOf('<Pricing'));
        expect(home.indexOf('<Pricing')).toBeLessThan(home.indexOf('<Blog'));
        expect(home.indexOf('<Blog')).toBeLessThan(home.indexOf('<FAQ'));
        expect(home.indexOf('<FAQ')).toBeLessThan(home.indexOf('<CTA'));
      });

      it('does not publish the removed disclaimer or remote reference assets', () => {
        const combined =
          source('../../messages/en.json') +
          source('../../messages/zh.json') +
          source('./index.tsx');
        expect(combined).not.toContain('No credit card required');
        expect(combined).not.toContain('无需信用卡');
        expect(combined).not.toMatch(/tat\.ink/i);
      });
    });

☐ Step 3: Update existing visual tests to the new design anchors

Change globals.test.ts from violet anchors to these assertions:

    expect(light).toMatch(/--background:\s*#faf8f4\s*;/);
    expect(light).toMatch(/--foreground:\s*#211f1b\s*;/);
    expect(light).toMatch(/--primary:\s*#171613\s*;/);
    expect(dark).toMatch(/--background:\s*#111110\s*;/);
    expect(dark).toMatch(/--card:\s*#1a1a18\s*;/);
    expect(css).toMatch(/--vermilion:\s*#a83e2c\s*;/);

Update the public route test so it expects the new section order and still asserts one main landmark, one home-page first-level heading, local image dimensions, lazy loading below the fold, session-cookie redirect, pricing loader, blog loader, canonical links, and mobile navigation focus restoration.

☐ Step 4: Run the focused tests and confirm they fail for the intended reasons

    pnpm.cmd test -- src/routes/-black-ink-refresh-contract.test.ts src/styles/globals.test.ts src/routes/-public-visual-contract.test.ts

Expected: failures mention missing black-ink tokens and missing new homepage blocks. Existing auth, agent, pricing, and blog markers must not fail.

☐ Step 5: Run the security scan and commit the tests

    $env:PYTHONUTF8='1'
    python .claude/skills/security-scan/scripts/scan_staged.py --worktree
    Remove-Item Env:PYTHONUTF8
    git add src/routes/-black-ink-refresh-contract.test.ts src/styles/globals.test.ts src/routes/-public-visual-contract.test.ts
    $env:PYTHONUTF8='1'
    python .claude/skills/security-scan/scripts/scan_staged.py
    Remove-Item Env:PYTHONUTF8
    git commit -m "test: define black ink visual contracts"

Expected: both scans have no HIGH or MEDIUM findings and the commit succeeds.

## Task 2: Establish fonts and the black-ink token layer

Files:

- Modify: package.json
- Modify: pnpm-lock.yaml
- Modify: src/routes/\_\_root.tsx
- Modify: src/styles/globals.css
- Modify: src/styles/globals.test.ts

☐ Step 1: Add Archivo as a local variable font

    pnpm.cmd add @fontsource-variable/archivo

Import it in the root document:

    import '@fontsource-variable/archivo';
    import '@fontsource-variable/inter';

Keep Inter. Remove Libre Baskerville imports only after every former serif presentation class has been migrated.

☐ Step 2: Replace the global token anchors

Define the following in globals.css:

    :root {
      --font-display: 'Archivo Variable', 'Arial Narrow', sans-serif;
      --font-sans: 'Inter Variable', 'Noto Sans SC', sans-serif;
      --ink-bg: #111110;
      --ink-panel: #1a1a18;
      --ink-fg: #f4f0e8;
      --ink-muted: #9b9488;
      --ink-line: #2c2b27;
      --paper-bg: #faf8f4;
      --paper-panel: #ffffff;
      --paper-fg: #211f1b;
      --paper-muted: #6f6a5f;
      --paper-line: #e5e0d4;
      --vermilion: #a83e2c;
    }

Map light semantic tokens to paper colors, dark semantic tokens to ink colors, and keep destructive independent from vermilion. Export display, ink, paper, and vermilion values through the Tailwind theme.

☐ Step 3: Add reusable presentation utilities

Implement focused classes:

    .font-display {
      font-family: var(--font-display);
      font-variation-settings: 'wdth' 92;
    }

    .section-ink {
      background: var(--ink-bg);
      color: var(--ink-fg);
    }

    .section-paper {
      background: var(--paper-bg);
      color: var(--paper-fg);
    }

    .section-shell {
      width: min(100% - 2rem, 72rem);
      margin-inline: auto;
    }

    .eyebrow-vermilion {
      color: var(--vermilion);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

Keep visible focus, 44-pixel touch targets, reduced-motion behavior, slim scrollbars, semantic danger colors, and contained table overflow.

☐ Step 4: Run token tests, full tests, typecheck, and build

    pnpm.cmd test -- src/styles/globals.test.ts src/routes/-black-ink-refresh-contract.test.ts
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: palette tests pass. Homepage composition tests may still fail until later tasks. No business test regresses.

☐ Step 5: Security-scan and commit the foundation

Stage package.json, pnpm-lock.yaml, src/routes/\_\_root.tsx, src/styles/globals.css, and src/styles/globals.test.ts. Run worktree and staged security scans, review the dependency name and lockfile, then commit:

    git commit -m "feat: establish black ink design tokens"

## Task 3: Rebuild the public header and footer

Files:

- Modify: src/components/site-header.tsx
- Modify: src/components/site-footer.tsx
- Modify: src/blocks/header.tsx
- Modify: src/blocks/footer.tsx
- Modify: src/routes/-public-visual-contract.test.ts
- Modify: messages/en.json
- Modify: messages/zh.json

☐ Step 1: Add failing shell assertions

Assert that the header has an ink surface marker, a scroll state, a mobile trigger, a Blog entry, and no Admin or generator footer entry. Assert that the footer has Blog and Contact links and no ShipAny badge.

    const header = source('../components/site-header.tsx');
    expect(header).toContain('data-public-header');
    expect(header).toContain('data-scrolled');
    expect(header).toContain('public-mobile-nav');

    const footer = source('../blocks/footer.tsx');
    expect(footer).toContain('href: \'/blog\'');
    expect(footer).toContain('href: \'/contact\'');
    expect(footer).not.toContain('BuiltWithShipAny');

Run the focused test and confirm it fails before implementation.

☐ Step 2: Implement the header behavior

Keep locale-aware Link, session state, language selector, theme selector, user menu, Escape focus restoration, and external-link handling. Add a passive scroll listener with requestAnimationFrame or a small threshold so the header changes from transparent ink to near-opaque ink after approximately 24 pixels.

The visible structure must be:

    <header data-public-header data-scrolled={scrolled || undefined}>
      <div className="section-shell">
        <Link href="/">brand</Link>
        <nav>translated links</nav>
        <div>locale, theme, user or primary action</div>
        <button aria-controls="public-mobile-nav">menu</button>
      </div>
    </header>

Do not change auth queries or navigation destinations.

☐ Step 3: Implement the footer

Use the ink surface, compact brand statement, product/content/legal columns, locale selector, copyright, Blog, Contact, Privacy Policy, and Terms of Service. Keep all content passed through props and translations supplied by the block.

☐ Step 4: Verify shell behavior

    pnpm.cmd test -- src/routes/-public-visual-contract.test.ts
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: all header and footer contracts pass, with no hydration warning from scroll state.

☐ Step 5: Security-scan and commit the public shell

After both scans and a manual review of session and link behavior:

    git commit -m "feat: rebuild public navigation and footer"

## Task 4: Build the new static homepage sections

Files:

- Create: src/blocks/start-ways.tsx
- Create: src/blocks/workbench.tsx
- Create: src/blocks/steps.tsx
- Create: src/blocks/try-on.tsx
- Create: src/blocks/studio.tsx
- Create: src/blocks/reviews.tsx
- Modify: src/blocks/hero.tsx
- Modify: src/blocks/stats.tsx
- Modify: src/blocks/features.tsx
- Modify: src/blocks/gallery.tsx
- Modify: messages/en.json
- Modify: messages/zh.json
- Modify: src/routes/-black-ink-refresh-contract.test.ts

☐ Step 1: Add translation keys to both locales

Add complete bilingual keys for:

- Four Ways to Start
- From Idea to Flash Sheet
- Features
- Three Steps to Your Design
- Style Gallery
- See It on Your Skin
- Built for the Chair
- Trusted Before the Needle

English and Chinese keys must have identical names. Product claims must match current behavior. The preview section must describe a placement visualization and must not claim live camera tracking or medically accurate results.

☐ Step 2: Rebuild Hero and Stats

Hero remains the only home-page first-level heading and keeps PromptLauncher as the working creation handoff. Use an ink background, display headline, vermilion eyebrow, warm button, compact image or artwork card, and no credit-card disclaimer.

Stats uses the approved ink divider treatment and contains four maintained process indicators. It must not invent live user counts.

☐ Step 3: Create StartWays, Workbench, and Steps

Each block is translation-aware and has one responsibility:

- StartWays renders four paper-surface entry cards and links the available actions to the generator.
- Workbench explains the conversation-to-design flow and uses a local 16-to-9 visual.
- Steps renders three numbered stages on an ink surface.

Every image uses a project-local path, explicit width and height, an accurate alternative description, and lazy loading below the fold.

☐ Step 4: Rebuild Features and Gallery

Features renders four paper cards with line icons and concise capability copy. Gallery renders a responsive local-image grid using assets already under public/imgs. Do not copy or hotlink images from the reference attachment.

☐ Step 5: Create TryOn, Studio, and Reviews

- TryOn presents a static placement preview and a clear advisory that the preview supports planning.
- Studio describes export and refinement workflows that currently exist.
- Reviews contains product-example testimonials only. Avoid unverifiable numbers, media logos, and named endorsements.

☐ Step 6: Run focused and full verification

    pnpm.cmd test -- src/routes/-black-ink-refresh-contract.test.ts src/lib/i18n-message-parity.test.ts
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: new block imports compile, locale parity passes, and no block reads server-only code.

☐ Step 7: Security-scan and commit the static sections

Review image paths, links, and copy claims. Run worktree and staged scans, then commit:

    git commit -m "feat: add black ink homepage story sections"

## Task 5: Integrate data-driven pricing, blog, FAQ, CTA, and home composition

Files:

- Modify: src/routes/index.tsx
- Modify: src/blocks/pricing.tsx
- Modify: src/blocks/blog.tsx
- Modify: src/blocks/faq.tsx
- Modify: src/blocks/cta.tsx
- Remove if unused: src/blocks/models-strip.tsx
- Modify: src/routes/-public-visual-contract.test.ts
- Modify: src/routes/-black-ink-refresh-contract.test.ts
- Modify: messages/en.json
- Modify: messages/zh.json

☐ Step 1: Update the section-order regression

The expected home order is Hero, Stats, StartWays, Workbench, Features, Steps, Gallery, TryOn, Studio, Reviews, Pricing, Blog, FAQ, and CTA.

The test must still assert:

- one main landmark
- one first-level heading
- session-cookie redirect to chat
- the blog loader limit of three
- pricing data remains API driven
- the removed bilingual disclaimer is absent

☐ Step 2: Restyle the existing data blocks

Keep every pricing query, discount calculation, checkout mutation, sign-in redirect, and price display function unchanged. Change only outer section classes and presentation props.

Keep blog rendering when zero posts are returned, preserve the link to the blog index, and use an ink section with paper cards.

Keep FAQ keyboard semantics and existing truthful answers. Use the paper surface.

Keep CTA destinations. Use the ink surface and omit the removed disclaimer.

☐ Step 3: Recompose the home route

Import and render all approved blocks in order. Remove ModelsStrip only when no remaining page imports it. Preserve route loader, metadata, canonical, language alternates, client redirect, Footer, and SupportWidget.

☐ Step 4: Verify home behavior

    pnpm.cmd test -- src/routes/-public-visual-contract.test.ts src/routes/-black-ink-refresh-contract.test.ts src/lib/discount-label.test.ts
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: all visual contracts pass and pricing/blog business tests remain green.

☐ Step 5: Security-scan and commit homepage composition

After scans and manual review of checkout and redirect diffs:

    git commit -m "feat: compose the black ink landing page"

## Task 6: Restyle public content pages

Files:

- Modify: src/routes/pricing.tsx
- Modify: src/routes/contact.tsx
- Modify: src/routes/blog/index.tsx
- Modify: src/routes/blog/$slug.tsx
- Modify: src/routes/(pages)/route.tsx
- Modify: src/components/blog-card.tsx
- Modify: src/components/markdown-content.tsx
- Modify: src/components/mdx-components.tsx
- Modify: src/routes/-public-visual-contract.test.ts

☐ Step 1: Extend public-route tests

Assert that pricing, contact, blog index, blog article, and static-page layout all render Header and Footer, use the ink hero marker, and retain their loaders, canonical metadata, locale alternates, forms, Markdown rendering, and ticket API endpoint.

☐ Step 2: Apply the shared public composition

Each page uses:

- an ink heading band
- a paper content canvas
- white cards with paper-line borders
- Archivo display headings
- the shared ink footer

Keep contact form limits, honeypot, mutation, sign-in detection, and success state unchanged. Keep legal MDX content and article Markdown data untouched.

☐ Step 3: Run route tests and production checks

    pnpm.cmd test -- src/routes/-public-visual-contract.test.ts src/modules/contact/validation.test.ts src/modules/posts/service.test.ts
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: public pages compile and business markers remain present.

☐ Step 4: Security-scan and commit public pages

Review Markdown rendering for XSS, external image handling, form behavior, and canonical links. After clean scans:

    git commit -m "feat: align public content pages with the landing page"

## Task 7: Restyle authentication and root error surfaces

Files:

- Modify: src/components/auth-shell.tsx
- Modify: src/components/page-state.tsx
- Modify: src/routes/\_\_root.tsx
- Verify: src/routes/(auth)/sign-in.tsx
- Verify: src/routes/(auth)/sign-up.tsx
- Verify: src/routes/(auth)/forgot-password.tsx
- Verify: src/routes/(auth)/reset-password.tsx
- Verify: src/routes/(auth)/verify-email.tsx
- Verify: src/routes/(auth)/redeem-invite.tsx
- Modify: src/routes/-auth-visual-contract.test.ts

☐ Step 1: Add failing style markers without weakening behavior markers

Extend the auth contract to require ink canvas, paper form card, display heading, vermilion eyebrow, and unchanged route-specific markers for sign-in, sign-up, password reset, email verification, social auth, invite validation, and safe callback handling.

☐ Step 2: Rework AuthShell only

Use a full ink canvas, an ink visual panel, and a paper form panel. Keep one main landmark, the brand artwork, benefits, and a 44-pixel minimum form control target. Auth route files should need no business-logic edits.

☐ Step 3: Rework PageState and root four-zero-four

Use the black-ink state treatment. Preserve the correct 404 response, localized blog recommendations, home action, and generator CTA. Root errors retain retry behavior and do not expose raw stacks.

☐ Step 4: Verify authentication and error behavior

    pnpm.cmd test -- src/routes/-auth-visual-contract.test.ts src/components/design-system.test.tsx
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: all original auth markers pass and new style markers pass.

☐ Step 5: Security-scan and commit auth/error styling

Review safe callbacks, email verification, invite redemption, session redirects, and root error detail handling. After scans:

    git commit -m "feat: restyle authentication and error surfaces"

## Task 8: Align the Agent generator workspace

Files:

- Modify: src/components/agent/agent-layout.tsx
- Modify: src/components/agent/chats-sidebar.tsx
- Modify: src/components/agent/chat-cover.tsx
- Modify: src/components/agent/chat-transcript.tsx
- Modify: src/components/agent/chat-composer.tsx
- Modify: src/components/agent/composer-controls.tsx
- Modify: src/components/agent/composer-settings.tsx
- Modify: src/components/agent/prompt-launcher.tsx
- Modify: src/components/agent/preview-pane.tsx
- Modify: src/components/agent/upgrade-dialog.tsx
- Modify: src/components/agent/workspace-visual.test.tsx
- Verify: src/components/agent/history-regression.test.tsx
- Verify: src/components/agent/workspace-render.test.tsx

☐ Step 1: Run the focused Agent baseline

    pnpm.cmd test -- src/components/agent src/lib/agent-settings.test.ts src/modules/agent

Expected: every Agent component, settings, FastClaw, history, paywall, and tools test passes before styling.

☐ Step 2: Update visual assertions

Require an ink sidebar, paper transcript, ink or white composer surface, vermilion active state, contained preview pane, and existing responsive drawer markers. Keep every transport, annotation, session, upload, paywall, and credit marker.

☐ Step 3: Change presentation only

Apply the approved tokens and spacing to the Agent components. Do not change:

- FastClaw URLs or request payloads
- stream parsing
- session creation
- message persistence
- upload behavior
- credit checks or refunds
- settings serialization
- download behavior

☐ Step 4: Verify Agent behavior and build

    pnpm.cmd test -- src/components/agent src/lib/agent-settings.test.ts src/modules/agent
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: focused and full tests pass with no network contract change.

☐ Step 5: Security-scan and commit the workspace

Review all modified files for client-visible secrets and transport changes. After clean scans:

    git commit -m "feat: align the generator workspace with black ink styling"

## Task 9: Align user and admin workspaces

Files:

- Modify: src/components/app-layout.tsx
- Modify: src/components/app-sidebar.tsx
- Modify: src/components/data-table.tsx
- Modify: src/components/page-heading.tsx
- Modify: src/components/dashboard-contract.test.tsx
- Modify: src/routes/settings/route.tsx
- Modify: src/routes/settings/-settings-form.tsx
- Modify: src/routes/settings/index.tsx
- Modify: src/routes/settings/profile.tsx
- Modify: src/routes/settings/billing.tsx
- Modify: src/routes/settings/credits.tsx
- Modify: src/routes/settings/payments.tsx
- Modify: src/routes/settings/tickets.tsx
- Verify unchanged navigation exclusion: src/routes/settings/apikeys.tsx
- Modify: src/routes/admin/route.tsx
- Modify: src/routes/admin/index.tsx
- Modify: src/routes/admin/users.tsx
- Modify: src/routes/admin/invite-codes.tsx
- Modify: src/routes/admin/roles.tsx
- Modify: src/routes/admin/permissions.tsx
- Modify: src/routes/admin/usage.tsx
- Modify: src/routes/admin/payments.tsx
- Modify: src/routes/admin/subscriptions.tsx
- Modify: src/routes/admin/credits.tsx
- Modify: src/routes/admin/pricing.tsx
- Modify: src/routes/admin/discounts.tsx
- Modify: src/routes/admin/categories.tsx
- Modify: src/routes/admin/posts.tsx
- Modify: src/routes/admin/chats.tsx
- Modify: src/routes/admin/tickets.tsx
- Modify: src/routes/admin/contact-tickets.tsx
- Modify: src/routes/admin/settings.tsx

☐ Step 1: Add dashboard presentation contracts

Require a dark sidebar, paper work area, vermilion active navigation, white cards, compact admin modifier, contained table overflow, and unchanged session, invite, permission, deletion, pricing, discount, post, ticket, and settings markers.

☐ Step 2: Upgrade shared dashboard components

AppLayout owns the dark sidebar and paper inset. AppSidebar owns navigation states. DataTable owns borders and horizontal containment. PageHeading owns display font and spacing. Prefer these shared changes over page-by-page class churn.

Route files may change only when a hardcoded local class prevents the shared style from applying. Do not alter queries, mutations, permission requirements, confirmation dialogs, or API paths.

☐ Step 3: Verify dashboard behavior

    pnpm.cmd test -- src/components/dashboard-contract.test.tsx src/components/app-sidebar-navigation.test.ts src/modules/users/deletion.test.ts src/modules/commerce
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build

Expected: dashboard contracts and all business tests pass.

☐ Step 4: Security-scan and commit dashboard styling

Review admin permission gates, destructive actions, price edits, credit edits, and secret settings masks. After clean scans:

    git commit -m "feat: align user and admin workspaces with black ink styling"

## Task 10: Complete localization, copy removal, asset, and performance checks

Files:

- Modify: messages/en.json
- Modify: messages/zh.json
- Modify: src/lib/i18n-message-parity.test.ts
- Verify: public/imgs
- Verify: src/routes/sitemap route
- Verify: src/routes/robots route
- Verify: every source and component file changed in Tasks 2 through 9

☐ Step 1: Run exhaustive forbidden-copy and remote-asset searches

    rg -ni "No credit card required|无需信用卡" messages src public
    rg -ni "tat\.ink|images\.unsplash\.com|data-lvt-eid" src public messages

Expected: no output.

☐ Step 2: Verify locale parity and visible text ownership

Run the locale parity test. Search modified TSX files for new hardcoded English or Chinese user-facing copy and move it to both locale files.

    pnpm.cmd test -- src/lib/i18n-message-parity.test.ts

Expected: both locale files have identical non-empty keys.

☐ Step 3: Verify image policy and page metadata

Confirm every below-fold image has local source, width, height, alternative text, and lazy loading. Confirm homepage, pricing, blog, contact, legal pages, and articles retain unique metadata, canonical URLs, and localized alternates. Confirm the sitemap still derives published posts dynamically and robots still blocks private paths.

☐ Step 4: Run the full automated gate

    pnpm.cmd run format:check
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build
    pnpm.cmd run cf:build
    git diff --check

Expected: every command exits zero.

☐ Step 5: Security-scan and commit the completion pass

After worktree and staged scans:

    git commit -m "fix: complete localized black ink visual coverage"

## Task 11: Perform real-browser QA and repair defects

Files:

- Repair scope: src/styles/globals.css
- Repair scope: src/components/site-header.tsx
- Repair scope: src/components/site-footer.tsx
- Repair scope: src/components/auth-shell.tsx
- Repair scope: src/components/page-state.tsx
- Repair scope: src/components/app-layout.tsx
- Repair scope: src/components/app-sidebar.tsx
- Repair scope: src/components/data-table.tsx
- Repair scope: src/components/agent
- Repair scope: src/blocks
- Repair scope: src/routes/index.tsx
- Repair scope: src/routes/pricing.tsx
- Repair scope: src/routes/contact.tsx
- Repair scope: src/routes/blog
- Repair scope: src/routes/(pages)
- Repair scope: src/routes/(auth)
- Repair scope: src/routes/settings
- Repair scope: src/routes/admin
- Repair scope: messages/en.json
- Repair scope: messages/zh.json
- Local ignored artifacts: Playwright screenshots and traces

☐ Step 1: Read the Playwright CLI skill and start the app

Every Playwright command on this machine must set NO_UPDATE_NOTIFIER to 1. Start pnpm.cmd dev in a persistent terminal and wait for a successful local response.

☐ Step 2: Verify public and auth pages

Check root, Chinese root, pricing, blog, one article, contact, privacy, terms, sign-in, sign-up, forgot-password, verify-email, and an unknown path at 1440, 768, and 390 pixels.

For each page verify:

- no horizontal overflow
- correct ink and paper sections
- readable text and focus
- working mobile menu
- correct language links
- no console error
- required network requests succeed
- removed disclaimer is absent

☐ Step 3: Verify authenticated pages

Using a safe local account, verify chat, a session, library, editor, settings overview, billing, credits, payments, tickets, admin overview, users, pricing, discounts, posts, usage, tickets, and settings. Do not weaken any guard for QA.

Verify user and admin CRUD only with disposable local data. Do not trigger a real payment or a paid FastClaw generation during visual QA.

☐ Step 4: Repair and repeat

For every defect, capture the exact route, locale, viewport, console state, and expected behavior. Make the smallest fix, rerun the focused test, revisit the failing route, and check one neighboring route.

☐ Step 5: Run final tests and commit browser-found repairs

    pnpm.cmd run format:check
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build
    pnpm.cmd run cf:build

Run both security scans and commit only when fixes exist:

    git commit -m "fix: resolve black ink browser regressions"

## Task 12: Review, push, deploy, and verify production

Files:

- Review: every commit after 6567d5d
- Verify: .gitignore
- Verify: .dockerignore
- Verify: wrangler.jsonc
- Verify: scripts/cf-deploy.mjs

☐ Step 1: Run the launch-audit skill in all mode

Perform responsive, theme, SEO, performance, and security audits. Fix only regressions caused by this visual branch or genuine launch blockers.

☐ Step 2: Perform a distinct code-review pass

    git diff --stat 6567d5d..HEAD
    git diff 6567d5d..HEAD -- src messages package.json pnpm-lock.yaml
    git status --short --branch

Review for business-logic drift, leaked secrets, external reference assets, unverifiable claims, translation gaps, inaccessible interactions, missing responsive behavior, and accidental generated files.

☐ Step 3: Run the final release gate

    pnpm.cmd run format:check
    pnpm.cmd test
    pnpm.cmd exec tsc --noEmit
    pnpm.cmd run build
    pnpm.cmd run cf:build
    git diff --check origin/main...HEAD

Run the security-scan skill on the complete worktree and staged state. HIGH findings block release.

☐ Step 4: Push GitHub main

    git push origin main
    git status --short --branch

Expected: origin main advances to the verified local HEAD and the branch reports synchronized.

☐ Step 5: Deploy through the repository Cloudflare workflow

Read and invoke the deploy-cloudflare skill. Reuse the existing Worker, D1 database, routes, non-secret variables, and secret names. This visual-only release needs no schema migration and no new secret.

    pnpm.cmd run cf:deploy

Expected: Wrangler reports a successful production version for bestaitattoogenerator.com.

☐ Step 6: Run live smoke and browser checks

Verify HTTPS status and rendered behavior for root, Chinese root, pricing, blog, contact, privacy, terms, sign-in, sign-up, public pricing API, sitemap, robots, and a deliberate unknown path. Confirm desktop and mobile rendering, console state, localized navigation, dynamic prices, published posts, and removal of the disclaimer.

☐ Step 7: Deliver evidence

Report:

- final Git commit SHA
- synchronized GitHub branch
- Cloudflare Worker version
- automated test count
- typecheck, format, Vite build, and Cloudflare build outcomes
- desktop, tablet, and mobile browser routes checked
- live endpoint status
- any pre-existing warnings or credential-dependent checks that could not run
