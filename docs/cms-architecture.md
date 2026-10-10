# CMS and production data architecture

## Compatibility decision

Phase 25 uses Payload 3.89.0 in the existing Next.js application. Payload officially supports Node 20.9 or newer, pnpm, and Next.js 16.2.6 or newer. The project uses Node 24, pnpm 11, Next.js 16.3.6, React 19.3 and TypeScript 5.9, so no framework downgrade or major upgrade is required. Every `payload` and `@payloadcms/*` package is pinned to the same version.

## Boundaries

Payload manages catalogue records, assets, technical documents, publication/verification metadata, users and enquiries. Code continues to own design tokens, layouts, routing, validation enums, search/Product Finder algorithms, RFQ workflow ordering, access-control rules, industries and critical contact configuration.

The public application does not import Payload document shapes. The flow is:

`Payload Local API → PayloadCatalogueRepository → CMS domain mapper → CatalogueSnapshot → domain selectors/components`

The existing structured TypeScript catalogue remains the transition baseline and default runtime source.

## Collections

- **Users**: authenticated administrators and editors. Administrators manage users; editors manage catalogue content.
- **Brands**: identity, lifecycle, type, media, accent, notes and verification. Mastermax is seedable; Simba is not activated or seeded.
- **Product Categories**: hierarchical categories with stable canonical slugs, ordering, SEO, publication and verification.
- **Products**: normalized product families, relationships, descriptions, applications, classifications, public catalogue fields, media/documents, markets, SEO and review state.
- **Product Variants**: separate records for scale, SKU uniqueness, packaging, future stock/pricing references, RFQ references and filtering. No fake packs, SKUs, prices or stock are seeded.
- **Applications**: the existing application registry.
- **Specifications**: classification records that distinguish API, GL, Dexron, TO-4, MT-1, viscosity/grade, OEM approval and other classifications. A catalogue classification is not treated as an approval.
- **Markets**: Kenya active; Uganda, Tanzania and Rwanda planned.
- **Media**: public-facing image/non-technical resource metadata with alternative text, caption, source and verification state. It uses local disk in development and Railway Object Storage through Payload in staging/production.
- **Private Document Files**: PDF-only uploads with private collection access, independent verification and a separate Railway bucket.
- **Technical Documents**: TDS, SDS, certificate, brochure, approval and other records linked to Private Document Files, products and markets. No fake files are seeded.
- **Enquiries**: private RFQ records compatible with the Phase 23 server model.

Industries remain typed code data during this transition because Phase 21 content is stable and migrating it would not improve Phase 25 safety. Phone, public email, WhatsApp, verified business address, social links, currency and the commerce flag remain in `siteConfig` and environment configuration so critical business configuration does not depend on CMS availability. The RFQ notification recipient is a separate server environment value.

## Publication and verification

`publicationStatus` is `draft`, `published` or `archived`. `verificationStatus` is `verified`, `catalogue-derived`, `needs-review`, `unverified` or `deprecated`. They remain independent. Seeded products are draft and non-indexable even when their source state is catalogue-derived.

Payload versions retain up to 50 revisions per content record. Draft-mode is deliberately not duplicated because the explicit publication field is the domain control used during migration.

## SEO

Reusable SEO fields provide meta title, description, canonical override, indexability and Open Graph media. Search keywords remain a separate internal catalogue field. Existing routes and slugs remain canonical.

## Local database setup

`compose.yaml` runs PostgreSQL only; the Next.js app remains on the host.

```bash
docker compose up -d postgres
```

Copy `.env.example` to `.env.local`, use the documented local connection URL, and generate a unique development `PAYLOAD_SECRET` of at least 32 characters. Docker is optional: a locally installed PostgreSQL 15+ instance can provide the same `DATABASE_URL`.

Stop without removing data:

```bash
docker compose stop postgres
```

`docker compose down -v` permanently removes the local database volume and must only be used when a deliberate reset is required.

## Migrations

Local schema iteration may use Payload's development push mode. Before sharing or deploying a schema change:

```bash
pnpm cms:migrate:create descriptive-name
pnpm cms:migrate:status
pnpm cms:migrate
```

Migration files belong in `src/migrations` and must be committed. Production should run `pnpm cms:migrate` as a release step before application traffic. `payload migrate:down` can roll back the latest batch, but data-destructive reversals require a verified backup and review.

## Seed and admin bootstrap

With the database migrated, run:

```bash
pnpm cms:seed
```

The repeatable upsert seed creates Mastermax, nine category records preserving the six principal public groups plus supporting child/future routes, 10 products, 21 variants, applications, specifications and four markets. Products remain draft and non-indexable. Set `PAYLOAD_SEED_ADMIN_EMAIL`, `PAYLOAD_SEED_ADMIN_PASSWORD` and optionally `PAYLOAD_SEED_ADMIN_NAME` only in the local environment to bootstrap a development administrator. No credentials are committed. Production administrators must use unique deployment-managed values before `/admin` is exposed.

## Static-to-CMS transition

`CATALOGUE_DATA_SOURCE=static` is the default. `cms` is explicit and fails if database or secret configuration is absent. There is no hidden production fallback. Phase 25 provides the repository and mapper; public components retain the stable static source until a later controlled page-by-page cutover.

## RFQ persistence

`RFQ_REPOSITORY=filesystem` retains local development and existing tests. `payload` uses PostgreSQL through Payload Local API. Production defaults to Payload and rejects filesystem persistence. The public route still performs validate → anti-spam/rate check → store → notify → result. Unique database fields protect the idempotency key and reference number; notifier failure updates status without deleting the stored enquiry.

Enquiries have no public CRUD access. Only administrators may read/update/delete them in admin. Public submissions continue through `/api/enquiries/rfq`; Local API calls use server-only imports and access override inside the controlled repository.

The existing in-memory limiter remains insufficient for multiple application instances. A shared limiter is still required in a later infrastructure/security phase.

## Media and Railway Object Storage

Development files use the ignored local `media/` and `private-documents/` directories. Staging and production select the official Payload 3.89 S3 adapter with `MEDIA_STORAGE_PROVIDER=railway-s3`. Railway buckets are private: verified public Media is proxied through Payload, and technical PDFs are fetched only by the controlled Resource route after all publication and verification checks pass.

## Production requirements

- managed PostgreSQL with backups, TLS and restricted credentials
- a unique 32+ character `PAYLOAD_SECRET`
- applied and reviewed migrations
- an explicitly bootstrapped administrator
- `CATALOGUE_DATA_SOURCE=cms` only after parity acceptance
- `RFQ_REPOSITORY=payload`
- durable object storage before production media use
- a shared rate limiter for multi-instance deployment
- monitoring, email notification provider and secret rotation in their later phases
