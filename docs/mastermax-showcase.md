# Mastermax homepage showcase

## Purpose

The homepage presents Mastermax as Haribol Lubes Limited's owned lubricant brand through a dark campaign-style section. It combines a strong brand statement, a catalogue-derived product-family composition, enquiry-led calls to action, and a compact index of the six supported catalogue groups.

## Verified source boundary

- Ownership wording uses the verified project direction: `Mastermax is an owned brand of Haribol Lubes Limited.`
- Brand description and route come from `src/data/brands.ts`.
- Product groups, descriptions, grades, category routes, and image references come from `src/data/mastermax-catalogue.ts`.
- The four visible packs are existing catalogue-derived images. No pack, label, specification, certification, or performance claim is fabricated.
- Industrial oils and greases remain represented in the product-family index without invented pack artwork.
- Product details retain the existing `Technical verification required` status.

## Visual concept

The campaign masthead uses large Mastermax typography, a restrained orange/brass accent, a technical grid, and a layered family of four existing product packs. The product-family index below uses native radio controls and CSS `:has()` to reveal one group at a time. This preserves semantic controls and avoids client-side state or hydration for the section.

The section intentionally remains dark in both site themes. The Dark theme uses a slightly deeper surface and stronger orange glow while keeping the same content hierarchy and contrast.

## Interaction and motion

- Fine pointers receive a short family-pack separation and highlight sweep on masthead hover or keyboard focus within the masthead.
- Product groups switch through native radio controls; group links remain normal server-rendered anchors.
- Coarse pointers receive static imagery and controls.
- `prefers-reduced-motion: reduce` reduces transitions to effectively zero and disables the highlight sweep movement.
- There are no autoplay loops, timers, scroll listeners, canvas scenes, WebGL scenes, or animation libraries.

## Responsive behavior

- Wide layouts pair campaign copy with the family visual and place the group selector beside its active details.
- Tablet layouts stack the group index above its active panel and use a three-column selector.
- Small screens stack the campaign, make both calls to action full width, use a two-column selector, and simplify the detail panel.
- At very narrow widths the selector becomes one column.
- The section has no horizontal-scroll interaction.

## Performance architecture

The showcase is a React Server Component. Its decorative drawing is inline SVG and CSS. Product media uses `next/image` against existing local WebP files, with responsive `sizes` hints. No new dependency or client bundle was added for this phase.

Cold-load measurement confirms that the initial JavaScript remains 157,680 transferred bytes across nine requests, exactly matching Phase 31E. Mastermax imagery adds zero bytes before the below-fold section is approached; the four optimized images transfer 59,664 bytes when the section enters view. CLS is zero. Detailed audit evidence and the explanation of CPU-constrained Lighthouse variance are in `docs/phase-31f/performance-investigation.md`.

## Commerce boundary

The section offers `Explore Mastermax`, `Request a Quote`, and product-category discovery. It does not expose prices, cart actions, checkout controls, or purchase promises. Commerce remains disabled and enquiry-led.
