# Dormant commerce performance and production readiness

Phase 25E-A audited the public production build with `commerceEnabled: false`. It did not enable commerce, add prices, or integrate payments.

## Conclusion

Two separate effects explained the Phase 25E Lighthouse result:

1. The product route shipped a dormant 3,090-byte storefront client island. Its route chunk contained the offer selector, quantity control, cart functions, price presentation, synthetic copy, and cart `localStorage` parser even though the server rendered no commerce UI.
2. The reported 72/73 scores were not repeatable on the unchanged build. Six pre-change mobile runs produced 78–84 for home and 89–90 for product. Lighthouse host benchmark values varied materially and fell further during the final series, while bytes, requests, LCP elements, and application behavior stayed stable.

The homepage never shipped commerce code. Its JS remained exactly 150,396 transferred bytes, matching Phase 25D. The product boundary leak was real but too small and too product-specific to explain the homepage score drop.

## Import boundary

The product route previously contained a conditional dynamic import of the client storefront. Turbopack still emitted that client reference into the product route chunk.

The route now imports `@storefront-product-slot`. `next.config.ts` resolves that alias at build time:

- disabled site and no exact test flag: `product-slot.disabled.tsx`, a server-only null slot with no commerce imports;
- enabled site or exact `STOREFRONT_TEST_MODE=true`: `product-slot.enabled.tsx`, which imports the commerce island and synthetic fixtures.

The TypeScript path points to the disabled implementation for type checking. Both implementations share one props type. A temporary enabled production build verified the storefront path before the final disabled rebuild.

## Cart provider and localStorage

There is no global cart context or provider in the website layout. Cart state is local to test-gated commerce components. In the final disabled build:

- no cart initialization runs;
- no storefront storage parser ships on home or product;
- no storage listener exists;
- no offer resolver or cart count hydrates globally;
- theme preference remains the only unrelated use of `localStorage`.

## Test-mode isolation

The development override requires the exact server environment value `STOREFRONT_TEST_MODE=true`. No query parameter activates it. Test APIs and cart/checkout routes call `notFound()` when the flag is absent. Synthetic fixtures remain code-only and are reachable only from the enabled build entry. The final product's referenced scripts contain none of the tested storefront strings.

## Bundle comparison

Transferred bytes are from mobile Lighthouse network records.

| Build/page | Requests | Total | JS | CSS | HTML | Images |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Phase 25D home | 17 | 235,470 B | 150,396 B | 28,163 B | 465 B | 0 B |
| Phase 25E-A pre-change home | 17 | 235,598 B* | 150,396 B | 28,290 B | 466 B* | 0 B |
| Phase 25D product | 19 | 264,731 B | 150,396 B | 30,952 B | 465 B | 26,430 B |
| Phase 25E-A pre-change product | 19 | 266,514 B | 153,486 B | 29,645 B | 465 B | 26,430 B |
| Phase 25E-A final product | 18 | 261,176 B | 150,396 B | 27,396 B | 466 B | 26,430 B |

`*` Some homepage runs transferred a 27,317-byte document response instead of the normal 465–466-byte response, producing a 262,449-byte total without changing JS/CSS.

The final homepage and product audits load the same 150,396 bytes of shared JavaScript. Product-only client JS is now 0 bytes. The product uses server-rendered route content plus its image and CSS.

## Pre-change mobile Lighthouse

| Page/run | Performance | FCP | LCP | TBT | CLS | Speed Index | Benchmark |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home 1 | 83 | 1,318 ms | 2,166 ms | 469 ms | 0 | 4,963 ms | 1,807.0 |
| Home 2 | 78 | 1,529 ms | 3,146 ms | 396 ms | 0 | 5,850 ms | 1,943.5 |
| Home 3 | 84 | 1,689 ms | 2,148 ms | 350 ms | 0 | 6,136 ms | 1,877.0 |
| Product 1 | 90 | 1,256 ms | 3,029 ms | 98 ms | 0 | 4,898 ms | 1,826.5 |
| Product 2 | 89 | 1,244 ms | 3,064 ms | 124 ms | 0 | 5,121 ms | 1,945.5 |
| Product 3 | 90 | 1,234 ms | 3,029 ms | 114 ms | 0 | 5,004 ms | 1,892.5 |

The Phase 25D single runs were home 91 and product 91, with benchmark values 1,617 and 2,073 respectively.

## Final mobile Lighthouse

