# Fear God Tattoo Generator Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans in this session. The user approved the uploaded visual direction and authorized deployment. Follow the project security and deployment gates.

**Goal:** Publish a bilingual Fear God tattoo design page based on the supplied HTML and connect its style selections to the current agent chat.

**Architecture:** A pure prompt builder formats the selected style and visitor idea. A marketing block renders the supplied art and interactive sections, while a file route owns localized SEO metadata. The shared footer and sitemap expose the route without changes to user or payment services.

**Tech Stack:** TanStack Start, React 19, Paraglide, Tailwind CSS 4, Vitest, Cloudflare Workers.

## Task 1: Prompt contract

**Files:** Create `src/lib/fear-god-prompt.test.ts` and `src/lib/fear-god-prompt.ts`.

1. Write a failing Vitest test that calls `buildFearGodTattooPrompt('script', '  small olive leaves  ')`, expects `FEAR GOD`, `flowing script`, `Personal idea: small olive leaves`, and absence of the untrimmed input. Add a blank-idea case for `gothic` and a symbol case for `hands`.
2. Run `pnpm.cmd exec vitest run src/lib/fear-god-prompt.test.ts` and confirm that the missing module/function fails.
3. Implement `FearGodStyle` as the exact union `'gothic' | 'script' | 'minimal' | 'cross' | 'hands'`, a style-description record, and `buildFearGodTattooPrompt(style, idea)`. The prompt must request exact `FEAR GOD` lettering, a tattoo-flash image on a light background, the selected direction, the trimmed optional idea, and a warning to verify AI lettering with an artist.
4. Rerun the focused test until it passes.

## Task 2: Reference assets and localized page

**Files:** Create seven JPEGs under `public/imgs/fear-god/`; create `src/blocks/fear-god-tattoo.tsx`; modify `messages/en.json` and `messages/zh.json`.

1. Extract the seven distinct base64 JPEGs from the supplied HTML without modifying that file. Confirm all decode and record dimensions.
2. Add matching `fear.*` keys to both locale files for hero, starting points, style names and descriptions, workbench, features, steps, gallery, placement, artist handoff, design notes, FAQ, and final CTA. English must read naturally in English; Chinese must read naturally in Chinese.
3. Render the sequence from the approved design using existing `section-ink`, `section-paper`, `section-shell`, `font-display`, `Header`, and `Footer` patterns. Give images dimensions and meaningful localized alt text; load the first visible art eagerly and below-fold art lazily.
4. Use `useState` for style and gallery filter. A style button updates the selected preview. The form submits the same initial-turn object used on the Womb page: `{ prompt: buildFearGodTattooPrompt(selectedStyle, idea), settings: composerSettings, attachments: [] }`, stored under `agent:initial-turn:${sessionId}` before `router.push(`/chat/${sessionId}`)`. Catch storage failure and show a localized toast.
5. Make image-preview and gallery controls keyboard usable with native buttons. Keep the example-download link local to the selected asset if present; do not imply that it saves a generated result.

## Task 3: Public route and discovery

**Files:** Create `src/routes/fear-god-tattoo-generator.tsx`; modify `src/blocks/footer.tsx`, `src/routes/sitemap[.]xml.ts`, and `src/lib/sitemap-robots-contract.test.ts`.

1. Extend the sitemap test's public-route list with `/fear-god-tattoo-generator`, then run `pnpm.cmd exec vitest run src/lib/sitemap-robots-contract.test.ts` and observe its failure.
2. Add the static sitemap path. Rerun the test and confirm both locale URLs appear.
3. Add the route with a `loader` that gets `fear.meta.title` and `fear.meta.description` for the active locale. Its `head` must output localized title, description, Open Graph and Twitter title/description, absolute same-locale canonical, alternate `en` and `zh`, and `x-default` to the base locale. Reuse the shared public header/footer shell.
4. Add the localized footer link after the Womb link. Do not add a header navigation item.

## Task 4: Verification and release

**Files:** Review only the changed files; no schema or secret changes.

1. Run `pnpm.cmd exec tsc --noEmit`, `pnpm.cmd test`, `pnpm.cmd build`, and Prettier check on changed source/docs. Fix failures caused by this change.
2. Serve the app locally; run the requested SEO audit script on both language URLs with the confirmed production canonical URLs. Check raw HTML and rendered DOM for unique title, description, H1, canonical, hreflang, image alt text, no unwanted credit-card string, and footer inbound link.
3. Test desktop and mobile layouts in a real browser. Change styles and gallery filter, inspect preview image requests and console. Inspect the chat route's initial-turn effect and the page's handoff code; do not click the create button because the chat route automatically sends the stashed turn and could spend credits.
4. Run project `security-scan` before commit and `launch-audit all` before deploy. Inspect `git diff` and perform a distinct code-review pass. Commit and push without force.
5. Deploy with the existing Cloudflare script, then repeat status/head, SEO script, footer, sitemap, image, browser, console, and network checks on the production domain. Report Google indexing as unverified without Search Console evidence.
