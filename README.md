# Haribol Lubes website

Haribol Lubes Limited website with a structured static catalogue, Payload CMS/PostgreSQL foundation, RFQ workflow and transition-safe public pages.

## Requirements

- Node.js 20.9 or newer
- pnpm 11

## Installation

```bash
pnpm install
```

Copy `.env.example` to `.env.local`. Static catalogue development does not require a database. Payload admin, CMS catalogue reads and database-backed RFQs require PostgreSQL plus `DATABASE_URL` and a 32+ character `PAYLOAD_SECRET`.

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification commands

```bash
pnpm lint
pnpm type-check
pnpm build
pnpm validate:catalogue
pnpm validate:cms
pnpm validate:rfq
pnpm validate:whatsapp
```

To run the production build locally:

```bash
pnpm start
```

## Folder structure

```text
src/
├── app/
│   ├── (website)/       Public App Router pages
│   ├── (payload)/       Payload admin and guarded REST routes
│   └── api/             Server route handlers
├── cms/                 Collection schemas, access rules, field groups and environment guards
├── components/
│   ├── layout/          Global navigation, footer, and route placeholders
│   └── ui/              Reusable design-system components
├── config/              Central business and site configuration
├── data/                Structured static catalogue and website data
├── features/            Domain repositories, adapters, search and enquiry services
├── lib/
│   └── seo/             Basic metadata and canonical URL helpers
└── styles/              Global styles, Tailwind import, and design tokens

public/
├── brand/               Future approved brand assets
├── icons/               Future static icons
└── images/              Future static images

docs/                    Project documentation
```

Feature folders for the catalogue, enquiries, forms, products, WhatsApp integration, validation, hooks, and shared types will be added only when those features are implemented. This avoids maintaining empty scaffolding.

## Environment variables

`.env.example` documents configuration without containing secrets. Use `.env.local` for local values and never commit it. `CATALOGUE_DATA_SOURCE=static` preserves the current public runtime. See `docs/cms-architecture.md` for PostgreSQL, migrations, seeding, admin bootstrap and the explicit CMS transition.

Payload admin uses `/admin` only when the database and a strong Payload secret are configured. With CMS configuration absent, the admin route is unavailable and Payload REST returns a clear 503 response.

## Route organisation

Public pages live inside the `src/app/(website)` route group. The parentheses keep the group name out of public URLs while allowing public website routes to remain organised separately from future application areas.

Current public routes:

- `/`
- `/products`
- `/industries`
- `/applications`
- `/resources`
- `/insights`
- `/about`
- `/request-a-quote`
- `/contact`

The development-only design-system specimen is available at `/design-system`. It is marked `noindex, nofollow` and demonstrates the current tokens, typography, controls, cards, forms, containers, grids, spacing, borders, and surfaces.

The global header includes a sticky transparent-to-elevated scroll state, an accessible desktop Products dropdown, and an accessible full-screen mobile navigation panel. Product category links currently point to placeholder anchors on `/products` until catalogue routes are defined.

The development-only health endpoint is available at `/api/health`.
