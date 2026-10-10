# Staging runbook

This runbook begins only after authorized Railway, Cloudflare R2 and Postmark access exists. Never paste secrets into tickets, chat, logs or committed files.

## 1. Provision

1. Create Railway project/environment `staging`, application service and PostgreSQL service.
2. Create a least-privilege PostgreSQL application role and a TLS private connection string.
3. Enable scheduled database backups and PITR; take a manual pre-migration snapshot.
4. Create distinct staging public-media and private-document R2 buckets with bucket-scoped credentials.
5. Create a Postmark staging server and verify the real sender/domain.
6. Generate independent Payload, HTTP Basic and readiness secrets.
7. Populate Railway from `.env.staging.example`; keep analytics, commerce and HSTS disabled.

Run `pnpm check:staging`. A passing result confirms required names and invariants only; it never replaces live connectivity tests.

## 2. Migrate

Set Railway's pre-deploy command to `pnpm cms:migrate`. Before deploying, record the backup identifier and inspect `pnpm cms:migrate:status`. Deploy only if the migration exits successfully. Verify that the migrations table includes `20261005_120000_phase30_return_insight_to_draft` and that the named Insight is draft, has no publication time and is not indexable.

## 3. Seed and bootstrap

For the one-time bootstrap, set `ADMIN_BOOTSTRAP_MODE=bootstrap` plus strong temporary `PAYLOAD_SEED_ADMIN_EMAIL` and `PAYLOAD_SEED_ADMIN_PASSWORD`, then run `pnpm cms:seed` as an authorized one-off command. Sign in, create/verify an editor, test permissions and lockout, then remove every `PAYLOAD_SEED_ADMIN_*` variable and set `ADMIN_BOOTSTRAP_MODE=complete`. Redeploy and confirm the application refuses a zero-admin state.

## 4. Deploy and verify access

Deploy to the Railway-generated non-production hostname. Confirm the certificate is valid and no request uses mixed content. Verify an unauthenticated request returns 401, an authenticated request loads the homepage, and `/admin` remains access-protected. `/api/health` should return only `{"status":"ok"}`; `/api/readiness` should return 404 without its bearer token and `ready` with it.

## 5. Verify indexing safety

With staging authentication, inspect the homepage, `robots.txt` and `sitemap.xml`. Confirm response `X-Robots-Tag: noindex, nofollow, noarchive`, meta robots noindex/nofollow, robots disallow `/`, an empty sitemap, and production-domain canonicals. Repeat after every staging environment change.

## 6. Test content and Admin

Sign in as editor and administrator. Verify Products, Industries, Insights, Resources, Enquiries and Media. Confirm all products remain drafts, all five seeded Insights are drafts, public Insights is empty and Resources shows its intentional empty state. Confirm the CMS catalogue matches the static catalogue before leaving `CATALOGUE_DATA_SOURCE=cms` enabled.

## 7. Test storage

Upload a clearly synthetic PNG/WebP with meaningful alt text. Confirm it exists in the staging public bucket, renders from the expected staging URL, has the planned cache headers, and can be deleted. Then upload a synthetic draft PDF through the private-document path. Confirm anonymous bucket and predictable URL access fail, authorized delivery succeeds and deletion revokes access. Simulate invalid R2 credentials in a disposable deployment and confirm upload fails without a successful partial record. Restore credentials and remove all synthetic files.

## 8. Test RFQ and email

Submit one synthetic RFQ through the public form. Confirm validation and anti-spam controls, database persistence, a reference, Enquiries visibility, a Postmark delivery event and receipt at `info@mastermax.co.ke`. Confirm the configured sender and safe Reply-To. Temporarily use an invalid staging token, submit a second synthetic RFQ, and verify it remains stored with notification status `failed` and one attempt. Restore the token. Delete both synthetic enquiries after recording redacted evidence.

The Contact form remains non-sending.

## 9. Failure and operational checks

In a disposable staging deployment, point the application at a non-responsive database endpoint. Confirm public failure is generic, no stack/connection string is exposed, readiness returns 503 and logs omit credentials. Restore the URL. Review CSP console output on homepage, Admin, Insights, media and RFQ. Verify all security headers. Run mobile Lighthouse three times on Homepage, Products, Contact and Insights and record median results. Measure cold and warm TTFB, a representative CMS query and public/private media response.

## 10. Crawl and scan

Run the route crawl against the protected staging hostname with authorized credentials. Confirm no broken internal links, scripts, mixed content, accidental indexability or unexpected structured-data errors. Run `pnpm scan:production`, `pnpm lint`, `pnpm type-check`, `pnpm build`, the full regression suite and the security audit. Store only redacted outputs.

## 11. Backup restore drill

Create a logical dump and restore it into a scratch database. Compare migrations and key row counts for users, products, enquiries, insights and resources. Record duration and backup age, then destroy the scratch database. Set `BACKUP_RESTORE_TESTED=true` only after the drill succeeds.

## 12. Rollback

For an application fault, select Railway's previous successful deployment. For database issues, stop writes, choose a safe reviewed down migration or restore/PITR fork, verify it and change the connection. Never assume application rollback reverses the database. Purge public R2 cache after object deletion or replacement when immediate removal matters.

## Evidence checklist

Capture redacted screenshots of the authenticated staging homepage, Admin login, Insights empty state, Resources empty state, successful synthetic RFQ, received Postmark message, R2 media render, response noindex/security headers, Lighthouse result and staging-readiness report. Evidence must not show passwords, bearer tokens, database URLs, email server tokens, customer data or R2 keys.
