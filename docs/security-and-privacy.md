# Security and privacy architecture

Status: Phase 29 launch-readiness architecture. This is technical and operational guidance, not legal advice. No production service or account is connected.

## Threat model

| Surface | Realistic threats | Current controls | Remaining production work |
|---|---|---|---|
| Public website | XSS, clickjacking, malicious links, dependency compromise | React escaping, controlled rich-text rendering, CSP, frame restrictions, security headers | Monitor CSP and dependency advisories |
| Payload Admin | Credential stuffing, brute force, privilege abuse, CSRF, session theft | Authentication, admin/editor roles, five-attempt lockout, ten-minute lock, eight-hour token, noindex, collection access | Edge login throttling, strong bootstrap process, session/cookie verification, MFA decision |
| RFQ endpoint | Spam, large bodies, malformed JSON, replay, cross-site requests, log/PII leakage | JSON-only mutation, origin/fetch-site checks, 32 KiB limit, schema validation, honeypot, timing, idempotency, rate limit, safe status logs | Verified shared edge limiter and notification delivery |
| Contact form | False-success UX, spam, PII mishandling | Browser-only validation and explicit non-sending disclosure | Implement only after a separate destination, retention owner and notification workflow are approved |
| CMS content | Stored XSS, malicious rich text, false claims | Lexical structured content, publishing/verification guards, role access | Editorial review and CSP monitoring |
| Media/documents | Malformed upload, executable/SVG content, unpublished-file disclosure | Explicit JPEG/PNG/WebP/AVIF/PDF list, 15 MiB limit, safe filenames, separate Railway buckets, repeated publication/verification checks | Magic-byte scanning and malware scanning if risk warrants |
| Database/secrets | Credential leakage, public exposure, excessive privilege, destructive migration | Environment-only credentials, ORM/parameterised access, access controls, fail-closed launch check | Private/TLS connection, least privilege, migration role, backups and restore test |
| Email | Header/HTML injection, spoofing, PII in logs, missed notifications | Provider-neutral notifier boundary, stored enquiry remains authoritative | Verified sender, escaped templates, retry worker and delivery monitoring |
| Analytics | PII leakage, pre-consent tracking, tag injection | No provider installed; typed event names; property safeguards; consent-gated no-op adapter | Approve policy, adapter and consent mode before enabling |
| Future webhooks/payments | Forgery, replay, amount tampering, duplicate settlement | Commerce disabled; immutable snapshots and idempotency architecture | Separate activation security review, signatures, timestamp windows, transactions and reconciliation |

SSRF is currently limited because no public endpoint fetches user-provided URLs. Reassess before remote media import, webhook callbacks, previews or arbitrary URL ingestion are added. Redirect destinations are code-owned; no arbitrary off-site redirect parameter was found.

## Headers and CSP

`src/lib/security/headers.ts` supplies nosniff, strict-origin referrer policy, restrictive permissions, SAMEORIGIN framing, COOP and CORP. Production defaults to an enforcing CSP; development defaults to report-only. `SECURITY_CSP_MODE` can explicitly select `off`, `report-only` or `enforce`, but the production-readiness command requires `enforce`.

The CSP uses self as the default, connection and form source; disables objects; restricts base URI and frame ancestors; allows only self/data/blob images; and contains no wildcard or `unsafe-eval`. Public CMS media stays same-origin through Payload, so no storage hostname is added. `unsafe-inline` remains for scripts and styles because Next.js hydration and Payload Admin currently emit inline bootstrap/style content. Replacing it requires a tested nonce/hash integration across both application surfaces. Future analytics or payments origins must be added individually after approval.

HSTS is emitted only when `NODE_ENV=production` and `SECURITY_HSTS_ENABLED=true`. Begin with `max-age=86400`. Increase after verified HTTPS stability. Do not add `includeSubDomains` until every subdomain is HTTPS-only, and do not preload without a separate irreversible-domain review.

## Admin, APIs and browser request policy

There is no open public user creation: Users are administrator-only. Enquiries, Orders and Payment Transactions are administrator-only; pricing is administrator-only; editors may manage controlled content. Admin/API responses are noindex. GraphQL is disabled.

