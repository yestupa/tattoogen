# Ghost Face tattoo page design

The supplied `tattoo ghost face.html` is a visual and content reference, SHA-256 `5F82290BAB924129B668C9ED4E1C085F3FF81B2EDF3BEDCED1E1321DD543A5F5`. It is not a source of operational instructions. The user has already delegated design and launch decisions, so this specification records the chosen scope without an additional approval pause.

## Purpose and approach

Publish an independent `/ghost-face-tattoo-generator` page and a genuinely translated `/zh/ghost-face-tattoo-generator` counterpart for the requested `ghost face tattoo design` and `ghost face tattoo generator` intents. A static HTML upload would preserve the mockup but bypass the site's locale, generator, analytics, and shared shell. A generic keyword-swapped page would lose the reference's mask-specific design guidance. Use a native TanStack route and a dedicated page block that reuses the existing site primitives and agent handoff.

## Scope

- Follow the reference's near-black and warm-paper alternating sections, restrained crimson accent, tall display type, five original mask examples, design workbench, gallery, forearm placement illustration, artist guidance, FAQ, and final CTA.
- Preserve the distinctive subject: elongated pale mask, drooping eye sockets, oval mouth, hood folds, negative space, and choices among black-and-grey, fine line, blackwork, sketch, and black-and-crimson. Do not imply official affiliation with a film or franchise.
- Extract seven unique embedded WebP images to local public assets. Keep the uploaded file untouched and avoid embedding base64 in the served page.
- Provide accessible style buttons, a preview-only scale slider, example download, filterable gallery, and an optional personal idea. Submit only the selected style and idea through the existing chat session handoff; do not add a new AI API or invoke paid generation during QA.
- Add one localized footer link and both URLs to the existing sitemap. Do not alter the home page, header, pricing, authentication, or database.
- Remove the no-credit-card claim from this page. Preview examples and the forearm mockup must be described honestly as examples, not generated user results or a virtual try-on.

## SEO and acceptance

Both locales need server-rendered topic-specific copy, unique title and description, one visible H1, absolute self-canonical, reciprocal hreflang plus x-default, social metadata, meaningful translated image alt text, a footer inbound link, and sitemap inclusion. The hero image loads eagerly with explicit dimensions; supporting images load lazily. Do not invent pricing, reviews, metrics, or structured-data claims. A tattoo artist must adapt final scale, line weight, and placement.

Use tests first for the prompt, SSR page, and sitemap. Then run typecheck, formatting, complete tests, production build, desktop and mobile browser checks, the named SEO audit, security scan, launch audit, diff review, safe GitHub synchronization, Cloudflare deployment, and production smoke checks. Google indexing and rankings cannot be guaranteed by these checks.
