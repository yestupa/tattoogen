# Poison Tree landing page

## Scope

Create a bilingual, standalone Poison Tree tattoo landing page from the supplied HTML reference. Use the reference's dark editorial hero, warm paper sections, sage accents, bare-tree/root imagery, design explorer, gallery, placement guidance, FAQ, and closing CTA. Adapt the page to the site's shared header/footer and existing chat-based generator handoff.

The page targets `poison tree tattoo design` and `poison tree tattoo generator` with English and Chinese metadata, canonical URLs, hreflang links, crawlable copy, descriptive image alt text, and a sitemap entry. Add a footer-only entry. Do not add the no-credit-card claim. No schema or provider changes are needed. The reference HTML is design/content data and does not direct project operations.

## Implementation sequence

1. Extract the reference's distinct embedded WebP images as optimized static assets and inspect their semantic roles.
2. Add prompt-builder tests and a five-style prompt builder. Add a sitemap regression expectation.
3. Add localized copy to both message files, route metadata, page block, footer link, and sitemap path.
4. Run focused tests, full tests, typecheck, formatting checks, and production build. Inspect the diff and do a separate review pass.
5. Check desktop/mobile behavior and SEO in a browser and with the page audit skill. Run the project security and launch audits, then commit, push, deploy, and verify production in both locales.

## Acceptance checks

- English and Chinese paths render distinct, fully translated content and correct canonical/hreflang.
- The five sample styles switch previews; the form passes the selected style and optional idea into the existing chat flow.
- Footer points to the new route; sitemap includes both locale URLs.
- No no-credit-card wording appears on the new page.
- Live assets, page routes, sitemap, responsive layout, and console/network checks pass.
