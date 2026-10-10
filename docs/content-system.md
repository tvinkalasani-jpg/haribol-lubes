# Insights and resources content system

## Content architecture

Phase 26 adds two CMS-first content types. `Insights` owns editorial articles. `Resources` is a lightweight public-presentation record that points to one file source. No article content is duplicated in source code and no file is duplicated between Resources and Technical Documents.

`Technical Documents` remains the authoritative record for TDS, SDS, certificates, approvals and controlled technical files. A Resource that presents one of these files links to that record. A non-technical brochure or guide may instead link directly to a Media record. A Resource must use exactly one of those sources.

Industries are still code-managed in the existing site architecture, so the insight editor uses the same controlled industry slugs. Products, categories, applications, resources, brands and markets use Payload relationships.

## Publication and verification

Publication and verification have separate jobs:

- `draft`, `published` and `archived` control public visibility.
- `verified`, `catalogue-derived`, `needs-review`, `unverified` and `deprecated` describe review state.

Only published Insights resolve through the public access policy. Draft and archived records return no public result. A technically sensitive Insight cannot be saved as published unless its verification status is `verified`. General business content may be published without that extra technical gate, though editorial review still applies.

Resources and Technical Documents have a stricter rule: public records must be both `published` and `verified`. The resource file endpoint repeats these checks before reading a file. Editors and administrators can manage content; anonymous users cannot create, edit or delete it.

The admin help text states:

- Publication Status: “Controls whether the article is visible publicly.”
- Verification Status: “Indicates whether technical statements have been reviewed.”

## Categories, tags and bylines

Insight categories are a controlled enum with seven values: Lubricant Basics, Automotive, Industrial, Maintenance, Product Selection, Technical Guides, and Business & Procurement. This keeps navigation stable and avoids an unnecessary taxonomy collection.

Tags are optional editorial metadata. They help deterministic related-content scoring but do not create public tag routes or indexable facets.

The byline is editable plain text and defaults to `Haribol Lubes Limited`. No named staff or technical experts are invented.

## Rich text

The article body uses Payload Lexical with a deliberately limited feature set:

- paragraphs;
- H2, H3 and H4 headings;
- bold, italic and underline;
- ordered and unordered lists;
- links;
- blockquotes, styled as technical notes;
- Payload Media uploads;
- fixed and inline editor toolbars.

The page template owns the single H1. The editor cannot add H1 headings. Raw HTML, scripts, iframes and third-party embeds are not enabled. Tables are deferred because the current experimental table feature does not provide the caption workflow required for consistently accessible technical tables.

Public pages render Lexical on the server through a shared renderer. Reading time is derived from plain text at 220 words per minute and cannot be entered manually.

## Public experience and internal linking

`/insights` has an editorial hero, optional featured position, latest content, controlled knowledge areas, resources and Product Finder pathways, and a restrained contact call to action. The layout remains intentional when no featured article exists or no articles are public.

`/insights/[slug]` includes breadcrumbs, category, H1, excerpt, publication date, company byline, derived reading time, optional hero media, semantic article body, concise contextual relationships, related insights and one context-aware call to action.

Related insights use deterministic scoring in this order: same category, shared products, shared applications, shared industries and shared tags. The current article is excluded and results are limited to three. Product links use their category route. Application links enter Product Finder with the selected application. Industries use their existing route.

`/resources` presents approved resources when they exist. With zero approved records it displays: “Approved technical documents and product resources will appear here as they become available.” It then offers links to Products, Product Finder, Contact and Request a Quote. It never renders fake or disabled download controls.

## SEO and canonicals

Insights reuse the shared SEO group: meta title, meta description, canonical override, indexability and Open Graph image. Editor-supplied metadata takes priority; otherwise the title and excerpt provide the page metadata. The default canonical is `/insights/[slug]`. Category query strings are presentation controls only and do not create canonical pages. Publication access remains authoritative even when an editor marks a draft as indexable.

Phase 26 does not add advanced structured data, automated SEO pages or mass-generated articles. Those belong to the reviewed Phase 27 scope.

## Caching and revalidation

Public Insight and Resource queries use the Next.js server cache with a one-hour revalidation window. Payload after-change and after-delete hooks revalidate the index and affected article route so publication changes normally appear immediately. The hooks contain cache invalidation only; publication rules remain explicit collection hooks and access policies.

If `DATABASE_URL` and a 32-character `PAYLOAD_SECRET` are absent, public content queries return an intentional empty state. This keeps static validation safe while making configured deployments CMS-first.

## Preview decision

Authenticated draft preview is prepared by keeping article rendering and mapping reusable, but a preview URL is deferred. A secure preview requires a signed, short-lived preview entry point and authenticated Payload session handoff; exposing drafts through a query string would violate the privacy rule. Drafts remain inaccessible to anonymous visitors in this phase.

## Media and file privacy

Development uploads stay on local disk. Media itself remains editor-only. Public files are served through `/api/resources/[slug]/file`, which first resolves a published and verified Resource, then verifies any referenced Technical Document and Media record. Responses use `nosniff` and open PDFs inline.

Local filesystem storage is not a complete production asset architecture. A file that has already been copied into a separately configured public static directory or exposed by infrastructure outside the application cannot be made private by hiding its link. Keep unapproved files out of public storage. Production still requires private object storage such as R2 with application-controlled or signed delivery; R2 is deliberately not configured in Phase 26.

## Seed strategy

The seed is slug-based and repeatable. It creates at most five articles:

1. Understanding SAE Viscosity Grades — published and verified solely to exercise the complete public path with conservative, general educational copy.
2. Understanding API Engine-Oil Classifications — draft, needs review.
3. GL-4 vs GL-5: Understanding Gear-Oil Classifications — draft, needs review.
4. What ISO VG Numbers Mean in Hydraulic Oils — draft, needs review.
5. TDS vs SDS: What Each Document Is Used For — draft, needs review.

No resources, technical files, named experts, approvals, compatibility guarantees, drain intervals, fuel-economy claims or vehicle-specific recommendations are seeded. The published test article can be returned to draft before production launch if Haribol has not approved it.

## Future content and Phase 27 boundary

Future SEO work should begin with editorial governance, keyword-to-intent mapping, duplicate-content controls, structured data design, XML sitemap and robots policy, and technical validation of canonical/index rules. It should build on reviewed articles and approved product data rather than generating city pages, thin FAQs or bulk keyword pages. Phase 26 does not perform that work.
