# Phase 31K performance and staging-readiness report

Status: **performance and local regression QA complete; staging configuration and live service verification remain blocked**.

## Scope and method

Phase 31K preserved the approved layouts, content, RFQ contract, security controls, SEO indexing mode and disabled-commerce boundary. Measurements used a local production build, Chrome's mobile viewport, disabled browser cache and Lighthouse mobile simulated throttling. Lighthouse medians are based on three valid runs per target; runs without a recorded navigation trace were discarded and retried.

The evidence is stored under `docs/phase-31k/`. `baseline/` is the fresh pre-change production-build measurement, `after/` is the matched post-change measurement, `responsive/` contains browser regression evidence and `route-smoke/` contains the crawl report.

## Root-cause findings

Contact and RFQ are server-rendered pages with isolated client form islands. Contact's client code uses local error/consent state, one submit-time validation path and request-animation-frame focus handling. RFQ uses local outcome/error/pending/product-prefill state and one controlled analytics effect. Neither page hydrates its full shell, performs work on each keystroke beyond native form behavior, or contains a render loop.

The fresh profiles found 487 DOM elements on Contact and 451 on RFQ. Their JavaScript was only 3.7 KB and 5.9 KB above the 145.1 KB Industries shared-shell reference. Neither route produced a live long task in the Chrome profile. The earlier Phase 31J scores were therefore not explained by a large form bundle, third-party script or page-wide client boundary. They were dominated by long-document rendering under throttling plus substantial host variance. This is demonstrated by fresh pre-change medians of 86 for Contact and 96 for RFQ before any application change, compared with Phase 31J medians of 77 and 80.

The long below-fold sections remained meaningful avoidable rendering work. Contact now applies `content-visibility: auto` to its seven below-fold sections with reserved intrinsic block sizes. RFQ applies the same containment to its form section. Print explicitly restores full visibility. This keeps all content and semantics, preserves keyboard access and reserves layout space while allowing Chromium to defer offscreen style, layout and paint work. No JavaScript, form logic, validation, schema, API or persistence behavior changed.

## Lighthouse results

### Fresh pre-change to post-change

| Target | Performance | LCP | TBT | CLS | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage Light | 99 → 99 | 1007 → 1012 ms | 98 → 95 ms | 0 → 0 | 100 | 100 | 66 |
| Homepage Dark | 99 → 99 | 1090 → 1062 ms | 127 → 105 ms | 0 → 0 | 100 | 100 | 66 |
| Product detail Light | 98 → 98 | 934 → 943 ms | 161 → 172 ms | 0 → 0 | 100 | 100 | 69 |
| Industries Light | 99 → 99 | 920 → 919 ms | 96 → 149 ms | 0 → 0 | 100 | 100 | 66 |
| Contact Light | 86 → 89 | 1121 → 999 ms | 542 → 448 ms | 0 → 0 | 100 | 100 | 66 |
| RFQ Light | 96 → 97 | 855 → 915 ms | 229 → 202 ms | 0 → 0 | 100 | 100 | 66 |
| Product Finder Light | 99 → 93 | 928 → 995 ms | 149 → 331 ms | 0 → 0 | 100 | 100 | 66 |

The Product Finder result changed without any Product Finder, shared JavaScript or shared application change. Its transferred JavaScript was byte-identical and its unthrottled task time improved from 279.9 ms to 219.6 ms. Two final Lighthouse runs used much slower benchmark indices than the third, so the 93 median is classified as test-host variance rather than a code regression. It remains above the performance target and has Accessibility 100, Best Practices 100 and CLS 0.

### Phase 31J to Phase 31K final

| Target | Performance | TBT | LCP | CLS |
| --- | ---: | ---: | ---: | ---: |
| Homepage Light | 93 → 99 | 283 → 95 ms | 1604 → 1012 ms | 0 → 0 |
| Homepage Dark | 93 → 99 | 283 → 105 ms | 1713 → 1062 ms | 0 → 0 |
| Product detail Light | 90 → 98 | 401 → 172 ms | 1153 → 943 ms | 0 → 0 |
| Industries Light | 94 → 99 | 275 → 149 ms | 1068 → 919 ms | 0 → 0 |
| Contact Light | 77 → 89 | 1084 → 448 ms | 1478 → 999 ms | 0 → 0 |
| RFQ Light | 80 → 97 | 880 → 202 ms | 1279 → 915 ms | 0 → 0 |
| Product Finder Light | not measured → 93 | not measured → 331 ms | not measured → 995 ms | not measured → 0 |

