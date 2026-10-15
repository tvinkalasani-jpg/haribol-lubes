# Phase 31F performance investigation

## Result

The three-run Lighthouse mobile medians were:

| Theme | Performance | Accessibility | Best Practices | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Light | 87 | 100 | 100 | 1,253 ms | 1,596 ms | 505 ms | 0 |
| Dark | 94 | 100 | 100 | 1,334 ms | 1,476 ms | 288 ms | 0 |

Phase 31E reported 97 Light and 98 Dark. The lower Phase 31F numeric performance scores were investigated rather than attributed to the redesigned section.

## Evidence

- The section is a React Server Component and adds no client component, hook, listener, timer, scroll handler, render loop, or animation library.
- Initial JavaScript remains exactly **157,680 transferred bytes across 9 requests**, matching the Phase 31E transfer report.
- The Mastermax product images contribute **0 bytes to the initial page view** because they are below the fold and lazy-loaded.
- Scrolling the section into view transfers four optimized local images totalling **59,664 bytes**.
- Production HTML is **248,907 uncompressed UTF-8 bytes**, lower than the 255,561-byte Phase 31E record.
- CLS remained **0** in all six runs.
- Accessibility and Best Practices remained **100** in all six runs.
- LCP remained within 1.35–1.68 seconds across the six runs; the redesigned section is below the initial viewport and is not the LCP element.

The current Lighthouse environment benchmark indices were approximately 991–1,096. The selected Phase 31E runs recorded approximately 2,431–2,574. The audit host therefore benchmarked at less than half its previous effective CPU rate. Current main-thread and JavaScript-duration diagnostics rose in the same proportion even though the transferred script payload and request count did not change. This is evidence of local audit-host variance, especially in Total Blocking Time, rather than new Mastermax JavaScript work.

Raw reports and the generated median summary are stored in `docs/phase-31f/lighthouse/`. Transfer evidence is stored in `docs/phase-31f/transfer-report.json`.

## Performance controls retained

- Existing local WebP catalogue assets use `next/image` responsive sizing.
- Image dimensions reserve layout space.
- CSS transitions run only during hover or focus interaction.
- Coarse pointers disable decorative transitions.
- Reduced motion effectively removes transition duration and prevents the highlight sweep.
- The section performs no work during scroll.
