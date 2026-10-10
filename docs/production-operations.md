# Production operations runbook

Status: provider-neutral readiness procedure. Do not treat this document as evidence that production infrastructure exists.

## Release preparation

1. Approve business copy, product publication, Privacy, Terms, contacts, hours and operational ownership.
2. Provision TLS PostgreSQL, public/private object storage, transactional email, DNS/TLS, backups and a shared edge limiter.
3. Store server credentials in the host secret manager. Keep all seed credentials and local/test flags out of the runtime.
4. Configure the exact canonical origin, CMS catalogue source, Payload RFQ repository, enforcing CSP and the tested HTTPS-only HSTS switch.
5. Run `pnpm check:production`; any blocker prevents release. Commerce/payment credentials are not required.
6. Run lint, type checking, production build, all validation suites, dependency audit, artifact scan and a production-mode crawl.

## Migration and deployment

1. Confirm the latest successful backup and take a pre-migration snapshot.
2. Review migration SQL for destructive changes and confirm code/database compatibility order.
3. Put the release into a controlled maintenance window if compatibility requires it.
4. Run committed Payload migrations once using the migration credential. Never use development schema push on application boot.
5. Verify migration status and record the applied version.
6. Deploy the compatible application artifact without local `.env`, `.data`, media, test builds or synthetic records.
7. Check `/api/health`, homepage, admin login, published catalogue/content, private resource denial and RFQ persistence/email delivery using controlled test data.
8. Verify HTTPS, redirects, headers, CSP console, robots, sitemap and canonical host.
9. Activate production indexing only after the final content and crawl review.

Rollback should prefer application rollback when the schema remains backward compatible. A destructive/data migration needs its own tested reverse or forward-fix plan. Restore a backup only with an explicit incident decision because it can discard newer data.

## Environment and admin bootstrap

Use least-privilege runtime credentials. Create the first administrator through a one-time controlled bootstrap process, verify login and role, remove seed credentials immediately, then set `ADMIN_BOOTSTRAP_MODE=complete`. Production startup refuses to expose an empty Users collection; `allow-local` exists only for isolated local production-mode validation. Never retain `PAYLOAD_SEED_ADMIN_PASSWORD` in the production service. Give each administrator an individual account and remove access promptly when no longer needed.

HSTS starts at one day after HTTPS verification. Raise the duration later; separately approve subdomains and preload. Keep previews on staging noindex and without production HSTS assumptions.

## Backups and restore

- Daily database backups with approved retention; point-in-time recovery where supported.
- Independent media/document backup or versioning with deletion protection.
- Pre-migration snapshot for every risky schema release.
- Quarterly restore exercise initially, into an isolated environment, recording duration, completeness and operator.
- Keep backup credentials separate from application credentials.

Only set `BACKUP_RESTORE_TESTED=true` after a successful production-equivalent restore exercise.

## Email and RFQ validation

Verify the sender domain, sender address, RFQ recipient and provider credentials. Submit one controlled RFQ, confirm one stored record, confirm delivery, confirm reply handling and confirm no PII appears in logs. Exercise a provider failure and verify the stored lead remains with a visible failed/pending notification state. Email delivery is a launch blocker.

The Contact form remains informational and non-sending. Do not advertise it as delivered. A later backend needs a separate destination, storage/retention decision, anti-abuse controls and the same store-then-notify behavior.

## Health, monitoring and uptime

External uptime monitoring should check the canonical HTTPS homepage and `/api/health`; optionally check the admin login surface without authenticating. A synthetic RFQ check must use controlled data and cleanup/retention rules and should run less frequently. Private readiness checks may test database, storage and email dependencies without exposing details publicly.

Monitoring must scrub authorization headers, cookies, request bodies and contact data. Alert on sustained 5xx responses, RFQ storage/email failures, CMS errors and resource delivery failures. Future checkout/payment alerts wait for commerce activation.

## Indexing controls

Normal launch: verify the canonical host, production robots and sitemap, then set `SEO_INDEXING_MODE=production` in the approved release. Emergency noindex: set the mode to staging, redeploy, verify robots and page meta, then investigate. This limits future crawling but does not remove already indexed pages; use Search Console removal only through an approved incident action.

## Incident basics

### Website unavailable

Confirm scope from health/homepage checks, inspect safe platform errors, roll back the application if the release caused the outage, and keep stakeholders informed. Do not expose logs or credentials in status messages.

### Database unavailable

Stop write-dependent operations, preserve queued/enquiry evidence, verify provider status and connection limits, and restore only through the documented recovery decision. Reconcile RFQ records after recovery.

### RFQ email failure

Treat the stored record as authoritative, alert the operational owner, review failed notification statuses, restore the provider/sender configuration and retry with bounded backoff. Never ask users to resubmit solely because notification failed.

### Suspected admin compromise

Disable or rotate the affected account/session, rotate Payload and relevant provider secrets as indicated, preserve logs, review content/enquiry access and versions, and restore known-good content only after scope is understood.

### Accidental indexing

Enable emergency noindex, verify it, identify exposed routes and content, then use approved Search Console controls after access is available. Do not rely on robots alone for confidential data.

### Bad migration

Stop further writes if data integrity is at risk, preserve the current database, assess forward fix versus tested rollback, and restore only with explicit acknowledgement of the recovery point.

### Future payment incident

Commerce is disabled. If later activated, stop affected payment operations, preserve provider event IDs and immutable order/payment evidence, rotate compromised credentials, reconcile with the provider and follow the separately approved payment incident plan.

## Post-deploy record

Record release identifier, migration version, environment-check result, backup identifier, health/RFQ test result, header/crawl result, indexing state, operator and time. Keep secrets and customer data out of the record.
