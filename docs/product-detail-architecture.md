# Product detail architecture

Phase 31H redesigns the public product-detail presentation while preserving the catalogue, enquiry, CMS and dormant-commerce boundaries established in earlier phases.

## Route and rendering model

- Product detail URLs remain `/products/[category]/[product]`.
- The route loads a `ProductPageData` view model and renders `ProductDetailPage` as a server component.
- The page introduces no product-detail client controller. Formulation navigation uses native fragment links, related products use ordinary links, and theme/header interactions remain owned by their existing shared components.
- Product, variant, specification, application, industry, document and related-product relationships remain data driven. The presentation does not infer compatibility, approvals, packs or claims that are absent from the catalogue.

## Information hierarchy

The page is ordered for technical discovery:

1. Breadcrumbs preserve category context.
2. The hero pairs the best available catalogue visual with product identity, verified catalogue facts and enquiry actions.
3. The technical table presents only populated catalogue fields.
4. Applications and industries expose existing catalogue relationships and Product Finder pathways.
5. Variant cards expose recorded grades, classifications and packs without adding price or availability claims.
6. Product information, conditional resources, a verification notice and related products support evaluation.
7. The final RFQ section closes the page with the primary commercial action.

Products with limited content use the same hierarchy but omit empty variant and resource sections. Missing imagery falls back to a neutral technical illustration; it does not simulate a photographed product or imply an exact pack.

## Product and variant distinction

The product remains the stable catalogue entity and URL. Variants remain children of that product. They are navigable within the page by deterministic fragment IDs and retain their current fields, relationships and verification status. No variant creates an independent purchasable offer in the public UI.

## Technical documents

Document links render only when the product has a recorded document. Empty document collections produce no placeholder download UI. The existing controlled-document route and private storage model remain the future delivery boundary; Phase 31H does not make private files public or change storage configuration.

## Enquiry pathways

`Request a Quote` remains the primary call to action and uses the existing product-prefilled RFQ URL. WhatsApp remains a contextual secondary action and includes the current product name and canonical URL through the shared WhatsApp component. Phase 31H does not change either API contract, validation, persistence or notification behavior.

## Dormant commerce boundary

Commerce remains disabled by `siteConfig.features.commerceEnabled`. The route continues to receive its optional storefront slot from the existing disabled/enabled module alias, so no pricing, stock, cart, checkout, payment or offer UI enters the current build. The product-detail design reserves no misleading empty price or purchase area. A future commerce phase can activate the existing offer and storefront boundary after verified commercial data and payment services are approved.

Product structured data remains limited to the established non-commerce behavior. No `Offer`, price, stock or availability claim is emitted while commerce is disabled.

## Themes, accessibility and responsive behavior

All surfaces use the shared semantic design tokens in Light and Dark themes. Semantic headings, definition lists, a real specification table, labelled navigation, visible focus states and native links preserve keyboard and assistive-technology access. On narrow screens the table becomes labelled block rows, hero actions become full width and grids collapse without horizontal scrolling. Product imagery keeps its intrinsic proportions and uses responsive Next.js image sizing.

Motion is limited to restrained CSS hover/focus transitions. Coarse pointers and reduced-motion preferences remove the lift effects. No 3D, animation library or product-detail JavaScript bundle was added.

## Validation evidence

Phase 31H evidence is stored in `docs/phase-31h/`:

- `browser-validation.json` records both product shapes across Light and Dark themes at 320, 390, 480, 768, 900, 1024, 1120, 1280, 1440 and 1920 pixels.
- Eight review screenshots cover desktop, mobile, both themes, multi-variant, technical specification, final RFQ and limited-content states.
- `transfer-report.json` records production transfer behavior.
- `lighthouse/summary.json` records three mobile-profile Lighthouse passes per theme and their medians.

The final production measurements recorded a Light median of 95 Performance, 100 Accessibility, 100 Best Practices and 69 SEO, with 1,042 ms LCP, 266 ms TBT and 0 CLS. Dark recorded 96 Performance, 100 Accessibility, 100 Best Practices and 69 SEO, with 1,008 ms LCP, 210 ms TBT and 0 CLS. The SEO result reflects the deliberate draft/noindex state of the current catalogue rather than a missing metadata implementation.

With browser cache disabled, the audited product page transferred 15,853 bytes for its document, 155,427 bytes across eight initial script requests and 32,460 bytes for one initial product image. Scrolling to the formulation section caused no further requests.
