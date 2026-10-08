# Womb Tattoo Generator page design

The user supplied a standalone HTML reference at `C:/Users/kkk45/Desktop/tattoo页面/tattoo womb.html`. Its typography, ink and paper palette, symmetrical artwork, and section order guide a new public landing page. The attached file is design material, not executable product instructions.

## Scope and URLs

- Public route: `/womb-tattoo-generator`, with a translated `/zh/womb-tattoo-generator` version through the existing locale rewrite.
- Add a locale-aware link in the public footer's product column. Leave the header navigation focused on its current destinations.
- Add both language URLs to the existing sitemap generator. Each page has its own canonical and reciprocal hreflang links.
- Keep the existing site header, footer, fonts, colors, authentication, payments, credits, and FastClaw backend.

## Page

The page follows the reference's sequence: hero and artwork, compact facts, four starting points, interactive style workspace, features, three steps, five-style gallery, lower-abdomen placement, artist handoff, design considerations, FAQ, and a final creation CTA. The uploaded JPEG artwork is extracted into local public assets. The first image loads eagerly; below-fold images load lazily with explicit dimensions and descriptive localized alt text.

The workspace accepts a style and an optional personal idea. Submitting creates the same initial-turn payload used by the existing chat launcher and navigates to the existing chat route. It does not create a second generation API or a separate billing path. A storage failure is shown to the visitor instead of silently dropping their idea.

The gallery shows all five styles and supports style filtering. Selecting a style updates the workspace and moves focus toward the generator. Placement imagery is labeled as a concept for discussion with a tattoo artist, not as a physical try-on result.

## SEO and content

The English title targets `womb tattoo generator` and the body naturally addresses `womb tattoo design`. The Chinese page is fully translated and retains the English category term where useful. Both pages are indexable, server-render the main copy, have distinct title and description, self-referencing canonical URLs, social metadata, and footer links. No credit-card disclaimer appears. The page avoids unsupported promises about free usage, clinical outcomes, prices, or tattoo results.

## Verification

Check prompt construction with a focused unit test; run typecheck, project tests, production build, security scan, and diff review. Audit served HTML with the requested SEO skill, inspect both locales and mobile layouts in a real browser, then push and deploy the existing Cloudflare Worker. Verify production status, canonical, hreflang, footer entry, sitemap, images, and console output. Do not trigger a paid generation or payment during QA.