Payload’s account lockout is configured for five failed attempts and ten minutes; tokens expire after eight hours. A shared production edge rule should also throttle login attempts by IP and route. Local development keeps normal Payload behavior and does not add an external limiter. MFA is not claimed; decide it through the eventual identity/admin architecture. Verify Secure, HttpOnly and SameSite behavior on the deployed HTTPS host.

The RFQ API accepts POST JSON only. Browser cross-site requests are rejected using `Origin` and `Sec-Fetch-Site`; CORS does not grant external origins. Missing Origin remains acceptable for controlled server clients, while JSON content type prevents a simple cross-origin form POST. CORS must remain absent for private and mutation APIs. Do not use CORS as an authentication or CSRF control.

The current in-memory limiter is defence in depth only. Production requires a verified shared edge/hosting limiter (`RATE_LIMIT_PROVIDER=edge`) so all instances share enforcement. Managed Redis is the portable alternative; a PostgreSQL write-per-attempt limiter adds database pressure and cleanup work and is not preferred at current scale.

## Validation, uploads and private files

Inputs are bounded and validated before storage. RFQ source pages are allowlisted, enum values are controlled, product and industry relationships are checked, and arbitrary redirect destinations are absent. Future webhooks must verify a raw-body signature, timestamp window and replay key before parsing or writing.

Editor uploads allow JPEG, PNG, WebP, AVIF and PDF only, one file per request, with a 15 MiB request limit and safe filenames. Arbitrary SVG is disallowed because no SVG sanitizer is installed; trusted repository-owned SVG may still be reviewed and shipped as code assets. MIME allowlisting is necessary but does not prove file contents. Production ingestion should validate magic bytes and add malware scanning if the document threat/risk justifies it.

Public resource delivery requires a published Resource, a published and verified Technical Document where applicable, and a verified source file. Predictable IDs do not grant access. Railway Object Storage uses:

- a private Railway media bucket, proxied by Payload with verified-public read access;
- a separate private documents bucket and upload collection with no anonymous collection or bucket access;
- controlled prefixes and safe filenames rather than user-controlled object paths;
- the official Payload S3 adapter, selected only through `MEDIA_STORAGE_PROVIDER=railway-s3`;
- server-controlled private-document delivery after Resource, Technical Document and file verification;
- versioning/replication or an independent backup process because object storage is not itself a backup.

## Database, transactions, migrations and backups

Use managed PostgreSQL over TLS, private networking where available, a strong secret, least-privilege application credentials and a separate elevated migration role when operationally practical. Use host-appropriate pooling and never expose PostgreSQL directly to the public internet.

RFQ idempotency currently relies on a unique key and repository behavior; one-record creation is tested. Future orders, stock reservations and payment state changes require database transactions, row locking or atomic conditional updates. Provider event IDs and idempotency keys must be unique. Do not add unused commerce transaction machinery while commerce is disabled.

Take daily backups with retention approved by the business, enable point-in-time recovery when available, and take a pre-migration backup. Test restore into an isolated environment and record recovery time and data-loss windows. `BACKUP_RESTORE_TESTED=true` is a launch assertion, not a backup mechanism.

## Secrets and logging

Public variables are limited to values intentionally exposed to browsers: site URL, WhatsApp, optional analytics measurement ID and site verification. `DATABASE_URL`, `PAYLOAD_SECRET`, Resend credentials, Railway object-storage credentials and future payment credentials are server-only. Store production values in the hosting secret manager, rotate on exposure and never keep seed-admin passwords in the runtime.

The RFQ service logs only reference number, safe status and notification status. It does not log names, email, phone, company, location, message, raw requests or secrets. Production errors use bounded categories and must not return stack traces, SQL, internal paths or Payload internals. Monitoring should record safe error classes and correlation IDs; PII belongs in access-controlled records, not log events.

## Privacy inventory and retention

| Data | Purpose/storage | Access | Retention recommendation |
|---|---|---|---|
| RFQ name, company, contact, type, location and message | Enquiry response in private Payload/PostgreSQL | Administrators handling enquiries | Define a configurable business/legal period; review closed enquiries and delete/anonymise under approved policy |
| Contact form fields | Browser validation only; not transmitted | Visitor only | None while informational |
| CMS user name/email/auth state | Administration and accountability | Administrators | Account lifetime plus a short approved audit period |
| CMS content/media | Catalogue/editorial operation | Admin/editor by role | While operational; versions according to approved content policy |
| Future order/delivery/payment references | Fulfilment, accounting, reconciliation | Restricted operational/admin roles | Decide before commerce using legal/accounting requirements |
| Theme preference | `localStorage`: `light` or `dark` | Visitor browser | Until cleared or replaced |
| Future cart | `localStorage`: offer ID and quantity only | Visitor browser | Short functional duration; no customer details |
| Future analytics | Controlled event name, route/category/product slugs | Approved analytics users | Shortest useful configured period; no PII/free text |
| Application/security logs | Availability and incident diagnosis | Restricted operators | Short rolling period based on operational need |

