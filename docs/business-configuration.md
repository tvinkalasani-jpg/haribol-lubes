# Business configuration

Verified Haribol business facts are kept in `src/config/site.ts` or environment configuration so public pages do not duplicate them and do not depend on Payload availability.

## Public business details

- WhatsApp: `NEXT_PUBLIC_WHATSAPP_NUMBER=+254 794 205 115` (normalizes to `254794205115` for `wa.me`).
- Address: Emerald Business Park, Kutch Rd, Mlolongo, Kenya.
- Directions: the exact business-supplied Google Maps URL in `siteConfig.businessAddress.mapsUrl`. No coordinates, approximate map, or embedded third-party map is used.
- Public email: intentionally empty. The RFQ inbox is not presented as a general company address.
- Social profiles: `instagram`, `facebook`, `linkedin`, and `youtube` are empty until verified profile URLs exist. Only valid HTTPS profile URLs on the matching platform render.

## RFQ notification destination

`RFQ_NOTIFICATION_EMAIL=info@mastermax.co.ke` is the notification recipient only. It is separate from public contact information and from the future sender identity. Notification delivery remains accurately reported as unavailable until an email provider, sender domain, and sender address are configured and verified. The RFQ order remains validate → anti-spam → store → notify → result.

## Commerce preparation

`defaultCurrency` is `KES` and `commerceEnabled` is `false`. These values do not add prices, SKUs, stock, cart, checkout, or purchasing controls.

## Location wording policy

Mlolongo is the verified physical operating location. Kenya remains the primary market and broad SEO target. Nairobi may be used later only when it truthfully describes a served market, never as the company address. Future LocalBusiness structured data should use the verified address, but schema work is intentionally deferred.

## CMS boundary

Critical company contact, address, social, currency, and commerce-toggle configuration remains in code/environment configuration. It is not migrated to Payload in Phase 25A.
