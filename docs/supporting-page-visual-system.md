# Supporting-page visual system

Phase 31I aligns Industries, About, Contact, Product Finder, Resources, Insights and RFQ with the Light-first industrial system established in Phases 31A–31H.

## Shared introduction pattern

Product Finder, Resources and Insights use `SupportingPageHero`, a server-rendered introduction with breadcrumbs, editorial title and copy, a page-specific technical diagram and factual reference rows. Its variants change the diagram geometry without changing information hierarchy. Industries, About, Contact and RFQ retain purpose-built heroes because their sector, company, location and form contexts require different compositions.

## Industries

The index remains a numbered sector directory rather than an equal-card grid. All nine approved industries come from `src/data/industries.ts`. Detail pages use the existing industry record to derive requirement points, categories, explicitly related products, applications and related sectors. Category links are starting points and do not assert equipment compatibility. Product Finder, RFQ, WhatsApp and Contact provide distinct selection and commercial pathways.

## Company and contact pages

About presents the verified company role, current catalogue focus, Mastermax relationship and Mlolongo operating base without adding age, scale, certification or leadership claims. Contact separates quotation, selection, technical, commercial and general pathways; direct methods render only when configured. The displayed address and Maps destination continue to come from central site configuration.

## Product Finder

The finder retains its existing client-side decision logic, query-state model and catalogue dataset. The presentation frames the four-step workflow as technical decision support, preserves selected states and live-result announcements, and repeats that compatibility is not confirmed by the tool.

## Resources and Insights

Both pages continue to query Payload through the public content repository with access control enabled. Resources expose only controlled download URLs and retain the approved empty state. Insights retain reviewed publication and technical-verification gates, featured/latest hierarchy and existing metadata only.

## RFQ

RFQ remains a structured commercial enquiry. Phase 31I preserves all fields, validation, honeypot, consent, idempotency, product and industry prefill, STORE → NOTIFY processing and success/error handling. Its existing purpose-built hero, contextual strip and grouped form remain the presentation boundary.

## Accessibility, responsive behavior and performance

The supporting hero uses semantic headings and breadcrumbs, high-contrast tokenized surfaces and no client component. Existing forms retain labels and error associations. Layouts collapse at narrow widths without horizontal overflow; interactive targets and focus states remain visible. Visuals are CSS and SVG-like geometry, with no runtime, carousel, video or new dependency.

## Business and commerce safeguards

Physical location remains Emerald Business Park, Kutch Rd, Mlolongo, Kenya. Public contact methods remain conditional. No price, stock, cart, purchase, promotion or payment language is introduced, and commerce remains disabled. No customer, certification, delivery, market-leadership or compatibility claim is added.

Validation evidence, screenshots and Lighthouse reports are stored in `docs/phase-31i/`.
