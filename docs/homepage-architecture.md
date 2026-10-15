# Homepage architecture

Phase 31C reshapes the homepage into a ten-part editorial journey while preserving the signed-off global header, footer, business configuration, catalogue, CMS publication rules, enquiry pathways, SEO, security, and disabled commerce state.

## Section order

1. Hero
2. Business and technical positioning
3. Product categories
4. Mastermax showcase
5. Industries
6. Product Finder
7. Kenya presence and verified Mlolongo address
8. Trust and technical capability
9. Resources and Insights
10. RFQ conversion

The sequence begins with category-level orientation, introduces the current featured brand before sector-specific browsing, then moves into guided selection, verified location, evidence-based capability, reviewed knowledge, and commercial enquiry.

## Visual hierarchy

The composition alternates warm ivory, mineral surfaces, and intentional dark contrast. Section spacing varies with content density rather than applying one repeated card pattern. Product categories use an asymmetric twelve-column mosaic; Mastermax is the principal dark brand chapter; industries remain fully discoverable through a directory paired with a technical network; Product Finder uses a selection instrument rather than a generic promotion card; and the final RFQ section remains the strongest conversion endpoint.

## Future visual regions

`data-visual-slot` identifies reserved regions in the hero, all product-category panels, the Mastermax product stage, and the Kenya composition. These regions use server-rendered SVG, CSS, type, and existing catalogue imagery. They require no WebGL, animation package, autoplay video, or new client component. Phase 31D can replace the hero fallback inside its existing layout boundary without changing content order or enquiry actions.

The Kenya region uses a Natural Earth country boundary with OpenStreetMap-sourced settlement reference points. Mlolongo is the verified operating base; Nairobi appears only as a nearby reference city. The address continues to come from central site configuration and the verified Maps URL is unchanged. Geographic source and projection details are documented in `docs/kenya-location-experience.md`.

## Content and publication rules

The homepage queries the existing public Insights and Resources repositories. Only content already admitted by those public repository rules can render. A designed empty state remains visible when nothing is published; draft or unverified records are not substituted. Product, industry, Mastermax, trust, WhatsApp, RFQ, and address content continue to use their established data/configuration sources.

## Responsive behavior

Wide layouts use asymmetry, multi-column editorial blocks, and large visual stages. Tablet layouts reduce the number of columns without changing DOM order. Mobile keeps the same narrative sequence, turns complex compositions into single-column flows, reduces visual-stage height, retains full-width reachable actions, and removes nonessential technical readouts before they create dead space.

Light is the primary composition. Dark mode uses the existing semantic theme tokens and retains the same hierarchy; Mastermax remains an intentional dark contrast section in both themes.

## Validation

Run `pnpm validate:homepage` for section order, content-source, visual-slot, location, CTA, server-rendering, and commerce constraints. Run `pnpm qa:homepage-browser` against a production preview for the two-theme responsive matrix and screenshot evidence.
