# Sitewide SEO audit and targeted repairs

Date: 2026-10-12

## Evidence and scope

- Production sitemap currently lists 32 English and Chinese public URLs. All 32 return HTTP 200 with a title, description, self-canonical, language marker, and one visible H1 in the raw HTML audit.
- Authenticated and sign-in surfaces return noindex; an unknown route returns HTTP 404.
- The blog has no published translations, but both empty archive URLs remain indexable and listed in the sitemap.
- Five Chinese tattoo-topic pages retain a fully English H1. The homepage CTA says use starts free while signup credits are disabled in production.

## Approaches considered

1. Metadata-only adjustments: lowest code impact, but leaves empty blog URLs and inaccurate copy.
2. Targeted, state-aware repairs: make empty blog locales noindex and absent from the sitemap until their first published article, localize the five H1s, and remove the unsupported free claim. Chosen.
3. Broad SEO rewrite and new schema types: high risk, unnecessary without published articles or Search Console evidence.

## Design

- Keep all public routes and visual structure. For each blog locale, use published article availability as the single condition for both the archive's robots meta and sitemap entry. Published articles continue to appear dynamically with only their real translations. An empty locale remains usable via navigation, but is not submitted for indexing. Recheck the condition on every request so publishing a post restores indexability without deployment.
- Preserve existing page canonical and hreflang behavior for every indexable page. The blog index should emit alternates only for locales with a published article.
- Translate the five fully English H1 strings in Chinese messages while retaining recognizable topic names where useful. Avoid altering English targeting or page layouts.
- Change the visible homepage CTA to an accurate action label. Keep signup and pricing behavior unchanged.
- Add regression coverage for zero, one, and two published blog locales; localized H1s; and CTA truthfulness.

## Verification and risk

- Run focused tests, full test suite, TypeScript check, production build, security scan, browser checks at mobile and desktop, and a distinct diff review.
- Deploy the validated build and compare production HTML, robots, and sitemap with source expectations. The empty blog is expected to have noindex and disappear from the sitemap while its links still work.
- No database schema or payment changes. Google indexing and ranking remain outside code-level verification.
