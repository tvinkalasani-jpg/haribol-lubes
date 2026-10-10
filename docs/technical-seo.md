# Technical SEO architecture

## Canonical and environment policy

The canonical origin is always `https://haribollubesltd.co.ke`. Canonical helpers discard query strings, fragments, trailing slashes, and alternate hosts. Runtime or local hosts therefore cannot leak into canonical metadata or JSON-LD. URLs use no trailing slash except the root URL. Production infrastructure must permanently redirect HTTP to HTTPS and `www.haribollubesltd.co.ke` to the non-www host.

Indexing is controlled by the explicit server variable `SEO_INDEXING_MODE`. Only the exact value `production` enables indexing. Missing values and every other value produce `noindex, nofollow` metadata and a `Disallow: /` robots policy. Production deployments produce page-specific directives. This avoids hostname guessing and makes preview deployments safe by default.

## Indexability matrix

| Route/type | Decision | Sitemap | Reason |
|---|---:|---:|---|
| `/` | index | yes | Primary company page |
| `/products` | index | yes | Useful catalogue index |
| `/products?...` | noindex, follow | no | Search/filter duplicate; canonical is `/products` |
| Six canonical product categories | index | yes | Stable, useful category content |
| `/products/specialty-fluids` | noindex, follow | no | Retained thin category |
| Draft product details | noindex, follow | no | Records remain draft/unverified |
| `/industries` and nine industry pages | index | yes | Stable industry content |
| `/product-finder` | index | yes | Useful standalone selection tool |
| `/product-finder?...` | noindex, follow | no | Generated state; canonical is the base route |
| `/about` | index | yes | Useful company content |
| `/contact` | index | yes | Useful verified contact/location content |
| `/request-a-quote` and parameters | noindex, follow | no | Transactional conversion route |
| `/insights` | index | yes | Published editorial collection |
| Published, verified, editor-indexable Insight | index | yes | Approved public content |
| Draft/unverified/non-indexable Insight | inaccessible/noindex | no | Publication and verification gates |
| `/resources` | index | yes | Approved resource collection hub |
| Published verified resources | public | represented on hub | File indexing decided per approved document |
| Draft/private resources | inaccessible | no | Access and publication gates |
| `/brands/mastermax` | index | yes | Approved brand overview |
| `/privacy`, `/terms` | noindex, follow | no | Publicly discoverable legal pages with little search value |
| `/applications` | noindex, follow | no | Placeholder route |
| `/design-system` | noindex, follow | no | Development reference |
| `/admin`, `/api`, preview routes | blocked | no | System/private surface |
| `/cart`, `/checkout` | nonexistent and blocked | no | Commerce remains disabled |
| 404 | noindex | no | Correct 404 response with recovery links |

UTM parameters retain the clean canonical. Product, Finder, and any future Insight query filters must use `noindex, follow`; they remain crawlable so crawlers can see that directive. No query combination is emitted in the sitemap.

## Robots and sitemap

`src/app/robots.ts` emits a normal production policy and advertises the production sitemap. It blocks admin, API, preview, design-system, cart, and checkout paths. Robots is crawl guidance, not access control; Payload access rules still protect private records.

`src/app/sitemap.ts` is a single dynamic sitemap cached for one hour. It includes approved static routes, canonical categories, all industry pages, and only public Insights whose editor-controlled SEO setting is indexable. It excludes draft products, filters, RFQ, legal pages, redirects, system routes, and disabled commerce. Insight changes and deletion revalidate `/sitemap.xml`; the one-hour cache is a fallback. Static routes omit unreliable `lastmod`, while Insights use their real `updatedAt` value. Split sitemap indexes can be added when the catalogue becomes materially larger.

## Structured data

Reusable helpers in `src/lib/seo/structured-data.tsx` build trusted server-side JSON-LD and escape `<` before rendering. Stable IDs connect `Organization`, `WebSite`, and page nodes. Page graphs use only the nodes that fit visible content:

- Homepage: `Organization`, `WebSite`, and `WebPage`.
- About and Contact: `AboutPage` or `ContactPage` plus the visible breadcrumb.
- Products, canonical categories, Insights, and Resources: `CollectionPage` plus visible breadcrumbs.
- Industry pages and Product Finder: `WebPage` plus visible breadcrumbs.
- Published Insights: `WebPage`, `Article`, and the visible breadcrumb.

Organization data contains the legal and short name, canonical URL, verified WhatsApp number as `telephone`, and the verified Mlolongo `PostalAddress`. It does not assign a speculative ContactPoint role. Public email, business hours, postal code, coordinates, ratings, founding date, and employee count are omitted. Valid configured social URLs automatically populate `sameAs`; empty values emit no property. There is no `SearchAction` because the catalogue filters are not a general site-search endpoint.

Draft/non-indexable products emit no Product JSON-LD. The Product helper also returns nothing for the current draft page data. Offer markup remains suppressed while commerce is disabled and until price, currency, availability, and identifiers are verified. Mastermax may appear as `brand`; Haribol is not described as the manufacturer. Resources use only the hub `CollectionPage`; no `DigitalDocument` is emitted without an approved file.

## Metadata, links, headings, and images

The shared metadata helper provides unique page titles/descriptions, production canonicals, Open Graph defaults, and a conservative Twitter summary card without inventing an image. Published Insights prefer editor SEO fields, then the excerpt. Article pages use Open Graph `article`. HTML remains `lang="en"`; no hreflang or inactive East Africa market pages are emitted.

Core templates have one H1 and linked H2/H3 sections. Important navigation uses real `<a href>` output through Next Link. The production crawl checks headings, broken links, redirects, duplicate metadata, canonical integrity, and JSON-LD parsing. Meaningful images retain descriptive alt text and dimensions through `next/image`; decorative visuals remain hidden. Barlow Condensed and Manrope continue through `next/font` with `display: swap`, and existing responsive image sizing limits layout shift.

## Redirects and errors

The legacy category paths `/products/gear-oils` and `/products/transmission-fluids` return a single permanent redirect to `/products/transmission-gear-oils`. Redirect destinations are canonical and no redirect URL appears in the sitemap. The website-group not-found page returns HTTP 404, carries noindex metadata, respects both themes, and links to Products, Product Finder, and Contact.

## Resource and PDF policy

Only published, verified resources can appear publicly. Approved public TDS/SDS files may be indexable when they provide search value. Private or unapproved files must stay access-controlled and should receive `X-Robots-Tag: noindex` if they ever have an externally reachable response. The application does not apply X-Robots-Tag to all PDFs because approved technical documents may be useful search assets.

## Validation and launch

Run `pnpm validate:seo` for deterministic helper and policy checks. Against a production build running locally with `SEO_INDEXING_MODE=production`, run `pnpm crawl:seo`; the crawler validates every sitemap URL and follows public internal links without adding a crawler dependency.

After deployment:

1. Confirm the HTTPS and www redirects are permanent and single-hop.
2. Verify the Google Search Console domain property.
3. Submit `https://haribollubesltd.co.ke/sitemap.xml`.
4. Inspect the homepage, each key category, Insights index, and a published Insight.
5. Monitor indexing exclusions and Core Web Vitals.
6. Optionally submit the same sitemap to Bing Webmaster Tools.

No Search Console, Bing, analytics, or external SEO credentials are configured in this phase. Country pages and hreflang for Uganda, Tanzania, and Rwanda wait until those markets have verified operations and unique useful content.
