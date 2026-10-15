# Kenya location experience

## Purpose

Phase 31G replaces the abstract homepage location placeholder with an accurate, lightweight geographic presentation. Mlolongo is the only operating base presented. Nairobi appears solely as a nearby reference city.

## Geographic sources and licensing

The Kenya boundary comes from the Natural Earth `ne_10m_admin_0_countries` dataset:

- Dataset page: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/
- Source GeoJSON: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson
- Natural Earth data is public domain. Attribution is not required, but the section and project documentation identify the source.

The location references use OpenStreetMap records and retain visible `© OpenStreetMap contributors` attribution:

- Mlolongo: OpenStreetMap node 3953399343, `-1.39465, 36.94336`.
- Nairobi: OpenStreetMap reference position, `-1.2802, 36.8346`.
- OpenStreetMap data is available under the Open Database License: https://www.openstreetmap.org/copyright

These values locate settlements for the visual relationship. They do not claim to be the coordinates of Emerald Business Park and are not added to structured data.

## Map implementation

`scripts/extract-kenya-map.mjs` selects Kenya from the Natural Earth MultiPolygon, projects it into a local SVG view box, applies a modest Douglas-Peucker simplification, and writes `src/data/kenya-map.ts`. The generated path retains the mainland and supplied secondary polygon while avoiding a runtime geographic dataset.

The server-rendered component uses two related views:

1. An accurate national outline plots Nairobi and Mlolongo with a linear longitude/latitude projection.
2. A local coordinate plot uses a smaller fixed geographic extent around the two settlements so their proximity remains legible without moving either marker or inventing roads.

All labels and address information are repeated as real HTML text. The SVG is supplementary and hidden from assistive technology to prevent duplicate announcements.

## Address and Maps destination

The address remains sourced from `siteConfig.businessAddress`:

> Emerald Business Park
> Kutch Rd
> Mlolongo
> Kenya

The Open in Maps action continues to use the existing exact `siteConfig.businessAddress.mapsUrl`. No search query, replacement destination, postal code, opening hours, or business coordinates were introduced.

## Interaction and motion

Fine pointers activate a brief Mlolongo signal, a local relationship-line movement, and a two-pixel map lift on hover or keyboard focus within the map area. There is no scroll listener, pointer listener, client component, timer, canvas, map SDK, tile request, or continuous render loop.

Coarse pointers receive a static composition. `prefers-reduced-motion: reduce` removes the signal, travelling line, and map lift while retaining both maps, labels, address, attribution, and Maps link.

## Responsive behavior

Wide layouts place the national map and local plot beside the address panel. Medium layouts stack the full map experience over the address panel. Mobile layouts stack the national outline, local plot, legend, and address in that order. Labels use leader lines at national scale and a separate local extent to avoid collisions. No horizontal scrolling is required.

## Performance boundary

The shipped map is inline server-rendered SVG data. It has no external asset request and adds no JavaScript. The generated country path contains 3,588 characters; measured HTML and transfer impact are recorded in the Phase 31G evidence folder after production validation.

Production measurements compare Phase 31G with the saved Phase 31F evidence:

- Raw homepage HTML: 280,798 bytes, an increase of 31,891 bytes from 248,907 bytes. This includes the accurate outline, two plotted views, labels, legend, address panel, and React server payload.
- Initial transferred JavaScript: 155,673 bytes across 8 requests, down 2,007 bytes and one request from Phase 31F. The map itself adds zero JavaScript.
- External map assets, tiles, SDKs, and runtime requests: zero.
- Scrolling the Kenya section triggered no map request. Two unrelated lazy image requests occurred as the viewport crossed the preceding Mastermax section.
- The generated Kenya path is 3,588 characters and remains code-owned within the server-rendered module.

The three-run Lighthouse mobile medians were Performance 91 in Light and 92 in Dark, Accessibility 100, Best Practices 100, and CLS 0 in both themes. The corresponding Phase 31F medians were 87 and 94; benchmark indices differed across local runs, so the raw scores are retained with their benchmark evidence in `docs/phase-31g/lighthouse/summary.json`.

## Content boundary

The section does not claim a Nairobi office, nationwide delivery, multiple branches, East Africa operations, delivery speed, warehouse capacity, or customer coverage. It does not add future-market markers or commerce controls.