| Page/run | Performance | FCP | LCP | TBT | CLS | Speed Index | Benchmark |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home 1 | 80 | 1,479 ms | 3,223 ms | 413 ms | 0 | 4,412 ms | 1,102.0 |
| Home 2 | 84 | 1,530 ms | 2,328 ms | 422 ms | 0 | 4,781 ms | 1,111.0 |
| Home 3 | 81 | 1,855 ms | 2,040 ms | 525 ms | 0 | 5,020 ms | 1,227.0 |
| Product 1 | 79 | 1,096 ms | 3,369 ms | 456 ms | 0.003 | 3,826 ms | 1,186.0 |
| Product 2 | 87 | 1,096 ms | 3,175 ms | 229 ms | 0 | 3,738 ms | 1,106.5 |
| Product 3 | 85 | 1,441 ms | 3,145 ms | 304 ms | 0 | 3,978 ms | 1,184.5 |

Medians:

- Homepage: Performance 81, LCP 2,328 ms, TBT 422 ms, CLS 0.
- Product: Performance 85, LCP 3,175 ms, TBT 304 ms, CLS 0.

Final desktop:

- Homepage: Performance 96, Accessibility 100, Best Practices 100, SEO 100, LCP 833 ms, TBT 66 ms, CLS 0.
- Product: Performance 100, Accessibility 100, Best Practices 100, SEO 66, LCP 703 ms, TBT 29 ms, CLS 0. Product SEO remains intentionally reduced by its existing catalogue `noindex` state.

The final mobile benchmark range, 1,102–1,227, is roughly 35–42% below the pre-change range of 1,807–1,946. This explains why removing bytes did not monotonically raise mobile scores.

## Main thread and LCP

Representative final mobile runs show Style & Layout and shared framework execution as the largest contributors. The shared `0nqq8y_qpkps9.js` framework chunk accounted for the named script-evaluation long task. No commerce script appeared in final home or product traces.

- Home LCP: the “PROTECTING PERFORMANCE.” hero heading. Phase 25E did not change it.
- Product LCP: the existing Mastermax engine-oil catalogue image. Phase 25E did not change its source, dimensions, sizes, priority, or font path.

No verified Phase 25E regression was found in font loading, hero rendering, shared layout, global hydration, or server timing. Broader homepage animation/layout tuning was intentionally left outside this audit.

## Database readiness

A separate non-production PostgreSQL 17 cluster was created at `.postgres-phase25ea` and bound only to `127.0.0.1:55433`. It uses local trust authentication and must never be exposed or reused for production. Runtime connection values and the development-only Payload secret were process-scoped; no `.env.local` secret was written.

Applied migrations:

- `20260928_074057_phase25_foundation`
- `20261004_083431_phase25c_commerce_offers`
- `20261004_091825_phase25d_cart_checkout_orders`

The approved catalogue seed produced 1 brand, 9 categories, 14 applications, 10 specifications, 4 markets, 10 products, and 21 variants. It produced 0 offers, 0 orders, and 0 transactions.

Database checks passed:

- CMS counts, draft/verification state, relationships, static/CMS parity, access control, and RFQ idempotency;
- offer permissions, stored integer pricing, promotion validation, price history, and synthetic cleanup;
- order/payment access, immutable snapshots, state transitions, order idempotency uniqueness, provider-reference uniqueness, history, and synthetic cleanup.

The synthetic RFQ created by the CMS database test was also removed. Final counts are 0 offers, 0 orders, 0 payment transactions, and 0 synthetic enquiries. Legitimate seeded catalogue records remain.

## Payment-integration gate

Payment integration must not begin until every item is confirmed:

- [x] Isolated development PostgreSQL available
- [ ] Production PostgreSQL provider and capacity plan approved
- [ ] Automated backups, retention, restoration test, and ownership defined
- [ ] Development/staging/production secrets strategy approved
- [ ] Transaction locking and concurrent stock/order strategy designed and tested
- [ ] Public HTTPS deployment and domain plan approved
- [ ] Public webhook endpoint and retry/replay capability available
- [ ] Provider sandbox and later production credentials available
- [ ] Verified legal/business/payment-recipient details supplied
- [ ] Real sellable offers, packs, SKUs, prices, market rules, and stock source approved
- [ ] Tax treatment decided
- [ ] Delivery zones, rates, responsibility, and failure policy decided
- [ ] Refund, cancellation, returns, reconciliation, and support workflow approved

Development persistence is now testable, but payment integration is not technically safe to begin because the unchecked production, financial, operational, and business prerequisites remain unresolved.

## Final guarantee

The final build has `commerceEnabled: false`, no test flag, no public pricing or Add to Cart, `/cart` and `/checkout` return 404, test API POSTs return 404, and no synthetic commerce records remain. No payment functionality was added.

Lighthouse wrote all JSON reports successfully. On this Windows host, Chrome Launcher then failed to remove its temporary profile directory and returned `EPERM`; this happens after report creation and does not invalidate the reports.
