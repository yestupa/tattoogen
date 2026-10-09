# Butterfly tattoo landing page

## Scope

Create `/butterfly-tattoo-generator` and its Chinese locale from the supplied local HTML reference. Preserve its dark/paper rhythm, five butterfly concepts, interactive preview, gallery, placement example, artist guidance, FAQ, and final call to action. Integrate the selected style and optional personal detail with the existing FastClaw-backed chat handoff. A preview image is an example, not a generated output or virtual try-on.

## Files and behavior

- `src/lib/butterfly-prompt.ts`: one style-specific, tattoo-flash prompt builder, keeping credentials and actual generation on the existing server-side path.
- `src/blocks/butterfly-tattoo.tsx`: responsive bilingual page using existing site header/footer, accessible style controls, gallery filters, image download, and generator handoff.
- `src/routes/butterfly-tattoo-generator.tsx`: localized SEO head with canonical, hreflang, Open Graph, and Twitter metadata.
- `messages/en.json` and `messages/zh.json`: human-written copies for all visible page sections.
- `public/imgs/butterfly/`: seven distinct WebP assets extracted from the supplied HTML without modifying the original.
- `src/blocks/footer.tsx` and `src/routes/sitemap[.]xml.ts`: discoverable footer link and both localized sitemap URLs.

## Verification

Write red tests for the prompt, rendered page, and sitemap before implementation. Then run focused and complete tests, TypeScript, formatting, production build, real-browser desktop/mobile checks, and the named SEO audit. Run the security scan and launch audit before committing and deploying. Publish to GitHub and Cloudflare, then verify both live locale URLs, assets, footer link, robots, and sitemap. Do not submit a paid generation request during smoke testing.
