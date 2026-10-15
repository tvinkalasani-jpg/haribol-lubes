# Phase 31B verification evidence

Phase 31B redesigns the global header and navigation while preserving the existing page content, theme system, enquiry flows, and commerce state.

## Browser matrix

- Routes: home, products, product finder, product detail, about, contact, request a quote, and resources
- Widths: 320, 390, 480, 768, 900, 1024, 1120, 1280, 1440, and 1920 pixels
- Themes: light and dark
- Result: 160 of 160 checks passed, with no browser exceptions

The machine-readable result is in `responsive-report.json`. The five JPEG files in this directory record the required light, dark, mobile-menu, and scrolled-header states.

## Lighthouse

Lighthouse 13.5.0 was run against the production build at localhost with its standard mobile profile.

| Theme | Runs | Median performance | Accessibility | Best practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Light | 87, 89, 86 | 87 | 100 | 100 | 69 |
| Dark | 82, 92, 99 | 92 | 100 | 100 | 69 |

The earlier single-pass Light 61 and Dark 70 results were not reproducible in the controlled six-run audit. The performance variance was dominated by existing whole-page JavaScript/main-thread work, local redirect cost, and the test machine benchmark rather than header work. See `performance-investigation.md` and `lighthouse-runs.json` for the evidence. SEO is capped because this non-production build intentionally blocks indexing.