Only the Contact and RFQ differences between the fresh pre-change and post-change runs can be associated with the Phase 31K CSS change. The larger Phase 31J-to-31K difference also includes the measured Lighthouse host variance.

## Transfer, DOM and runtime profile

| Target | DOM | HTML snapshot | JS | CSS | Images | Fonts | Total transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage Light | 1,416 | 274.4 KB | 9 / 154.0 KB | 3 / 35.9 KB | 0 / 0 KB | 3 / 56.3 KB | 290.6 KB |
| Product detail Light | 616 | 104.0 KB | 8 / 151.8 KB | 3 / 33.0 KB | 1 / 14.0 KB | 3 / 56.3 KB | 271.9 KB |
| Industries Light | 418 | 67.3 KB | 7 / 145.1 KB | 3 / 32.5 KB | 0 / 0 KB | 3 / 56.3 KB | 246.5 KB |
| Contact Light | 487 | 75.9 KB | 8 / 148.8 KB | 3 / 32.8 KB | 0 / 0 KB | 3 / 56.3 KB | 252.8 KB |
| RFQ Light | 451 | 65.2 KB | 8 / 151.0 KB | 3 / 32.1 KB | 0 / 0 KB | 3 / 56.3 KB | 253.9 KB |
| Product Finder Light | 471 | 74.0 KB | 9 / 161.1 KB | 3 / 31.9 KB | 0 / 0 KB | 3 / 56.3 KB | 264.8 KB |

JavaScript bytes were identical before and after. CSS increased by 75 bytes on Contact and 63 bytes on RFQ after compression; other route CSS changed by 13 bytes through the shared chunk. There was no route-only logic moved into the shared bundle. Phase 31J did not capture an equivalent transfer profile, so a byte-accurate transfer comparison with that phase is unavailable.

All audited network requests were same-origin. No analytics, map SDK, WebGL runtime, hosted animation runtime or commerce SDK request occurred. Three font requests totalled 56.3 KB and represented the expected local Manrope and Barlow Condensed files, with no unexpected duplicate. CLS stayed at zero. Product images use Next image sizing; the representative product-detail initial image transferred 14.0 KB. Below-fold product images remained lazy and were not preloaded.

The homepage has the largest DOM and server HTML because its approved industrial SVG systems are inline, but it still scored 99 with a roughly one-second LCP. Removing paths or visual quality was not supported by the performance evidence. Contact and RFQ had no image transfer. No high-DOM route contained duplicate hidden form content.

The live post-change Chrome profile recorded no long task on Contact, RFQ, product detail, Industries or Product Finder. One 50 ms boundary task appeared on Homepage Light; Homepage Dark had none, and the Lighthouse median remained 99. This isolated boundary event was not assigned to an application regression.

## Client, event and render audit

The server shell remains intact. Client boundaries are limited to Product Finder, catalogue search, theme control, header controller, hero visual enhancer, Contact form, RFQ form and disabled-commerce test components. The form boundaries are already smaller than the pages that contain them; further splitting would add complexity without measured transfer benefit.

The header scroll handler is passive, animation-frame batched and mutates a data attribute without React state. Global keyboard, pointer and media-query listeners have cleanup paths. Hero pointer listeners are passive and stop when offscreen or reduced motion applies. Contact and RFQ do not register continuous global listeners. No avoidable React render loop was found, so speculative memoisation was not added.

Backdrop blur is confined to the restrained scrolled header state and has an opaque fallback. Contact/RFQ do not use `:has()`, large animated filters or layout-triggering animation. The RFQ panel shadow is static. Existing approved SVGs and visual effects were retained because the measured routes meet target budgets.

## Regression evidence

- Responsive/browser audit: 192/192 states passed across 12 routes, Light and Dark, widths 320, 390, 480, 768, 1024, 1440 and 1920, plus landscape checks.
- Keyboard flows: 8/8 passed; mobile menu focus, product disclosure and Escape return passed.
- Reduced motion: passed; browser errors and hydration errors: 0 on representative public routes.
- Route crawl: 66 responses, 64 HTML 200 responses and two expected legacy redirect probes; no broken links, canonical errors, schema errors, duplicate metadata or heading errors.
- True missing route: HTTP 404 with `noindex, nofollow, noarchive`.
- Local/staging indexing remained disabled: 64 crawled pages were noindex and the sitemap was empty.
- All seven Lighthouse targets retained Accessibility 100, Best Practices 100 and CLS 0.
- Lint, strict TypeScript, production build and every required project validator passed.