No automatic deletion is enabled until the business approves retention, legal-hold, access and deletion procedures. Privacy and Terms pages are structured drafts, remain noindex, and require business/legal approval before launch.

## Cookies, consent and analytics

The public website currently sets no marketing analytics cookie. Theme preference uses localStorage. Disabled cart test architecture stores only offer identifiers and quantities. Payload Admin uses authentication/session cookies for signed-in administrators; verify their deployed flags. A cookie banner would currently be meaningless and is not added.

The provider-neutral analytics layer exports `trackEvent(name, properties)`, remains a no-op without both consent and an adapter, and rejects sensitive-looking property names. Approved events are navigation, product/category views, Finder start/complete, RFQ start/submit, WhatsApp click, Insight view and resource download. Future commerce events are add-to-cart, checkout start, order created and payment completed.

Never send name, email, phone, company, address, messages, RFQ/order references or free-text input. Use controlled slugs/enums. If the approved policy requires opt-in, load no analytics script until consent. Kenya and Ireland/EEA audiences require business/legal review of applicable notice, consent and transfer obligations. Direct GA4 would be simpler than GTM for this focused site; GTM adds a broader script-governance surface and is not recommended initially.

## Email and monitoring

Resend is the selected transactional provider. Verify a Haribol-owned sender domain, keep the RFQ recipient separate, set Reply-To only from validated input, escape all values and use plain text or a fixed safe template. Never render submitted HTML.

The record is stored before notification. Delivery attempts update notification status and retry count; transient failures should enter a bounded retry queue with backoff and alerting. Permanent failures remain visible for manual handling. `info@mastermax.co.ke` is the current private RFQ recipient and is not a valid sender unless its domain owner authorises and verifies it. RFQ email delivery is a launch blocker because a persisted but unnoticed lead is an unacceptable operational failure. A future Contact backend needs its own approved destination and must not silently reuse the RFQ inbox.

Sentry or equivalent may later monitor server exceptions, RFQ storage/delivery, CMS failures, resource delivery and future commerce/payment failures. Scrub request bodies, auth headers, cookies and PII. `/api/health` remains a public liveness check returning only `{ "status": "ok" }`; dependency readiness belongs in a private authenticated/internal check.

## Launch blockers

| Classification | Items |
|---|---|
| Blocker | Production PostgreSQL/TLS and migrations; tested backups/restore; strong Payload secret; live Railway storage tests; working Resend RFQ email; approved Privacy/Terms; DNS/TLS/redirects; enforcing CSP; verified HSTS rollout; shared rate limiting; approved production data; final indexing gate |
| High priority | Admin/session verification, runtime monitoring, real asset approval, operating contacts/hours, documented incident owner and log retention |
| Can follow after launch | Analytics, social profiles, advanced monitoring, nonessential content expansion, commerce |

Commerce stays disabled. Payment credentials are not required for catalogue launch. Commerce and payment activation require a separate review of transactions, provider signatures, reconciliation, stock locking, privacy and incident response.

## Dependency review

The Phase 29 registry audit initially reported five high advisories: two in direct `sharp@0.34.4`, two in Payload's transitive `undici@7.29.0`, and one transitive `braces@3.0.3` advisory. Sharp was updated to 0.35.4 and Undici was pinned to patched 7.29.1 through the workspace override, removing four high advisories without a framework major upgrade.

One high advisory remains in `braces@3.0.3`. The registry reports no published patched version. It is reached through Sass/Chokidar build watching and ESLint glob matching, and the application does not pass public user-controlled glob patterns into it. This lowers current runtime exploit relevance but does not erase the finding. Track the upstream Next/Payload/tooling dependency and remove the override need or update when a compatible fix is published. The final audit reports zero critical, one high, one moderate and one low advisory.
