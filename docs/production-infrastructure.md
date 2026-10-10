# Production infrastructure

Status: **prepared, not connected**. Phase 30 did not receive provider accounts, API credentials, a repository connection, or an authenticated deployment CLI. No managed service or public hostname is represented as configured until its live test is recorded.

## Platform decision

Use Railway for the Next.js 16/Payload 3.89 application and managed PostgreSQL. It provides a persistent Node process, private service networking, PostgreSQL, environment-scoped variables, pre-deploy commands, deployment health checks and application rollback. This fits Payload server routes, the Admin application, database migrations and future webhooks better than a function-first deployment. Railway should run `pnpm cms:migrate` as a pre-deploy command and `pnpm start` as the application command. A failed migration must stop deployment before traffic moves.

Vercel was not selected because this application combines Payload Admin, uploads, migrations and database-backed server routes in one persistent service. Fly.io and Render can run the workload, but would add more infrastructure ownership without a demonstrated project requirement. Cloudflare remains the selected object-storage provider rather than the application runtime.

Provider references used for this decision:

- Railway Next.js and PostgreSQL: https://docs.railway.com/guides/nextjs
- Railway pre-deploy commands: https://docs.railway.com/deployments/pre-deploy-command
- Railway PostgreSQL and SSL: https://docs.railway.com/databases/postgresql
- Railway backup and restore guide: https://docs.railway.com/guides/postgres-backups-restores
- Cloudflare R2 public buckets: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Cloudflare R2 presigned URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Postmark send API: https://postmarkapp.com/developer/user-guide/send-email-with-api

## Environment separation

Development, staging and production use separate databases, Payload secrets, R2 buckets, R2 credentials, email server tokens, readiness tokens and admin credentials. Staging must not receive any production database or storage variable. `DEPLOYMENT_ENVIRONMENT=staging` activates fail-closed HTTP Basic authentication. `.env.staging.example` and `.env.production.example` list names only.

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

### Backups

Enable daily Railway volume backups, an appropriate weekly/monthly schedule, and PITR before staging validation. Create a manual snapshot before migrations. Perform a logical `pg_dump` and restore it into a scratch database, compare key row counts, then delete the scratch database. Record the backup time, restore start/end, restored database identity and checks. No managed backup or restore test occurred in Phase 30 because no Railway database exists; `BACKUP_RESTORE_TESTED` must remain `false`.

## Payload secret and administrator bootstrap

Generate the staging secret in the provider secret manager and never print it. The staging checker requires at least 32 characters. Create the first administrator in a one-time deployment/run with `ADMIN_BOOTSTRAP_MODE=bootstrap` and temporary `PAYLOAD_SEED_ADMIN_*` variables. Run `pnpm cms:seed`, verify login and roles, then remove all seed variables and set `ADMIN_BOOTSTRAP_MODE=complete`. Runtime registration remains closed. Admin login uses five attempts, a ten-minute lock and an eight-hour token lifetime.

## Object storage

Use two dedicated staging R2 buckets:

- Public media: approved marketing images and published public resources, exposed through a staging media hostname with explicit cache rules.
- Private documents: drafts, unpublished technical documents and future restricted files. Do not enable public bucket access. Deliver only after an application authorization check, using short-lived presigned GET URLs or an authenticated application stream.

Create bucket-scoped R2 API credentials with only the operations the application needs. Keep account ID, access key and secret server-only. Disable the `r2.dev` URL on the private bucket. A production custom media domain and cache rules are a later DNS cutover task.

The current Payload Media collection stores local files and the R2 adapter has not been installed because no credentials or buckets were available for a working integration test. R2 is therefore a **launch blocker**, not a completed integration. Before enabling staging, implement and test the approved adapter with separate public/private collections or a server-controlled routing layer; the existing single Media collection cannot safely infer privacy from file type alone.