## Performance budgets

These are review gates for future changes, measured as compressed transfer on a cold route load unless stated otherwise.

| Budget | Gate |
| --- | --- |
| Homepage initial JS | ≤ 165 KB; investigate any increase above 10 KB per phase |
| Product-detail initial JS | ≤ 160 KB |
| Contact initial JS | ≤ 155 KB; route-specific delta over the server-heavy baseline should remain ≤ 10 KB |
| RFQ initial JS | ≤ 158 KB; route-specific delta should remain ≤ 12 KB |
| Product Finder initial JS | ≤ 170 KB |
| Mobile Lighthouse LCP | ≤ 2.5 s; working target ≤ 1.8 s |
| CLS | ≤ 0.05; working target 0 |
| TBT | ≤ 300 ms for ordinary routes; Contact temporary ceiling ≤ 500 ms pending field staging data |
| Below-fold imagery | `loading=lazy`; no preload or priority without above-fold/LCP evidence |
| Raster visual | ≤ 150 KB per responsive candidate; above-fold raster total ≤ 200 KB |
| Homepage inline visual/HTML | HTML snapshot ≤ 300 KB unless a measured visual requirement is approved |
| Third-party runtime | 0 requests until the relevant integration and privacy review are approved |

Budgets are gates, not automatic launch criteria. Re-measure three-run medians on the staging host because local simulated throttling cannot predict origin, database, cache or object-storage latency.

## Staging-readiness matrix

| Area | Status | Evidence / action |
| --- | --- | --- |
| Production build | GREEN | Next.js generated 49 pages; no build error or warning requiring action |
| Accessibility | GREEN | Lighthouse 100 on all seven targets; 192 responsive states and keyboard/reduced-motion checks passed |
| Public-page performance | GREEN | Contact 89 and RFQ 97; all measured targets ≥ 89, Best Practices 100 and CLS 0 |
| Application security/privacy controls | GREEN | 60/60 validator checks passed with enforcing local CSP |
| RFQ code path | GREEN | 38/38 validation, failure, persistence and concurrency checks passed |
| CMS adapter/schema parity | GREEN | 10 products, 21 variants and related taxonomy matched |
| Storage architecture | GREEN | 18/18 adapter, access and failure checks passed |
| Commerce boundary | GREEN | Commerce 46/46, storefront 50/50 and checkout 46/46; public commerce remains disabled |
| SEO staging boundary | GREEN | Noindex, empty sitemap and canonical behavior preserved |
| Live managed PostgreSQL / migrations | RED | Configure staging secrets and run/record managed migrations and CMS verification |
| Live public/private object storage | RED | Configure both buckets and record upload/read/delete/failure tests |
| Resend delivery | RED | Verify sender/domain/API key and record stored-then-notified RFQ receipt/failure tests |
| Staging access and readiness protection | RED | Configure HTTPS staging URL, Basic Auth credentials and readiness token |
| Backups and restore | RED | Enable provider backups and complete a recorded restore drill |
| Monitoring | AMBER | Railway health/logging is planned; Sentry and external uptime monitoring remain deferred |
| Legal and final public content | RED for production | Obtain business/legal review and finish any outstanding public contact/social content decisions |

The repository is ready to proceed to a controlled staging-configuration phase, but the current environment is not ready to expose staging. `pnpm check:staging --allow-incomplete` and `pnpm check:production --allow-incomplete` correctly report the missing runtime configuration and do not clear those gates.

## Remaining blockers and limitations

- Final production domain ownership, DNS/TLS and redirect verification are incomplete.
- Managed staging/production PostgreSQL credentials, migrations, first-admin bootstrap and live CMS tests are incomplete.
- Railway public/private object-storage credentials and live object tests are incomplete.
- Resend domain, sender, API credential and received-email verification are incomplete.
- The current Railway backup capability and a full restore drill remain unresolved/unrecorded.
- Shared production rate limiting, final HSTS verification and production readiness checks remain incomplete.
- Production indexing must stay disabled until the explicit launch gate.
- Privacy/Terms legal review and any remaining verified public contact/social content are pending.
- Lighthouse uses local simulated throttling and a three-run median; the benchmark index varied materially. Field Core Web Vitals and staging-origin latency do not yet exist.
- Dynamic Payload Admin and private-document behavior require the real staging database and buckets for end-to-end verification.

Phase 31L was not started. The recommended next phase is controlled staging configuration and live provider verification against the existing `docs/staging-runbook.md`, followed by authenticated staging performance and security evidence.
