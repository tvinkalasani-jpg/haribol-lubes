# Production infrastructure

Status: **code complete; live verification pending**. The Railway project, staging service, PostgreSQL service and two storage buckets exist. This repository does not contain or expose their credentials. Storage uploads, migrations, administrator bootstrap and Resend delivery remain unverified until recorded against staging.

## Platform decision

Use Railway for the Next.js 16/Payload 3.89 application and managed PostgreSQL. It provides a persistent Node process, private service networking, PostgreSQL, environment-scoped variables, pre-deploy commands, deployment health checks and application rollback. This fits Payload server routes, the Admin application, database migrations and future webhooks better than a function-first deployment. Railway should run `pnpm cms:migrate` as a pre-deploy command and `pnpm start` as the application command. A failed migration must stop deployment before traffic moves.

Vercel was not selected because this application combines Payload Admin, uploads, migrations and database-backed server routes in one persistent service. Fly.io and Render can run the workload, but would add more infrastructure ownership without a demonstrated project requirement. Railway Object Storage is the selected S3-compatible object-storage provider so staging can keep the application, PostgreSQL and object storage in one platform.

Provider references used for this decision:

- Railway Next.js and PostgreSQL: https://docs.railway.com/guides/nextjs
- Railway pre-deploy commands: https://docs.railway.com/deployments/pre-deploy-command
- Railway PostgreSQL and SSL: https://docs.railway.com/databases/postgresql
- Railway backup and restore guide: https://docs.railway.com/guides/postgres-backups-restores
- Payload S3 storage adapter: https://payloadcms.com/docs/upload/storage-adapters
- Resend email API: https://resend.com/docs/api-reference/emails/send-email

## Environment separation

Development, staging and production use separate databases, Payload secrets, Railway object-storage buckets and credentials, Resend API keys, readiness tokens and admin credentials. Staging must not receive any production database or storage variable. `DEPLOYMENT_ENVIRONMENT=staging` activates fail-closed HTTP Basic authentication. `.env.staging.example` and `.env.production.example` list names only.

## Managed PostgreSQL

Create a dedicated Railway project environment named `staging` and a PostgreSQL service in that environment. The application should use a least-privilege application role through Railway private networking. `DATABASE_URL` must require TLS (`sslmode=require`, or stronger certificate verification when the provider supplies a CA). Do not use the public TCP endpoint at runtime.

Payload's PostgreSQL adapter owns the application pool. Start with one application replica and the provider's documented connection limit. Set a conservative pool limit in the adapter once the selected Railway database size and limit are known. Add PgBouncer before horizontal scaling or if observed connection use approaches the provider limit. The repository intentionally does not guess a pool size.

### Migration procedure

1. Confirm a current database backup and record its timestamp.
2. Review pending committed migrations with `pnpm cms:migrate:status`.
3. Run `pnpm cms:migrate` in Railway's pre-deploy container. Never use schema push in staging or production.
4. Start the new application deployment only after migration exit code 0.
5. Verify `/api/health`, protected `/api/readiness`, Admin login, catalogue reads and one synthetic enquiry.
6. If application behavior fails, roll the application back. If the schema is incompatible, run a reviewed down migration only when it is demonstrably data-safe; otherwise restore the backup or PITR fork and cut over.

Phase 30 adds `20261005_120000_phase30_return_insight_to_draft`, which removes publication and indexability from the test Insight. Local SQL execution and content validation confirm the intended state. It still must run through Payload's migration command against managed staging.

Phase 30B adds `20261010_124616_phase30b_railway_storage`, which creates the private upload collection, adds the Media prefix field and moves the Technical Document file relationship to the private collection. It fails before changing constraints if existing Technical Documents still reference Media, because their database records and objects require an explicit reviewed migration. No Railway migration is claimed until the pre-deploy command records success.

### Backups

Enable daily Railway volume backups, an appropriate weekly/monthly schedule, and PITR before staging validation. Create a manual snapshot before migrations. Perform a logical `pg_dump` and restore it into a scratch database, compare key row counts, then delete the scratch database. Record the backup time, restore start/end, restored database identity and checks. The staging database exists, but no managed backup or restore evidence is available in this repository; `BACKUP_RESTORE_TESTED` must remain `false` until the drill is recorded.

## Payload secret and administrator bootstrap

Generate the staging secret in the provider secret manager and never print it. The staging checker requires at least 32 characters. Create the first administrator in a one-time deployment/run with `ADMIN_BOOTSTRAP_MODE=bootstrap` and temporary `PAYLOAD_SEED_ADMIN_*` variables. Run `pnpm cms:seed`, verify login and roles, then remove all seed variables and set `ADMIN_BOOTSTRAP_MODE=complete`. Runtime registration remains closed. Admin login uses five attempts, a ten-minute lock and an eight-hour token lifetime.

## Object storage

Use two dedicated Railway Object Storage buckets through its S3-compatible API:

