# Throat Tattoo for Men Page Implementation Plan

> **For agentic workers:** Execute this plan task-by-task in the existing isolated worktree. The user requested end-to-end delivery in this task, so use inline execution without another handoff pause.

**Goal:** Publish bilingual throat tattoo for men design pages, linked in the footer and sitemap, then deploy them.

**Architecture:** A typed style-to-prompt helper feeds a dedicated public block. A TanStack route supplies localized metadata, while the existing footer and sitemap create inbound discovery. The existing session-storage handoff and server-side FastClaw service remain unchanged.

**Tech Stack:** TanStack Start, React 19, Paraglide, Vitest, Cloudflare Workers.

## Task 1: Prompt contract

Files: `src/lib/throat-tattoo-prompt.test.ts`, `src/lib/throat-tattoo-prompt.ts`.

1. Write a test calling `buildThroatTattooPrompt('ornamental', '  small star below the center  ')` and assert a front-neck tattoo design, ornamental dotwork, trimmed detail, plain background, and artist adaptation. Run `pnpm.cmd exec vitest run src/lib/throat-tattoo-prompt.test.ts` and confirm it fails because the helper is absent.
2. Test five distinct keys: `ornamental`, `blackwork_wings`, `rose`, `snake`, `geometric`. Confirm blank input omits the personal-detail sentence; the prompt must request no body mockup, text, or watermark.
3. Implement the five direction strings and shared constraints with a typed style union. Rerun the focused test to green.

## Task 2: Page contract and assets

Files: `src/blocks/throat-tattoo.test.tsx`, `src/blocks/throat-tattoo.tsx`, `messages/en.json`, `messages/zh.json`, `public/imgs/throat/*.webp`.

1. Write an SSR test rendering `ThroatTattoo`. Assert one H1, generator and gallery anchors, five style controls, ornamental asset, honest preview copy, and absence of the credit-card claim. Run it and confirm the missing-block failure.
2. Extract only the seven distinct WebP data URLs from the supplied HTML into descriptively named files. Verify RIFF/WEBP signatures and dimensions. Keep the original HTML out of `public`.
3. Compose the page in the reference's order using site sections and the existing agent handoff. State clearly that the scale control affects the preview only. Use accessible buttons for style and gallery selection, a download link for the selected local file, and localized storage error feedback. The submit stores `{ prompt, settings, attachments: [] }` under the agent's initial-turn key and opens its chat route.
4. Add paired, human-written English and Chinese message keys for headings, instructions, controls, FAQ, image alt text, and footer. Recompile Paraglide, then rerun focused tests.

## Task 3: SEO route and discovery

Files: `src/routes/throat-tattoo-for-men-generator.tsx`, `src/blocks/footer.tsx`, `src/routes/sitemap[.]xml.ts`, `src/lib/sitemap-robots-contract.test.ts`.

1. Add the new path to the sitemap contract's expected public URLs. Run the focused test and confirm the missing URL failure.
2. Add the route with localized title, description, absolute self-canonical, reciprocal `en` and `zh` alternates and x-default, Open Graph, Twitter, and the shared header/page/footer composition.
3. Add the route to the static sitemap and add its localized footer entry. Rerun the sitemap contract to green.

## Task 4: Verification and release

1. Run the focused tests, `pnpm.cmd test`, `pnpm.cmd exec tsc --noEmit`, Prettier check, and `pnpm.cmd build`. Fix regressions and rerun affected checks.
2. Inspect `git diff`; run the repository security scan before committing and the full launch audit before deployment.
3. Check both locales in a real browser at desktop and mobile widths: titles, content, style switch, gallery filter, scale slider, download, footer inbound link, console and network. Do not submit a paid design request.
4. Audit the actual HTML using `check-page-seo`, publish with a non-force GitHub update, deploy the Cloudflare Worker, then check both live URLs, canonical, hreflang, assets, footer, robots, and sitemap. Repeat the SEO audit against production and report only observed outcomes.
