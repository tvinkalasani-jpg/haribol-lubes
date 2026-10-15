# Hero visual system

Phase 31D replaces the Phase 31C placeholder with a code-owned industrial bearing assembly. The visual combines a bearing race, roller cage, shaft, secondary gear, lubricant film and restrained technical readouts. It is an abstract engineering composition and does not represent a packaged Haribol or Mastermax product.

## Technology

The complete fallback is server-rendered SVG and CSS. This provides the required geometry, depth and art direction without Three.js, WebGL, textures or a hosted runtime. No dependency or Content Security Policy change is required.

A small client enhancer is loaded after browser idle time. It updates CSS custom properties directly through `requestAnimationFrame`, so pointer movement does not trigger React renders. An `IntersectionObserver` pauses continuous CSS motion when the visual is offscreen.

## Interaction and fallbacks

- Precise desktop pointers receive limited tilt, translation and lighting response.
- Mobile and coarse-pointer devices use the stable server-rendered composition with continuous assembly motion disabled.
- `prefers-reduced-motion` disables the cage, gear, lubricant and light-sweep animations.
- If JavaScript or the enhancer fails, the complete SVG composition remains visible.
- The visual is decorative, excluded from the accessibility tree and contains no controls.

## Themes and performance

Light and Dark use the same mechanical composition with theme-specific ambient light and frame-shadow values. Headline and CTA rendering remain independent from the enhancer. The visual has fixed dimensions before enhancement, so initialization does not create layout shift.

Phase 31D adds no raster asset, texture, 3D library or global runtime. The only added browser code is the idle loader and isolated pointer/visibility enhancer.

The production transfer audit (cache disabled) measured the delayed motion module at 1,973 bytes on disk and 2,007 transferred bytes. It loads after the initial page scripts, so it does not block the server-rendered headline, CTAs or visual fallback. The complete homepage transferred 157,680 bytes across nine JavaScript requests in the same local production run; no image or 3D asset bytes were added.

Three Lighthouse 13.5.0 mobile-profile passes per theme produced median Performance scores of 99 for Light and 99 for Dark. Median Light metrics were LCP 1.03 s, TBT 121.5 ms and CLS 0. Median Dark metrics were LCP 1.11 s, TBT 140.5 ms and CLS 0. Raw results are stored in `docs/phase-31d/lighthouse-runs.json`; the clean-cache JavaScript measurement is stored in `docs/phase-31d/transfer-report.json`.
