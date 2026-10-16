# Tattoo discovery and task tools

Approved by the user's 2026-10-16 instruction to implement the six recommendations from the competitor analysis. No repeat approval is needed for reversible implementation, verification, push or deployment already authorized in this conversation.

## User outcome

Visitors can discover actual example artwork, explore useful style and placement collections, choose a specific tattoo task, and carry an example or their own image into the existing authenticated generation workflow. English and Chinese receive real content, navigation and metadata. Existing account, credit, subscription and privacy behavior stays intact.

## Scope and constraints

1. Replace repeated home gallery illustrations with curated existing tattoo assets whose captions match their contents. Label AI concepts accurately; never represent an illustration as a healed tattoo or a customer testimonial.
2. Seven task pages: `/tattoo-font-generator`, `/image-to-tattoo`, `/tattoo-idea-generator`, `/tattoo-to-stencil`, `/try-tattoo`, `/tattoo-cover-up`, `/tattoo-filler`. The first three and the last two use structured forms and the existing initial-turn contract. Classical lettering, photo overlay and outline extraction work locally without credits; paid AI actions keep existing authentication/credit checks. Masks/annotations guide AI edits and cannot promise physical cover-up feasibility or guaranteed pixel preservation.
3. Curated discovery: `/tattoo-ideas`, `/tattoo-styles`, `/tattoo-placements`, collection detail routes and selected public example detail pages. Only seeded, useful collections are indexable; unknown slugs return 404. No publication of private user images or public user submission system in this release.
4. Six initial styles: fine-line, blackwork, watercolor, floral, geometric, lettering. Initial placements and subjects follow the supplied CSV and available accurate assets. Each collection needs real examples, a distinct design brief, placement guidance, related links and a generation entry. Broader labels can contain examples adapted for that placement but must say they are design concepts, not body try-ons.
5. Original bilingual meaning/design guides linked to relevant existing generators and collections; reuse CMS/blog where practical. No invented author credentials, fixed spiritual meanings, clinical advice or claims that AI output is a finished tattoo stencil.
6. Navigation: top-level tools/discovery access, grouped footer links, breadcrumbs, descriptive contextual links and suggested next steps. Existing ten generators must have incoming links; all new public pages must be reachable from a hub.
7. Shared locale-aware page metadata, self-canonicals, reciprocal en/zh hreflang, sitemap entries, image alt/dimensions and valid 404 behavior. Preserve noindex/auth boundaries for chat, admin, uploads and private shares.
8. Preserve the user-owned source CSV, never commit or upload the raw commercial export. Record its SHA-256 and derive an auditable keyword/page map with source metrics identified as supplied snapshot data, not live measurements.
9. Check account usage between material stages. If any available Codex rate-limit window has remaining percent <= 5, stop feature work, save the current state and remaining work in the plan, report the pause, and wait for a user resume instruction. Do not redeem resets automatically.

## Architecture

Catalog definitions in `src/content/tattoos/` are pure typed data with en/zh values. Blocks read translations/locale and wire data; components accept content props. Shared pure helpers own filtering, page-path enumeration, safe generation handoff, task prompts and canvas transforms. No schema changes are needed. New routes reuse the existing Header/Footer and route loader/head conventions. Browser-only local processing never sends photos to a server. Explicit AI submit actions upload through the existing authenticated helper and use existing session storage transport.

## Verification and acceptance

- Baseline and final full Vitest suite; focused tests first for catalog relationships, filtering, safe prompt/handoff, pixel processing and transforms.
- Typecheck with baseline comparison; report pre-existing failures separately. Prettier checks on touched files; production build and Cloudflare build/deploy.
- Browser checks at 390, 768 and 1440 widths: navigation, Chinese/English metadata, filtering, input validation, image uploads, local font/stencil/try-on exports, AI handoff, error states and no unexpected paid requests.
- Fresh public GET checks for new routes, correct 404s, source HTML content, sitemap reciprocal alternates and all referenced local assets. Smoke-test production after publishing.
- Distinct spec and correctness/security review before integration. Security-scan before every commit. No force push, destructive migration or secret exposure.

## Deferred business expansion

Artist directory, physical products/fulfilment, affiliate accounting, anonymous paid generation, extra languages and large-scale public user submissions require separate product/operations work and are not part of this release.
