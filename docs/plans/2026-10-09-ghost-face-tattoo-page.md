# Ghost Face Tattoo Page Implementation Plan

> **For agentic workers:** Execute this plan task-by-task in the existing isolated worktree. No subagent is needed; the user requested end-to-end delivery in this task.

**Goal:** Publish bilingual Ghost Face tattoo design pages, linked in the footer and sitemap, then deploy them.

**Architecture:** A pure style-to-prompt helper feeds a dedicated public page block. A TanStack route supplies localized metadata, while the existing footer and sitemap create inbound discovery. The existing agent session-storage handoff and server-side FastClaw service remain unchanged.

**Tech Stack:** TanStack Start, React 19, Paraglide, Vitest, Cloudflare Workers.

## Task 1: Prompt contract

Files: `src/lib/ghost-face-prompt.test.ts`, `src/lib/ghost-face-prompt.ts`.

1. Write tests calling `buildGhostFaceTattooPrompt('black_grey', '  cracked porcelain texture  ')` and assert that the result mentions a ghostly mask tattoo design, the selected black-and-grey direction, the trimmed personal detail, a plain background, and artist adaptation.
2. Test all five distinct keys: `black_grey`, `fine_line`, `blackwork`, `sketch`, `black_crimson`. Confirm blank input omits the personal-detail sentence and the output requests no body mockup or watermark.
3. Run `pnpm.cmd exec vitest run src/lib/ghost-face-prompt.test.ts`; observe the missing-module failure.
4. Implement the typed helper with five distinct direction strings, a trimmed optional detail, and a shared safety/artist sentence. Rerun the focused test to green.

## Task 2: Page contract and assets

Files: `src/blocks/ghost-face-tattoo.test.tsx`, `src/blocks/ghost-face-tattoo.tsx`, `messages/en.json`, `messages/zh.json`, `public/imgs/ghost-face/*.webp`.

1. Write an SSR test that renders `GhostFaceTattoo`, checks one H1, both generator and gallery anchors, all five style controls, an example asset, honest preview copy, and absence of the credit-card claim. Run the focused test and observe the missing-module failure.
2. Extract each distinct WebP data URL from the supplied HTML into a descriptively named file. Validate RIFF/WEBP signatures and dimensions. Do not copy the HTML itself into `public`.
3. Build the responsive block following the approved design. Keep example choice and gallery filter in component state; the slider changes preview CSS size only. Download links target the selected local image. On form submit, store `{ prompt, settings, attachments: [] }` under `agent:initial-turn:<sessionId>` and route to the existing chat path; show localized storage error on failure.
4. Add matched, human-written English and Chinese translation keys for every visible heading, control, description, image alt, FAQ, and footer label. Rerun the focused SSR test and locale parity test to green.

## Task 3: SEO route and discovery

Files: `src/routes/ghost-face-tattoo-generator.tsx`, `src/blocks/footer.tsx`, `src/routes/sitemap[.]xml.ts`, `src/lib/sitemap-robots-contract.test.ts`.

1. Add `/ghost-face-tattoo-generator` to the sitemap test's public-route list and run the focused test to observe a missing-URL failure.
2. Add the route with locale-aware title, description, canonical, reciprocal `en`/`zh` and x-default links, Open Graph, and Twitter metadata. Compose the shared header, `GhostFaceTattoo` block, and footer.
3. Add the route to the static sitemap list and a localized footer link. Rerun the sitemap test to green.

## Task 4: Verification and release

1. Run focused tests, `pnpm.cmd test`, `pnpm.cmd exec tsc --noEmit`, Prettier check, and `pnpm.cmd build`. Fix any regression and rerun the affected check.
2. Inspect the source diff and run the repository security scan before committing. Run the all-axes launch audit before deployment.
3. Check English and Chinese pages in a real browser at desktop and mobile widths: content, style switch, slider, gallery filter, downloads, footer discovery, network, and console. Do not submit a design request.
4. Audit actual page output with the named SEO script, publish a non-force commit to GitHub, deploy using the configured Cloudflare script, then verify both live URLs, canonical, hreflang, images, footer link, robots, and sitemap. Repeat the SEO audit on production HTML and report only observed outcomes.
