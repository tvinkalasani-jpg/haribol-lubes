# Product Finder mobile performance hardening

Phase 19A profiled the production build at `http://localhost:3007`. All mobile runs used Lighthouse 13.0.3 default mobile throttling. Desktop runs used the desktop preset.

## Finding

The Phase 19 mobile score of 74 was not repeatable. Three unchanged production-build baselines scored 97, 97, and 97 with 38–52 ms total blocking time. The dominant script task belongs to the shared React/Next runtime chunk, not the 12.8 KB finder chunk. The finder also transferred less data and performed less main-thread work than `/products`.

Later runs occurred while Lighthouse reported a machine benchmark index near 1,000 instead of the baseline 2,575–2,785. This produced proportionally longer shared-runtime tasks on both routes. Under that slower environment, the final finder median remained 90 while the `/products` control scored 82.

## Mobile audit runs

| Run | Performance | FCP | LCP | TBT | CLS | Speed Index | Benchmark index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Baseline 1 | 97 | 0.918 s | 2.590 s | 52 ms | 0 | 0.918 s | 2575.5 |
| Baseline 2 | 97 | 0.918 s | 2.567 s | 41 ms | 0 | 0.918 s | 2772 |
| Baseline 3 | 97 | 0.916 s | 2.557 s | 38 ms | 0 | 0.916 s | 2785 |
| Post-change exploratory 1 | 84 | 0.952 s | 2.891 s | 447 ms | 0 | 2.258 s | 931 |
| Post-change exploratory 2 | 90 | 0.926 s | 2.826 s | 268 ms | 0 | 2.083 s | 1007 |
| Post-change exploratory 3 | 89 | 0.927 s | 2.826 s | 288 ms | 0 | 2.132 s | 998.5 |
| Final 1 | 88 | 0.940 s | 2.750 s | 362 ms | 0 | 1.215 s | 1060.5 |
| Final 2 | 90 | 0.921 s | 2.798 s | 283 ms | 0 | 2.122 s | 1134 |
| Final 3 | 91 | 0.922 s | 2.811 s | 256 ms | 0 | 2.131 s | 1102.5 |

The final three-run medians are performance 90, LCP 2.798 s, TBT 283 ms, and CLS 0. Accessibility, Best Practices, and SEO remained 100 in every final run. The final desktop audit scored 100 in all four categories, with LCP 0.672 s, TBT 61 ms, and CLS 0.

## Production-build comparison

| Measurement | Product Finder baseline | Products baseline | Product Finder final | Products slow-environment control |
| --- | ---: | ---: | ---: | ---: |
| Performance | 97 | 93 | 90 median | 82 |
| Main-thread work | 706 ms | 1009 ms | environment-dependent | 2219 ms |
| Total transfer | 249.2 KB | 330.7 KB | 248.0 KB | 330.7 KB |
| JavaScript transfer | 154.0 KB | 153.3 KB | 154.1 KB | comparable shared runtime |

## Changes

- Project shared catalogue records into a finder-specific transport shape while preserving the Phase 18 normalized source and matching functions.
- Reduced the serialized finder dataset from 13,427 bytes to 8,864 bytes and initial HTML from about 65.9 KB to 60.7 KB.
- Kept analytics hooks dormant during hydration and shared-URL restoration. The start and result events now require real visitor interaction.
- Removed the mobile `backdrop-filter` from sticky controls and retained the same graphite appearance with an opaque background.
- Retained the existing client boundary because the current step, selections, native inputs, URL history, results, and accessible announcements are one cohesive interactive unit. Splitting it did not have measured justification.

The finder chunk changed from 12,843 bytes raw / 3,666 bytes gzip to 12,915 bytes raw / 3,715 bytes gzip. The small increase implements interaction gating for analytics; the meaningful transport reduction is in the serialized dataset and HTML.

## LCP and long tasks

The mobile LCP element is the server-rendered `PRODUCT FINDER` H1. It has no image request and CLS remains zero. At the fast baseline, the main long task was about 132 ms in the shared React/Next runtime. Under the later slower machine benchmark, the same shared chunk expanded to roughly 367 ms. Finder-specific startup work consists of state hydration, small in-memory filters over ten records, and one `popstate` listener; catalogue normalization remains server-side.

Lighthouse wrote every JSON report successfully. Its Windows launcher then reported an EPERM warning while removing its temporary profile directory; this occurs after report generation and does not affect scores.