Required live storage test: upload a synthetic raster image with alt text, verify the R2 object and public URL/cache headers, render it, delete it and verify deletion. Upload a synthetic draft PDF to the private path, verify anonymous access is denied, test authenticated/presigned access, revoke/delete it, and simulate an R2 failure to confirm no successful Media record remains.

## Transactional email

Postmark is the single selected provider. It offers per-server credentials, verified sender identities and a straightforward transactional API. The RFQ route now chooses a Postmark notifier only when `EMAIL_PROVIDER=postmark`, a server token, a verified sender and a valid recipient are present. It sends plain text, uses the configured sender, adds a validated user address as Reply-To, includes the RFQ reference and never turns user text into HTML. The submission remains `STORE → NOTIFY`; provider failure sets notification status to `failed` while preserving the enquiry.

`RFQ_NOTIFICATION_EMAIL` remains `info@mastermax.co.ke`. `EMAIL_FROM` must remain empty until a real sender or domain is created and verified. Configure Postmark SPF/DKIM exactly as Postmark supplies, then publish a DMARC policy agreed with the domain owner. Do not claim DMARC alignment or inbox delivery before DNS and receipt tests succeed. The Contact form remains intentionally non-sending.

## Staging security and indexing

Use a Railway-generated non-production HTTPS hostname until a staging subdomain is approved. Set `STAGING_URL` and `NEXT_PUBLIC_SITE_URL` to that hostname. `DEPLOYMENT_ENVIRONMENT=staging` makes every application route except minimal health and token-protected readiness require HTTP Basic authentication. Missing access credentials fail closed.

Set `SEO_INDEXING_MODE=staging`. Staging responses include `X-Robots-Tag: noindex, nofollow, noarchive`, page metadata is noindex/nofollow, `robots.txt` disallows all crawlers and `sitemap.xml` is empty. Public-page canonical URLs deliberately remain on `https://haribollubesltd.co.ke`. Admin and API routes remain noindex. Verify all behavior from the actual HTTPS response, not environment settings alone.

The public health endpoint returns only `{ "status": "ok" }`. `/api/readiness` requires a unique 32+ character bearer token and checks database access without returning database details, counts or secrets. Configure Railway's public health check to `/api/health`; use protected readiness only for authorized operations.

## Monitoring and logging

Use Railway deployment logs and built-in health checks for staging. Sentry remains uninstalled because no DSN was supplied and it does not block staging. Logs contain safe RFQ references and status values; they do not log request bodies, contact fields, credentials or provider response bodies. Add an external production uptime monitor after a production hostname exists.

## Rollback

Application rollback uses Railway's previous successful deployment. Database rollback is separate: prefer forward fixes for additive migrations, and use a reviewed down migration only when safe. Restore a snapshot/PITR fork for destructive or uncertain data changes, verify it, then change the application connection. Object deletion behind a cached public R2 domain also requires cache purge. Email configuration rolls back by restoring the prior environment variable set; stored failed enquiries remain retryable.

## DNS cutover plan

Do not change live DNS in staging. Production cutover later requires the root record, a deliberate `www` redirect, provider domain verification, TLS issuance, Postmark DKIM/SPF records, an approved DMARC policy, and the public R2 media hostname if used. Lower TTL before the scheduled cutover and retain a rollback record. Search Console and Google Business Profile remain outside Phase 30.

## Launch blockers

**Blockers:** authenticated Railway project/repository connection; managed staging PostgreSQL; TLS and least-privilege role; successful committed migrations; provider backups and restore drill; unique staging Payload secret; completed admin bootstrap; working R2 adapter and separate buckets; verified Postmark sender/token and received RFQ test; shared rate limiter implementation; actual HTTPS staging deployment and crawl.

**High priority:** staging Lighthouse/TTFB/database/media latency measurements; browser CSP review across public and Admin routes; DNS/email alignment review; privacy and terms legal review.

**Optional post-launch:** Sentry, external uptime service and analytics after consent approval. Commerce and payments remain disabled.

Production status is **NO-GO**. Staging deployment is also blocked until the external services above are supplied and live-tested.