- Public CMS media: approved images and non-technical public resources stored in the media bucket. Railway buckets are private, so Payload proxies these objects through its same-origin, access-checked media route. Verified media can be read publicly; unverified media cannot.
- Private documents: technical PDFs stored in the separate `private-documents` collection and bucket. The collection has no anonymous read access. The resource-file route retrieves an object server-side only after the Resource, Technical Document and private file all pass their publication/verification gates.

Use Railway bucket-scoped S3-compatible credentials and keep access keys and secrets server-only. Current Railway buckets use virtual-hosted addressing, so `S3_FORCE_PATH_STYLE=false`; older buckets may require `true`, and the bucket Credentials tab is authoritative. The same explicit switch is applied to both configured buckets. The private bucket must never be made anonymously readable.

`@payloadcms/storage-s3` 3.89 is installed and enabled only when `MEDIA_STORAGE_PROVIDER=railway-s3`. Local development keeps ignored `media/` and `private-documents/` directories. The adapter disables local file writes when enabled and throws upload errors back through the Payload operation, preventing a failed object write from being reported as a successful CMS save.

Required live storage test: upload a synthetic raster image with alt text, verify the object and same-origin Payload URL/cache headers, render it, delete it and verify deletion. Upload a synthetic draft PDF to the private collection, verify anonymous collection and predictable bucket access are denied, publish only after verification, test the controlled Resource route, revoke/delete it, and simulate invalid credentials to confirm no successful upload record remains.

## Transactional email

Resend is the single selected provider. The RFQ route chooses a Resend notifier only when `EMAIL_PROVIDER=resend`, an API key, a verified sender and a valid recipient are present. It sends plain text, uses the configured sender, adds a validated user address as Reply-To, includes the RFQ reference and never turns user text into HTML. The submission remains `STORE → NOTIFY`; provider failure sets notification status to `failed` while preserving the enquiry.

`RFQ_NOTIFICATION_EMAIL` remains `info@mastermax.co.ke`. `EMAIL_FROM` must remain empty until a real sender or domain is created and verified. Configure Resend SPF/DKIM exactly as Resend supplies, then publish a DMARC policy agreed with the domain owner. Do not claim DMARC alignment or inbox delivery before DNS and receipt tests succeed. The Contact form remains intentionally non-sending.

## Staging security and indexing

Use a Railway-generated non-production HTTPS hostname until a staging subdomain is approved. Set `STAGING_URL` and `NEXT_PUBLIC_SITE_URL` to that hostname. `DEPLOYMENT_ENVIRONMENT=staging` makes every application route except minimal health and token-protected readiness require HTTP Basic authentication. Missing access credentials fail closed.

Set `SEO_INDEXING_MODE=staging`. Staging responses include `X-Robots-Tag: noindex, nofollow, noarchive`, page metadata is noindex/nofollow, `robots.txt` disallows all crawlers and `sitemap.xml` is empty. Public-page canonical URLs deliberately remain on `https://haribollubesltd.co.ke`. Admin and API routes remain noindex. Verify all behavior from the actual HTTPS response, not environment settings alone.

The public health endpoint returns only `{ "status": "ok" }`. `/api/readiness` requires a unique 32+ character bearer token and checks database access without returning database details, counts or secrets. Configure Railway's public health check to `/api/health`; use protected readiness only for authorized operations.

## Monitoring and logging

Use Railway deployment logs and built-in health checks for staging. Sentry remains uninstalled because no DSN was supplied and it does not block staging. Logs contain safe RFQ references and status values; they do not log request bodies, contact fields, credentials or provider response bodies. Add an external production uptime monitor after a production hostname exists.

## Rollback

Application rollback uses Railway's previous successful deployment. Database rollback is separate: prefer forward fixes for additive migrations, and use a reviewed down migration only when safe. Restore a snapshot/PITR fork for destructive or uncertain data changes, verify it, then change the application connection. Email configuration rolls back by restoring the prior environment variable set; stored failed enquiries remain retryable.

## DNS cutover plan

Do not change live DNS in staging. Production cutover later requires the root record, a deliberate `www` redirect, provider domain verification, TLS issuance, Resend DKIM/SPF records and an approved DMARC policy. Lower TTL before the scheduled cutover and retain a rollback record. Search Console and Google Business Profile remain outside Phase 30.

## Launch blockers

**Blockers:** successful committed migrations; provider backups and restore drill; completed admin bootstrap; successful live upload/read/delete/failure tests for both Railway buckets; verified Resend sender/token and received RFQ test; shared rate limiter implementation; authenticated HTTPS staging crawl.

**High priority:** staging Lighthouse/TTFB/database/media latency measurements; browser CSP review across public and Admin routes; DNS/email alignment review; privacy and terms legal review.

**Optional post-launch:** Sentry, external uptime service and analytics after consent approval. Commerce and payments remain disabled.

Production status is **NO-GO**. Staging deployment is also blocked until the external services above are supplied and live-tested.
