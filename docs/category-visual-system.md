# Product category visual system

Phase 31E upgrades the homepage product-category section without changing its approved taxonomy, routes or catalogue relationships. The section remains a Server Component and maps the existing `productCategories` data into seven semantic category links.

## Category concepts

- **Engine Oils:** piston, connecting rod and crank assembly with a lubricant-film path.
- **Gear Oils:** meshing large and small gears with a shared load path.
- **Transmission Fluids:** transmission housing and planetary transfer assembly.
- **Hydraulic Oils:** cylinder, piston, actuator rod and pressure return line.
- **Industrial Lubricants:** machine spindle, shaft and roller-bearing assembly.
- **Greases:** bearing race, distribution nodes and a grease path around the race.
- **Specialty Fluids:** controlled manifold and three-valve flow network.

These are abstract category concepts. They do not depict product packs, grades, certifications or equipment compatibility.

## Technology and interaction

All artwork is code-owned, inline SVG styled by the existing CSS-module and theme-token system. No visual dependency, raster asset, WebGL runtime, canvas, client component or Content Security Policy change is required.

Desktop hover and keyboard focus activate small, category-specific transforms: piston travel, opposing gear movement, planetary movement, actuator travel, spindle rotation, bearing rotation and valve compression. Lubricant and pressure paths shift their dash position once during the state change. There is no continuous render loop or permanently running mechanical animation.

## Mobile, reduced motion and fallback

Mobile and coarse pointers receive the complete static artwork with all motion transitions disabled. `prefers-reduced-motion` removes entry, card, artwork and mechanical transitions while retaining the full hierarchy. With JavaScript disabled, all seven names, descriptions, links and SVG compositions remain available because the entire section is server rendered.

## Themes and performance

Light mode combines warm mineral panels with selected graphite feature panels. Dark mode reuses the same compositions with charcoal surfaces, off-white linework and restrained brass accents. The layout reserves every panel before paint, so artwork initialization cannot create layout shift.

Phase 31E adds no browser JavaScript and no external asset bytes. Production Lighthouse and responsive QA evidence is stored in `docs/phase-31e/`.

The final cache-disabled transfer check records the same 9 scripts and 157,680 transferred script bytes as the Phase 31D baseline, with no late category script. The server-rendered homepage HTML is 255,561 bytes, an increase of 24,937 uncompressed bytes from the 230,624-byte Phase 31D response because the seven SVG compositions are included in the document.

The settled three-pass Lighthouse mobile series produced light-mode performance scores of 97, 96 and 98 (median 97), and dark-mode scores of 97, 99 and 98 (median 98). Accessibility and Best Practices remained 100, SEO remained at the expected local-preview score of 69, and CLS remained 0 in every valid run. A preliminary light series showed CPU benchmark indices between 1,093 and 1,573.5 and correspondingly volatile performance scores; the settled reported series ran between 2,532 and 2,644.5. This evidence points to host contention rather than category JavaScript or layout work.
