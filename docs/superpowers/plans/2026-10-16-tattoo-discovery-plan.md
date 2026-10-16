# Tattoo discovery implementation plan

Goal: deliver the approved competitor-inspired discovery and tools release, mapped to the user's keyword CSV, with natural internal links and usable bilingual navigation.

Architecture: typed curated catalog, shared SEO helpers and locale-aware blocks on TanStack Start. Reuse the current authenticated agent and credit workflow. Local canvas tools remain private to the browser and require no new database tables.

Tech stack: TypeScript, React 19, TanStack Start, Paraglide, Tailwind 4, Canvas 2D, Vitest, Cloudflare Workers/D1.

Approved scope is in `docs/superpowers/specs/2026-10-16-tattoo-discovery-design.md`. Execute focused units with spec review followed by correctness review. The controller integrates and owns commits/deployment. Do not stage the source CSV or ignored runtime data.

## Stage 0: baseline and keyword evidence

Status: complete. Baseline: 68 files / 524 tests passed. The first typecheck lacked the ignored generated route tree; after restoring the generated baseline tree from the unchanged checkout, TypeScript passed with exit 0 and 0 diagnostics. Keyword analysis processed all 9,933 records without changing the source hash; the final release brief has 27 candidate paths and 137 records. Full classification remains in ignored data/seo. Phoenix is deferred until accurate examples are available.

- Worktree: `D:/codex project/tattoo/.worktrees/discovery-tools`, branch `codex/discovery-tools`, base `ca3cb048f62c7e67846169ec395f3a187e3d93a5`.
- Preserve `D:/codex project/tattoo/blackink关键词 - blackink.csv`; 9,933 records; SHA-256 `EBBF599A36F8743F35A644261391DA488D495AD022657FD2B437230FFEF72A9E`.
- Derive a curated page/keyword mapping under `docs/seo/`; source columns include keyword, volume, KD, current competitor position and URL. Existing generator themes retain their intended routes.
- Run `pnpm.cmd test` and `pnpm.cmd exec tsc --noEmit`; capture baseline diagnostics under ignored local outputs.

## Stage 1: catalog, collection routes and shared metadata

Status: complete. Independent spec and quality reviews passed after metadata guard and visible keyboard focus fixes. There are 28 accurate artwork examples, six styles, four placements, three subjects and 44 public discovery paths. Real browser checks passed for search, empty/reset states, filters, Chinese search, localized links, and 390/768/1440 layouts.

Files: create `src/content/tattoos/catalog.ts`, `src/lib/tattoo-discovery.ts`, `src/lib/public-page-head.ts`, `src/blocks/tattoo-discovery.tsx`, discovery route files, focused catalog tests. Route-adjacent helpers/tests need a leading hyphen.

Contract:

```ts
type TattooLocale = 'en' | 'zh';
type LocalizedText = Record<TattooLocale, string>;
type TattooExample = {
  id: string;
  image: string;
  title: LocalizedText;
  description: LocalizedText;
  prompt: string;
  styles: string[];
  placements: string[];
  topics: string[];
};
type TattooCollection = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  intro: LocalizedText;
  brief: LocalizedText;
  tips: LocalizedText[];
  exampleIds: string[];
  relatedPaths: string[];
  keyword: string;
};
```

Write failing behavior tests for unique paths/IDs, valid relationships, minimum examples, unknown-slug rejection, relevant search/filtering and locale path/head output. Implement deterministic exports to enumerate only valid public pages for sitemap and integration. Routes return real SSR content with one primary heading, breadcrumbs, useful examples, related paths and a generation action. The controller will wire navigation and the existing generator pages.

## Stage 2: structured task tools and authenticated handoff

Status: implemented; independent spec and final quality reviews passed. The hub and five task routes are functional. Spec review passed after full-capacity storage preflight replaced a one-character probe. Quality fixes batch paired references, prepare large files below 1.8 MiB, cancel stale guide callbacks and preserve graphemes in previews and PNG export. The final focused suite passed 33 tests after the font fallback change; the earlier batch/localization suite passed 15 tests. Actual paid cover-up/filler validation is waiting for the user's test-account login in the dedicated visible Edge releaseqa window.

Files: create `src/lib/tattoo-task.ts`, task prompt tests, `src/blocks/tattoo-tools.tsx`, pure reusable form/preview components under `src/components/tattoo/`, hub and five agent task routes. Keep translation additions in dedicated dictionaries until controller merges both message JSON files to avoid conflicting writes.

Implement dedicated forms for font, image-to-tattoo, ideas, cover-up and filler. Reuse `newAgentSessionId`, composer settings, upload helper and `agent:initial-turn:<id>` JSON shape. Preserve user input on auth redirects. Do not auto-charge on load. Source-dependent tasks validate an actual image. Cover-up/rework modes are explicit. Filler accepts a drawn shape or uploaded marked guide and theme. Show limits honestly. A classic font preview can export a PNG locally; fonts must use available/licensed assets or system fonts accurately labelled.

Test prompt validation, text preservation, source/annotation ordering, escaped user text, storage failure and successful transport before integration. No raw fetch calls in components; use the existing library helper/API client if needed.

## Stage 3: photo try-on and stencil tool

