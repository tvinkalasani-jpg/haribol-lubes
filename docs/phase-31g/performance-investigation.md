# Phase 31G performance evidence

## Production boundary

Measurements were taken from `next start` on port 3000 after a successful production build. An initial discarded pass reached the development server and was identified by its HMR and Next DevTools chunk URLs; those development-only results are not included in the final evidence.

## Transfer comparison

| Metric | Phase 31F | Phase 31G | Change |
| --- | ---: | ---: | ---: |
| Raw homepage HTML | 248,907 B | 280,798 B | +31,891 B |
| Initial script transfer | 157,680 B | 155,673 B | -2,007 B |
| Initial script requests | 9 | 8 | -1 |
| Map runtime requests | 0 | 0 | 0 |
| External map asset bytes | 0 | 0 | 0 |

The HTML increase contains the inline Natural Earth outline and accessible section markup. The Kenya section is a server component, so it adds no hydration boundary, event listener, map dependency, tile load, or client render loop.

## Lighthouse mobile medians

| Theme | Performance | Accessibility | Best Practices | LCP | TBT | CLS | Benchmark index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Light | 91 | 100 | 100 | 1,574 ms | 372 ms | 0 | 985 |
| Dark | 92 | 100 | 100 | 1,503 ms | 345 ms | 0 | 933 |

Phase 31F recorded Performance medians of 87 Light and 94 Dark. Phase 31G therefore improved Light by four points and moved Dark by two points while retaining the required quality gates. Local benchmark indices varied enough that these score movements should be treated as normal run variance rather than a map-runtime cost.

Raw reports and all six Lighthouse JSON files are stored in this directory.
