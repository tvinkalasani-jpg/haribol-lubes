# Commerce data architecture

## Scope and safety state

Phase 25C prepares data and administration only. `siteConfig.commerceEnabled` remains `false`; the public catalogue emits no prices, buy actions, cart route, checkout route or Offer structured data. RFQ, catalogue search and technical Product Finder behavior remain unchanged.

## Product, variant and offer

The catalogue uses three separate responsibilities:

1. **Product** describes a marketed lubricant range.
2. **Product Variant** describes a technical formulation or grade.
3. **Product Offer** describes a commercial pack that may eventually be quoted or purchased.

Offers are a separate Payload collection because SKU, packaging, price, promotion, inventory and market state change independently from technical formulation data. Future carts and order lines identify an `offerId`, never a product ID alone. This also permits several packs for one formulation without duplicating product content.

## Commerce modes

- `quote-only`: the conservative default; RFQ is the route to sale.
- `buy-online`: a verified pack may eventually be purchased at a server-resolved price.
- `both`: the pack may eventually be purchased while bulk or commercial requirements still use RFQ.

An offer must also be active, published, assigned to an active market and pass storefront rules before it can become sellable. The site-level flag remains the final safety gate.

## Money and pricing

Money is stored as a safe integer in **minor currency units** with an explicit ISO currency code. KES 1,250.00 is `125000`; floating-point prices are rejected. KES is the current default. USD, UGX, TZS and RWF are valid future codes, but no exchange-rate conversion or multi-currency checkout exists.

`formatMoney()` uses `Intl.NumberFormat("en-KE")` with currency-code display. Whole KES values therefore render like `KES 8,500` while the stored value retains minor-unit precision.

Each offer supports an optional regular price and optional sale price. A sale price must be positive and lower than the regular price. `calculateDiscountPercentage()` derives the discount and rounds to the nearest whole percentage; editors never enter the percentage manually. `priceVisibility` is separate from `commerceMode`, so a future quote-only offer can have a reference price without becoming purchasable.

## Promotions

An offer-level sale is active only when a valid sale price exists and the current time is within optional `saleStart` and `saleEnd` boundaries. Missing boundaries are open-ended. Reversed ranges are rejected. Expired and scheduled sales resolve to the regular price. Editorial labels are limited to Special Offer, Limited-Time Price and Promotion. Coupons and promotion codes remain future work.

## Packaging

`packSize` is numeric and `packUnit` is structured (`ml`, `L`, `kg`, `g`, `unit`, `other`). `containerType` is separate (`bottle`, `can`, `pail`, `drum`, `container`, `other`). A 200 L drum is represented as pack size `200`, unit `L`, container `drum`; “drum” is not used as a quantity unit. Pack data is not seeded without business confirmation.

SKU and barcode are optional. A supplied SKU is unique and never derived from a database ID. A barcode accepts only a verified 8–14 digit EAN, UPC or GTIN. No identifiers are fabricated.

## Inventory and availability

Inventory modes are `tracked`, `untracked` and `on-enquiry`. Tracked inventory requires a non-negative integer stock quantity. On-enquiry does not interpret any quantity as live stock. Availability states are `in-stock`, `low-stock`, `out-of-stock`, `available-on-enquiry`, `preorder` and `discontinued`.

New offers default to `on-enquiry` and `available-on-enquiry`. No stock quantity is seeded. Optional low-stock, minimum-order and maximum-order quantities are supported. Reservation, oversell protection, delivery zones, quantity breaks, wholesale prices and customer-specific prices remain checkout-era work.

## Tax readiness

Tax classes are `standard`, `zero-rated`, `exempt` and `unknown`; price tax treatment is `included`, `excluded` or `unknown`. Both default to `unknown`. No Kenyan VAT percentage is hard-coded and the public site makes no VAT-inclusive claim. Verified accounting configuration is required before checkout.

## Markets

Offers reference market records. The admin selector is limited to active markets; Kenya is currently the only active market. Uganda, Tanzania and Rwanda remain planned and cannot become purchasable merely by being present in the catalogue. Future storefront selectors must re-check active market status on the server.

## Price history and permissions

Product Offers retain up to 100 Payload versions. This preserves prior pricing, promotion and inventory values with timestamps and provides restore/history UX. The collection is admin-only for create, read, update and delete; Editors can manage catalogue content but cannot view or mutate pricing records. A dedicated commerce-manager role can be introduced later. A separate immutable audit-event collection should be considered before live commerce if actor-level reporting beyond Payload versions is required.

## Order snapshots and server authority

A future order line snapshots the offer ID, product and variant names, SKU, pack description, unit price, currency, regular price/discount, tax classification, tax treatment and quantity. Historical orders never recalculate from the current offer.

The browser will submit only `offerId` and quantity. The server must reload the offer and determine current price, currency, promotion, active market, availability and stock inside the checkout transaction. Browser-submitted prices are never trusted. Tracked inventory must be reserved or atomically decremented before payment finalization to prevent overselling.

## Future cart, checkout and payments

Cart identity is `offerId`; this distinguishes pack, formulation, SKU and price. Future checkout will create an immutable order-price snapshot and then initiate a provider-neutral payment transaction containing order, amount, currency, provider, provider reference and status. M-Pesa, card and bank/gateway details belong to payment records and adapters, never Product Offers.

## SEO and schema readiness

`createOfferSchemaCandidate()` prepares future `Offer`, `price`, `priceCurrency`, `availability` and SKU mapping. It returns no data while commerce is disabled or an offer is not active, published and publicly priced. No price or availability structured data is currently emitted.

## Migrations and rollback

The Phase 25C PostgreSQL migration creates the offer table, version table, relationship tables, enums, indexes and foreign keys without modifying existing product or variant rows. Rollback drops those new objects only. Production rollback must first confirm no live orders or external references depend on offer IDs; once commerce is live, destructive rollback should be replaced by a forward migration.

## Seed policy and business data still required

Seed output remains 10 products, 21 formulation variants and **zero Product Offers**. Before ecommerce can be enabled, Haribol must approve real pack sizes, SKUs, barcodes, KES prices, promotion dates, tax treatment, inventory mode/counts, order limits, market availability, delivery rules and payment/fulfilment procedures.