Status: complete. Independent spec and quality reviews passed. Nine focused tests cover pixels, transparency, boundaries, transforms and cancellation. Real browser checks passed for local files, keyboard placement, native touch movement, comparison, reset, invalid file rejection and two PNG downloads; no upload or AI requests were sent. Beige-paper fading was improved after visual inspection. The empty state requires a body photo and offers curated design selection, avoiding a fabricated body result.

Files: `src/lib/tattoo-canvas.ts`, pixel/transform tests, prop-driven components under `src/components/tattoo/`, blocks and `/try-tattoo`, `/tattoo-to-stencil` routes.

Try-on: local body/design uploads with validated decoded images; demonstrate using existing accurate assets if no uploads. Move by pointer/keyboard and explicit X/Y controls, scale, rotate, opacity, reset, compare and PNG export. White-background removal is optional and adjustable. Clamp transformations to usable bounds. Support mobile touch without blocking the page unnecessarily. Revoke obsolete object URLs, cancel stale async image loads and cap decoded dimensions/canvas memory. Local files never upload merely to preview.

Stencil: local image upload, threshold/edge mode, contrast/threshold or line sensitivity, invert, original/result comparison and PNG download. Label output as a draft for artist review; do not claim measured size/DPI or production-ready transfer. An optional explicit AI refinement may use the existing agent path. Use pure pixel helpers and focused tests for alpha/luma/edge bounds/inversion, size limiting and transforms.

## Stage 4: navigation, home gallery, contextual links and articles

Status: complete and published. Independent integration/security/editorial review passed. Header/footer/home cards and ten generator next-step sections are connected; all public pages have inbound links. Three original articles with six translations are published as real D1 CMS records and exactly match UTF-8 title/body hashes after the final deployment. The previous aftercare post is preserved.

Files: change header/footer/start-ways/gallery/try-on blocks, add shared related links block to ten existing generator route compositions, add selected original bilingual articles and article-related discovery links. Sitemap imports the catalog's public-path enumeration; update sitemap test dependency injection for new imports.

Every new page gets an inbound link from its hub and contextual next steps. Preserve all existing ten generator inbound links. Header remains usable at tablet/mobile widths; no hover-only navigation. Search/filter controls use buttons or forms; navigational destinations render anchors. Replace inaccurate legacy example thumbnails with matching assets. Do not invent before/after transformations, customers or skin results.

## Stage 5: review and verification

Status: public and free-tool release verification complete; paid output validation awaits login. The complete suite passed 79 files / 593 tests, followed by 33 focused tests for the final font change and 32 focused tests for the image-loading change. Final TypeScript, Node production build, Cloudflare build, formatting and diff checks passed. Local and final production crawls passed for 144 English/Chinese pages, 77 assets and internal links; all four invalid discovery families returned 404. Ten production HTML audits had zero findings. Production browser checks covered 40 responsive states, search/filtering, free exports, local canvas operations, input validation and login-popup draft preservation with zero JavaScript page errors or upload/AI POST requests in valid-page interaction runs. Real large-image preparation preserved transparency and the original hash. Final mobile Lighthouse scores were gallery 85 and try-on 80; exact measurements and remaining performance limits are recorded in the release verification report. Original CSV hash is unchanged.

Commands: `pnpm.cmd test`, `pnpm.cmd exec tsc --noEmit`, `pnpm.cmd exec prettier --check <touched files>`, `pnpm.cmd build`. Run local server on a free port and browser checks with `NO_UPDATE_NOTIFIER=1` before every playwright-cli invocation. Read console/network outputs and screenshots at 390/768/1440. Exercise both locales, actual local canvas operations, exports, invalid files, filter reset and source-dependent handoffs.

Run the check-page-seo HTML auditor against representative routes and all page families, then a crawler across enumerated paths/assets/internal links. Record exactly which AI image generation calls were exercised and which quality claims remain unverified. Review user input boundaries, uploads, canvas resource limits, locale-aware links and private/public indexing.

## Stage 6: ship and handoff

Status: deployed and pushed. Feature commit c97c31f and image-loading optimization 0b08abb are on GitHub main. Final application source is 0b08abb3634a4a2259e7afed0a356b17601e9cba; final Worker version is d8d62c93-6378-494d-997e-cc8f0c399ca1. Production crawl passed for 144 pages, 77 assets, 153 internal destinations and four invalid-route 404s; ten deep HTML audits had zero findings; 40 responsive UI states passed. Final mobile Lighthouse scores are 85 for the gallery and 80 for try-on, with accessibility/recommended practices/SEO all 100. See docs/seo/tattoo-discovery-release-verification.md for exact measurements and limits. Paid cover-up/filler output validation remains pending the user's login notification; the visible releaseqa Edge window is kept open.

Run `.claude/skills/security-scan/scripts/scan_staged.py --worktree`, inspect full diff and review findings, stage only intended files, run staged scan, then commit. Integrate without resetting/stashing user changes or force pushing. Use the existing `pnpm.cmd run cf:deploy` pipeline under the authorization already given, then GET and browser-check production, sitemap and representative English/Chinese routes. Record commit, Worker version and verified URLs.

## Resume checkpoint

Last checked account usage: 71% used / 29% remaining in the available weekly window. Pause threshold: 95% used / 5% remaining in any available window. Refresh during implementation, before costly validation, and before deployment. If reached, update stages and exact unverified work here; stop and wait for the user's resume instruction. No resets have been redeemed.
