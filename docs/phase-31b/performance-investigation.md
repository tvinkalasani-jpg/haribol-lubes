# Phase 31B performance investigation

## Finding

The earlier Light 61 and Dark 70 scores were not reproducible under a consistent production-test setup. Six isolated Lighthouse 13.5.0 mobile-profile passes against the final build produced median performance scores of 87 for Light and 92 for Dark. Phase 31A recorded 91 and 88 respectively, placing the final medians four points on either side of the earlier results rather than showing a broad regression.

## Header evidence

- The combined header and theme client chunk in the inspected production build was 14,647 bytes uncompressed and 6,641 bytes transferred.
- Lighthouse did not attribute a long task to that header/theme chunk.
- Cumulative Layout Shift was 0 in all six controlled runs.
- The header controller uses no React state, so scrolling does not cause React renders.
- The passive scroll listener coalesces work through `requestAnimationFrame` and changes the DOM only when crossing the 16px threshold.
- The scrolled backdrop filter is inactive during the initial top-of-page Lighthouse load, so it did not contribute to the measured startup regression.
- Products and mobile-menu focus logic runs only after user interaction.
- WhatsApp remains a server-rendered link and adds no client component.
- Desktop and mobile theme controls are both present for responsive accessibility. They were already present before Phase 31B and were not the source of the measured one-off regression.

The low one-off run showed 2,360ms Total Blocking Time, 10.8s of main-thread work, a 618.5 environment benchmark index, and a 760ms redirect estimate. Final controlled runs recorded 102–680ms Total Blocking Time, 2.3–5.2s of main-thread work, and benchmark indices of 729–2050. The resulting performance scores ranged from 82 to 99 despite identical final application code. This large machine/run spread explains the reported score change more strongly than the header bundle or interaction logic.

## Optimization retained

The scroll path was already appropriately bounded. The window-wide resize listener was replaced with a media-query `change` listener, so the mobile overlay cleanup now runs only when the desktop breakpoint changes rather than during every resize event.

Full run data, including FCP, LCP, TBT, CLS, Speed Index, main-thread time, and environment benchmark index, is stored in `lighthouse-runs.json`.
