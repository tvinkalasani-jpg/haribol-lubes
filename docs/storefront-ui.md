# Storefront UI and Activation Readiness

## Activation gate

The storefront preview exists behind the server-only `STOREFRONT_TEST_MODE=true` switch. The permanent `siteConfig.commerceEnabled` value remains `false`. Without the explicit preview switch, product pages contain no commerce panel, `/cart` and `/checkout` return 404, and the test APIs return 404.

Public activation requires every relevant offer to be active and published, online-buyable, priced, available in an active market, compatible with its inventory state, and covered by verified tax and delivery rules. The site flag must then be explicitly approved and changed. Test mode never changes that flag.

## Offer selector and product presentation

The product commerce panel is an accessible radio-group selector. Selecting a pack updates its pack description, active price, sale treatment, derived discount, restrained promotion label, customer-facing availability, MOQ, maximum online quantity, and actions without changing the URL. This avoids duplicate SEO pages.

`quote-only` and on-enquiry offers show Price on request and Request a Quote. `buy-online` offers show the price, quantity control and Add to Cart. `both` offers show Add to Cart and Request a Quote. Out-of-stock offers cannot be added. Exact stock quantities are not shown.

All price and promotion presentation comes from the Phase 25C utilities. Active sales show the current price, struck-through regular price and derived whole-number discount. Future and expired promotions show only the regular price. `KES 0` and empty price panels are never rendered.

The panel sits immediately after the existing product hero. The technical catalogue, applications, documents and Haribol enquiry structure remain primary. Category pages, product search and Product Finder are unchanged; price and availability summaries or filters must wait for verified commercial data.

## Quantity and Add to Cart

The reusable quantity control supports keyboard-accessible decrement, native manual input and increment controls. It clamps to MOQ and maximum values. The server repeats those checks. Add to Cart submits only `offerId` and quantity and announces confirmation through an `aria-live` region.

## Cart state and revalidation

The test cart persists only `{ offerId, quantity }` in `localStorage`. It stores no prices, product data, customer information or payment information. Cart count is defined as total units, though no public header counter is rendered while commerce is disabled.

Opening or changing the cart calls the gated server resolver. The resolver reloads test offers and validates current publication, commerce mode, market, price, promotion, stock, MOQ and maximum quantity. Removed offers, expired promotions, price changes and stock changes therefore use current information. Within a session, a changed current price produces a polite “Price updated” announcement. After a reload, the current authoritative price is simply displayed; stale pricing is never preserved.

The cart uses stacked responsive cards rather than a horizontal table. It includes product/pack context, current unit price, quantity, current line total, remove action, current subtotal, RFQ alternative and checkout CTA. Tax and delivery totals are withheld because policy is unconfigured. The empty state links back to products.

## Checkout shell

The gated checkout collects full name, optional company, phone, optional email, delivery location and optional instructions. It re-resolves the cart through the Phase 25D service before producing an in-memory synthetic test order. The order summary displays current subtotal and clearly identifies tax and delivery as unconfigured.

No card inputs, M-Pesa prompt or Pay button exists. The placeholder explains that payment selection follows a future verified integration. A successful test submission shows only a synthetic reference, authoritative total, `unpaid` payment state and payment-pending next step. No database order is created by the preview.

## Accessibility, theme and mobile

Offer selectors use radio semantics and labels. Quantity and remove controls include descriptive accessible names. Cart updates and price changes use polite live regions. Validation failures use alert semantics. Checkout inputs have visible labels and native autocomplete attributes. All controls retain visible global focus treatment and keyboard operation.

The storefront uses the existing semantic color and spacing tokens, so System, Light and Dark modes work without a separate theme. On narrow screens, offer details, cart lines and checkout columns collapse into single-column layouts with full-width actions and no horizontal table.

## Analytics and SEO

The architecture is ready for `offer_selected`, `add_to_cart`, `remove_from_cart`, `cart_quantity_changed`, `view_cart`, `begin_checkout` and `order_created`. Event payloads must exclude PII. No analytics package was installed.

Offer selection creates no URL, query parameter or indexable page. Public Offer structured data remains absent because `commerceEnabled` is false and no real offer data exists.

## Synthetic testing and activation checklist

Code-only fixtures exercise a regular 1 L price, active-sale 5 L pack, out-of-stock 20 L pack, MOQ pack and quote-only bulk pack, plus future and expired promotions. Labels identify every preview as synthetic and not for sale. These fixtures are never inserted into Payload or PostgreSQL.

Before activation Haribol must approve real offers, SKUs, pack sizes, prices, promotion dates, stock process, MOQ/maximum rules, tax treatment, delivery areas and fees, pickup policy, terms, refund/cancellation handling, payment provider, fulfilment workflow, customer notifications, monitoring and support ownership. Payment integration must verify callbacks server-to-server and must never trust browser totals.
