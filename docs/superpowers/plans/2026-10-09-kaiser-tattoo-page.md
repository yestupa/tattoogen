# Kaiser Tattoo Generator Implementation Plan

> For agentic workers: use the repository's test-first, security, SEO, and Cloudflare release checks. The uploaded HTML and earlier delegation settle the design direction.

**Goal:** Publish a bilingual Kaiser tattoo design page based on the uploaded visual reference and connect its selected style to the existing AI agent chat.

**Architecture:** A pure prompt builder converts style and optional visitor idea into an original fan-inspired tattoo concept request. One marketing block renders the visual page and interactions, while a file route owns localized metadata. The shared footer and sitemap expose the route without modifying the business services.

**Tech Stack:** TanStack Start, React 19, Paraglide, Tailwind CSS 4, Vitest, Cloudflare Workers.

## Task 1: Prompt behavior, test first

**Files:** Create `src/lib/kaiser-prompt.test.ts` and `src/lib/kaiser-prompt.ts`.

1. Add a failing test calling `buildKaiserTattooPrompt('fine_line', '  small crown  ')`; require a blue rose, fine-line direction, trimmed personal idea, and no untrimmed whitespace. Add cases for a blank idea, thorn blackwork, crown/keyhole, watercolor, and fan-inspired rather than official treatment.
2. Run `pnpm.cmd exec vitest run src/lib/kaiser-prompt.test.ts` and confirm failure because the builder is missing.
3. Implement the exact style union `blue_rose | fine_line | thornwork | crown | watercolor` and a pure builder. Request an original standalone tattoo-flash concept on a light background, selected motif direction, optional trimmed idea, no logos/character portrait/watermark, and artist review of size, color and placement.
4. Rerun the focused test and confirm it passes.

## Task 2: Supplied images and localized page

**Files:** Create seven JPEGs under `public/imgs/kaiser/`; create `src/blocks/kaiser-tattoo.tsx`; modify `messages/en.json` and `messages/zh.json`.

1. Mechanically decode the seven unique JPEGs in the uploaded HTML. Assign them to blue-rose, fine-line, thornwork, crown, watercolor, forearm-placement, and artist-desk files. Confirm all image dimensions and visual correspondence.
2. Add parallel `kaiser.*` messages in both languages for all page sections, five styles, functional controls, and errors. Keep English naturally English and Chinese naturally Chinese.
3. Build the sections in the design spec using the existing ink/paper shell and a page-local cobalt accent. Use native buttons for style selection, gallery filtering, and form submission; use a native range control for preview scale. Add real local example downloads.
4. On form submit, create a session ID, save `{ prompt: buildKaiserTattooPrompt(selectedStyle, idea), settings: composerSettings, attachments: [] }` under `agent:initial-turn:${sessionId}`, then navigate to `/chat/${sessionId}`. Catch storage errors with a localized toast. Do not call FastClaw directly in the browser.

## Task 3: Route discovery and SEO, test first

**Files:** Create `src/routes/kaiser-tattoo-generator.tsx`; modify `src/blocks/footer.tsx`, `src/routes/sitemap[.]xml.ts`, and `src/lib/sitemap-robots-contract.test.ts`.

1. Add `/kaiser-tattoo-generator` to the sitemap contract test and confirm its focused test fails before changing the sitemap.
2. Add the static sitemap path and rerun the test until both locale URLs pass.
3. Add the route with a locale-aware loader for title/description. Emit title, description, Open Graph/Twitter metadata, absolute same-language canonical and reciprocal English/Chinese/x-default alternates. Reuse the shared public header and footer.
4. Add a localized footer product link after the existing Fear God link. Do not add a header item.

## Task 4: Verify, review, publish

**Files:** Review only the changed files; no schema or secret changes.

1. Run `pnpm.cmd exec tsc --noEmit`, `pnpm.cmd test`, `pnpm.cmd build`, and Prettier on changed files. Fix only change-related failures.
2. Serve locally and audit both language URLs with the named SEO script. Compare raw HTML and browser DOM for title, description, H1, canonical, hreflang, real translated copy, image alts, absent credit-card text, and the existing footer's inbound link.
3. Check desktop and mobile browser layouts, change styles, filter the gallery, inspect image requests and console. Inspect the handoff code without clicking the paid generation action.
4. Run project security scan before committing, launch-audit before deployment, inspect `git diff`, and do a separate code-review pass. Merge and push without force.
5. Deploy with the existing Cloudflare script. Recheck HTTP 200, localized head, robots, footer, sitemap, all images, browser console and network on the production domain. Do not claim Google indexing or rankings were verified.
