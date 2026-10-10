# Cart, Checkout and Order Architecture

## Activation boundary

Phase 25D supplies domain services and private Payload collections only. `siteConfig.commerceEnabled` remains `false`; there are no public cart, checkout, payment or confirmation routes and no storefront controls. Activation requires verified offers, tax treatment, delivery rules, payment providers, policies and operational approval.

## Cart model and persistence

An anonymous cart contains only `{ offerId, quantity }` lines. `offerId` is the identity because formulation, pack, SKU, price and availability belong to a sellable offer rather than the parent product. A future storefront should persist this minimal cart in `localStorage`. It contains no prices, totals, customer data or payment data and is never trusted by checkout.

`addCartLine`, `updateCartQuantity` and `removeCartLine` manage the untrusted cart shape. `resolveCart` is the server boundary. It reloads each offer and checks the site flag, publication and active states, online commerce mode, active market, current promotion, currency, inventory mode, stock, MOQ and maximum quantity. Only `buy-online` and `both` offers qualify. `quote-only`, `on-enquiry`, draft, inactive, unavailable-market and unavailable-stock offers are rejected.

## Guest checkout

Checkout accepts full name, optional company, phone, optional email, delivery town/location and optional delivery instructions. Phone is required for Kenya-first payment readiness while still accepting conservative international formats. Validation is server-side. Customer accounts are outside this phase.

No live shipping or pickup option is active. Delivery and pickup are modeled as future states, but public checkout cannot be enabled until Haribol approves eligible locations, fees and pickup operations. Delivery fees remain zero only as a disabled architectural placeholder, not a public promise.

## Totals and commercial authority

All money uses safe integer minor units. The calculation order is:

`subtotal - active offer discount + verified tax + delivery = grand total`

The server resolves the active Phase 25C price at checkout. Browser-submitted prices, discounts, currency, tax, stock, eligibility and totals have no input path. Mixed-currency orders and unsafe integer totals are rejected. Tax remains zero/unconfigured until verified accounting policy is supplied; no VAT rate is assumed.

## Orders and snapshots

Orders are private administrator-only Payload records. An order embeds immutable commercial line snapshots because normal order scale does not require a separate mutable line collection. Each line records offer and product references where available plus stable snapshots of names, variant, SKU, pack, container, quantity, currency, regular and charged unit prices, discount, tax classification/treatment, subtotal, discount, tax and line total. Live offer edits therefore cannot rewrite order history.

Financial line and total fields are blocked from ordinary admin updates. Status, internal notes and operational payment references remain manageable. Payload versions retain up to 100 revisions for auditability.

Public references use `ORD-<UTC year>-<unpredictable token>` and are unique. Sequential database IDs are never intended for customers. A unique checkout idempotency key returns the existing order when a submission repeats and also provides a database constraint against duplicate rows.

## Order and payment states

Order state and payment state are distinct. Order states are pending-payment, payment-processing, paid, processing, ready, completed, cancelled, payment-failed and refunded. The domain transition map prevents jumps such as pending-payment directly to completed.

Payment states are unpaid, pending, paid, failed, cancelled, partially-refunded and refunded. Typical transitions are unpaid → pending → paid, pending → failed, failed → pending, and paid → partially-refunded/refunded. Order fulfillment must never infer payment solely from an order status.

## Payment transactions and webhooks

Payment Transactions are private administrator-only records containing order, provider, unique provider reference when assigned, immutable order-derived amount and currency, status, safe event reference, and safe internal failure details. Providers are neutral: M-Pesa, card, bank and other. Provider secrets and unfiltered webhook payloads do not belong in these records.

A future payment service must create transactions from the immutable order grand total. Provider adapters will implement signature verification and normalize events before `applyPaymentStatus` behavior is enabled. A frontend redirect, query parameter or client callback must never mark an order paid. Only a verified server-to-server provider event may do so. Replayed events require provider-event idempotency.

## Inventory and reservations

Tracked offers are checked against current stock during server cart resolution. Untracked offers can be eligible when otherwise approved. On-enquiry offers normally remain quote-only. Stock is not reserved or decremented in this phase.

Future payment integration should create a time-limited reservation when a payment attempt starts, confirm deduction after verified payment, and release it on failure, cancellation or timeout. The reservation and stock update must run transactionally to prevent overselling. Opening a cart or checkout must never decrement stock.

## Access, privacy and security

Generic public Payload access to Orders and Payment Transactions is closed. Editors cannot read or mutate them. A future public checkout endpoint must call the server order service rather than direct Payload create. The service whitelists cart identity and quantity, re-resolves offers, validates guest details, calculates totals and writes snapshots.

Anonymous cart storage contains no PII. Checkout PII is stored server-side only after submission. Safe future analytics events may record cart and payment lifecycle names with non-identifying operational identifiers, but must never include names, email, phone, company, location or instructions.

The architecture addresses mass assignment, price and quantity manipulation, inactive or draft offers, inactive markets, stock limits, idempotency, order enumeration and direct Payload access. Public order lookup, confirmation and customer notification are not implemented.

## Future integrations

M-Pesa, card and bank providers will be separate adapters over the provider-neutral transaction model. Phase 25E should add verified provider configuration, request signing, callback verification, replay protection, transactional payment/order updates, stock reservations, reconciliation and failure recovery. Customer emails should use a notification adapter only after an actual provider result; no confirmation claim should be emitted before then.

Coupons, wholesale pricing, customer-specific pricing, accounts, abandoned-cart tracking, marketing automation, live shipping, public confirmation pages and public analytics remain future work.
