# Womb Tattoo Generator implementation plan

Goal: publish a bilingual womb tattoo design page based on the user's HTML reference and connect its creation action to the existing agent chat.

Architecture: one file route owns localized metadata; one marketing block renders the page and interaction; a small pure prompt builder formats the selected style and visitor idea. Local JPEG files supply the reference artwork. The shared footer and sitemap expose the route.

Tech stack: TanStack Start, React 19, Paraglide messages, Tailwind CSS 4, Vitest, Cloudflare Workers.

## Tasks

1. Extract the seven unique reference JPEGs into `public/imgs/womb/`. Verify image types, dimensions, and byte sizes.
2. Add a focused failing test for `buildWombTattooPrompt` in `src/lib/womb-prompt.test.ts`; implement the function in `src/lib/womb-prompt.ts` and rerun the test.
3. Add matching English and Chinese page copy to `messages/en.json` and `messages/zh.json`. Build `src/blocks/womb-tattoo.tsx` with the reference's section rhythm, gallery filtering, style selection, accessible labels, and chat handoff.
4. Add `src/routes/womb-tattoo-generator.tsx` with locale-aware title, description, canonical, hreflang, social metadata, and shared site shell.
5. Add the footer link in `src/blocks/footer.tsx` and the static route in `src/routes/sitemap[.]xml.ts`.
6. Run focused and full tests, TypeScript, build, formatting check on changed files, SEO HTML audit, and desktop/mobile browser QA. Review the diff and run the project security scan before commit.
7. Commit, push `main`, deploy with `pnpm.cmd run cf:deploy`, and repeat SEO, route, image, sitemap, and browser checks on the production domain.
