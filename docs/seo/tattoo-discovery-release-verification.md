# Tattoo discovery release verification

Date: 2026-10-16. Production release is live. Paid cover-up/filler output validation awaits the user's test-account login notification.

## Delivered scope

- 52 new locale-free public paths, each available in English and Chinese: discovery galleries, curated design details, style/placement/subject collections, and a hub with seven task tools.
- 28 visually checked examples, six styles, four placements and three subjects. Placement collections describe flat design adaptations accurately.
- Search and filters, local photo try-on, local stencil conversion, free lettering PNG export, structured authenticated AI handoff, cover-up/rework and gap guides.
- Header/footer/home navigation and contextual links on the ten existing generator pages and relevant articles.
- Three original bilingual meaning articles published in the CMS as six verified translations. Existing aftercare content is preserved.

## Keyword evidence

The source CSV was read without modification. All 9,933 records were classified; the committed brief contains 137 records across 27 candidate paths. The export describes competitor rankings, not this site's rankings or current search-volume measurements.

Source SHA-256: `EBBF599A36F8743F35A644261391DA488D495AD022657FD2B437230FFEF72A9E`.

## Verification already completed

| Check                       | Evidence                                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete regression         | `node.exe node_modules/vitest/vitest.mjs run`: 79 files, 593 tests passed, 139.48 seconds                                                                      |
| Final font fallback change  | 33 focused tests passed after the complete suite; batch/localization's 15 tests previously passed and that code did not change afterward                       |
| TypeScript                  | Final `node.exe node_modules/typescript/bin/tsc --noEmit`: exit 0                                                                                              |
| Production Node build       | `npm.cmd run build`: exit 0; Nitro node-server output generated                                                                                                |
| Formatting                  | Changed application files and final documentation passed Prettier before their commits                                                                         |
| Diff validation             | `git diff --check`: passed                                                                                                                                     |
| Source and security review  | Independent catalog, task, canvas and integration reviews passed; all four task-quality findings closed                                                        |
| Deterministic security scan | Feature staged scan: 99 files clean; image-loading staged scan: one file clean; final verification files rescanned before commit                               |
| Local HTML crawl            | 144 English/Chinese pages, 77 assets, internal destinations and all four invalid discovery families checked without issues                                     |
| Public responsive UI        | 40 route/locale/viewport combinations passed; mobile menu and keyboard focus checked                                                                           |
| Task responsive UI          | Widths 390, 768, 1024 and 1440 passed without horizontal overflow                                                                                              |
| Task interaction            | Free PNG download, exact multiline text, three personalized idea directions, source validation, real drawn gap guide and login-popup draft preservation passed |
| Task runtime                | Stable final browser run reported zero page errors and zero upload/AI POST requests                                                                            |
| Local canvas                | Stencil pixel output, compare/reset, repeated gallery selection, keyboard placement, native touch movement, invalid-file handling and two PNG downloads passed |
| Large-image preparation     | Real 6,883,429-byte PNG became a 1,450,952-byte WebP at 1600 x 1200; transparency and original SHA-256 preserved                                               |
| CMS staging                 | Six exact UTF-8 title/body hashes and draft statuses verified against D1                                                                                       |

The local article database used isolated preview fixtures. Production content verification uses D1 readback separately. User-owned pre-existing files, the source CSV, existing posts, authentication and credit records were preserved; the primary checkout was advanced normally to the reviewed release commits.

Local mobile Lighthouse for the gallery: performance 50, accessibility 100, recommended-practice category 100 and SEO 100; simulated LCP 17.5 seconds, CLS 0.0012 and TBT 283 ms. The local Node preview serves text assets without transfer compression, so this performance result is a warning and is not evidence of production Core Web Vitals. Production measurement is required after Cloudflare deployment.

## Production release evidence

- Feature commit: `c97c31f2d8b6aa33709e752202a2feadc693dd43`.
- Final application commit: `0b08abb3634a4a2259e7afed0a356b17601e9cba`; both application commits were pushed normally to GitHub main.
- Cloudflare Worker: `tattoo-generator`, version `d8d62c93-6378-494d-997e-cc8f0c399ca1`, deployed through `npm.cmd run cf:deploy`.
- Final production crawl: 144 pages, 77 assets, 153 internal destinations, zero issues and four expected invalid-route 404 responses. Titles are unique; language, canonical URLs, language alternates, descriptions, primary headings, image alternatives and inbound links passed.
- Ten representative production HTML audits across galleries, collections, design details, tools and bilingual articles: zero findings.
- Final production UI matrix: 40 locale/page/viewport states passed with zero JavaScript page errors. Search, filters, free PNG exports, local placement, source validation, drawn guides and draft preservation also passed production interaction checks.
- Six CMS translations were read back after the final deployment: exact UTF-8 titles and body hashes match, and all are published. Their evidence is in `docs/articles/discovery-2026-10-16/cms-verification.json`.
- The final three image-loading attributes passed 32 relevant tests, another TypeScript check, a fresh Node production build and the final Cloudflare build. Both logo instances are lazy, decode asynchronously, have low fetch priority and generate no logo preload. Original PNG files are unchanged.

Cloudflare returns 403/1010 to the plain audit client. Production checks used anonymous GET responses from a normal browser, without changing security settings. `scripts/capture-tattoo-release.browser.js` saves the public responses under ignored `data/verification/production/`; `scripts/crawl-tattoo-release.py --browser-capture` validates those exact responses. Four console resource errors came from the deliberate invalid-route checks and returned the expected 404 status. Valid-page interaction runs reported no JavaScript page errors and no upload/AI POST requests.

The first deployment build encountered a Windows lock held by the local production preview's SQLite library. The preview was stopped and the normal deployment succeeded. No database schema migration was required.

## Production mobile performance

| Page            | Initial performance score | Final performance score | Final simulated LCP | Final CLS | Final TBT |
| --------------- | ------------------------- | ----------------------- | ------------------- | --------- | --------- |
| `/tattoo-ideas` | 80                        | 85                      | 1.40 s              | 0.0012    | 590 ms    |
| `/try-tattoo`   | 64                        | 80                      | 3.69 s              | 0         | 119 ms    |

Both final runs scored 100 for accessibility, recommended practices and SEO. Measurements are single Lighthouse lab runs under mobile throttling, not field Core Web Vitals. Slow mobile first-load performance still has room to improve, especially the try-on LCP and the gallery's blocking-time result. The large existing branding PNGs and shared client bundle remain candidates for a separate delivery-size optimization.

## Remaining validation

Actual paid cover-up/filler generation and visual quality review await the user's notification that the visible Edge test window is signed in with credits. Free behavior and transport contracts have passed; paid output quality is not yet claimed. Keep that window available, use public reference artwork, and verify one result for each task plus source/guide ordering and the single batch upload before claiming those checks complete.

## Quota checkpoint

Last observed account usage: 71% used, 29% remaining in the available window. Stop when any available window reaches 95% used. No reset credits were redeemed.
