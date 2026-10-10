# Product data model

Phase 15 introduces a TypeScript catalogue model for Haribol Lubes Limited. It is deliberately independent of a database or CMS and preserves the supplied catalogue as `catalogue-derived` source material rather than verified technical data.

## 1. Product and ProductVariant

`Product` is the stable, product-page-level entity. It owns the brand, category, descriptive content, application and industry relationships, technical references, documents, images, market availability, SEO fields and publication state.

`ProductVariant` represents a selectable formulation or packaging/SKU option beneath a product. Its `kind` distinguishes `formulation`, `packaging` and `formulation-and-packaging`. The current catalogue supplies formulations and grades but not reliable SKUs or pack sizes, so the first migration creates formulation variants only. Future pack records can add SKU, pack size, unit, container and stock references without creating separate SEO product pages.

## 2. Brand relationship

Products reference `brandId`; they do not repeat brand metadata. `mastermax` is the only supported product brand in the current data and resolves through `src/data/brands.ts`. The provisional Simba coolant entry remains outside `products` until its business relationship is confirmed.

## 3. Category hierarchy

Categories use stable semantic IDs and support an optional `parentCategoryId`. The combined `transmission-gear-oils` category is the parent of the existing public `gear-oils` and `transmission-fluids` routes. Categories also include display order, SEO readiness, verification state and a future CMS ID.

## 4. Applications

Applications are reusable records referenced through `applicationIds`. Only uses supported by current catalogue wording are included: engine types, hydraulic systems, gearboxes, automatic transmissions, driveline systems, compressors, metalworking, mould release, chassis, crushers, bearings and industrial machinery.

## 5. Industries

Products reference the existing industry registry by semantic ID. The industry records now separate stable IDs from two-digit display indexes, preserving the homepage appearance while making cross-record references safe.

## 6. Specifications

Specifications are separate reusable records with a `kind`: performance standard, transmission classification, OEM approval or general technical classification. API and transmission entries from the catalogue are classifications, with `isApproval: false`; no catalogue claim is promoted to an OEM approval. Viscosity remains a verified-value field on products or variants rather than being mixed into the specification registry.

## 7. Verification statuses

The shared statuses are `verified`, `catalogue-derived`, `needs-review`, `unverified` and `deprecated`. Technical values can carry their own status and source reference. Current Mastermax technical content is `catalogue-derived`; Kenyan stock availability and temporary family artwork are `needs-review`.

## 8. Technical properties

`TechnicalProperty` can store property name, method, value, unit, conditions, order, source and verification status. No viscosity measurements, density, flash point, pour point or test methods were populated because they are absent from the supplied structured catalogue data.

## 9. Documents

`TechnicalDocument` supports TDS, SDS, certificate, brochure, approval and other files, with language, version, markets, effective date and verification status. Product document arrays are empty until real files and approved URLs are supplied.

## 10. Images

Images have stable IDs, source, alt text, role, order, source type, verification state and a temporary flag. Catalogue-extracted WebP files are temporary `catalogue-extract` packshots. Industrial-oil and grease records use the neutral project family SVG marked `project-generated`, `needs-review` and temporary.

## 11. Market availability

Markets are independent records. Kenya is active; Uganda, Tanzania and Rwanda are planned reference markets. Products contain market-specific availability records rather than a hard-coded country field. Current Kenyan product availability is `needs-confirmation` until Haribol verifies stock and pack sizes.

## 12. SEO fields

Products support title, description, canonical slug, indexability, OpenGraph image and internal keywords. Migrated records are drafts with `indexable: false`; Phase 15 does not generate metadata or product pages.

## 13. Search readiness

Selectors create normalized search documents containing product and brand identity, categories, applications, industries, markets, viscosity grades, specifications, future product codes and keywords. Query helpers can retrieve products by brand, category, application, industry, market or specification. No search interface is included.

## 14. Product Finder readiness

Stable category, application, industry, viscosity, specification and market references give a later Product Finder structured inputs. No suitability rules or recommendation claims are encoded in this phase.

## 15. RFQ readiness

The `RfqProductReference` shape uses `productId`, optional `variantId`, quantity and unit. A family-level enquiry can reference only the product; a grade or future pack-level enquiry can also reference its variant. No RFQ storage or submission logic is included.

## 16. Mastermax catalogue mapping

- Engine Oils: one honest family product with six formulation variants because the source lists grades and performance classifications without unique marketing names.
- Hydraulic Oils: one family product with ISO VG 32, 46 and 68 formulation variants.
- Transmission / Gear Oils: one family product with seven formulation variants. Each variant retains its viscosity and applicable classification separately.
- Maxpress Compressor Oil: one named Maxpress family with 46, 68, 100, 150 and 220 variants. This avoids five near-identical product pages and leaves pack SKUs available beneath each formulation later.
- Industrial Oils: Soluble Cutting Oil and Mould Release Oil are separate product records because the catalogue names distinct products and applications.
- Greases: MP3 Chassis Grease, EP3 Crusher Grease, High-Temperature Bearing Grease and EP00 Liquid Grease are separate product records because their names and uses are distinct.

The legacy `mastermaxCatalogueTaxonomy` is now a compatibility view derived from these product records. This keeps the Phase 11 homepage showcase visually and textually unchanged.

## Open business questions

Before publication, Haribol Lubes Limited should confirm:

1. Product codes, SKUs, available pack sizes and container types for every formulation.
2. Current Kenyan availability and stock status by formulation and pack.
3. Whether Uganda, Tanzania, Rwanda or other markets should become active, and which products are available in each.
4. Official TDS, SDS, certificates, brochures and approved document versions.
5. Whether all catalogue API, GL, Dexron, TO-4 and MT-1 wording remains current and exactly as intended.
6. Whether Maxpress numeric entries are formally ISO viscosity grades; the model currently stores the catalogue numbers without adding `ISO VG`.
7. Base-oil type, measured technical properties, test methods and application limitations.
8. Approved original packshots for every product, especially Industrial Oils and Greases.
9. The ownership or distribution status of Simba coolant products before any Simba product is added.
10. Final product titles, descriptions, benefits, related-product rules and SEO indexability.
