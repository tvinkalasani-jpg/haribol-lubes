# WhatsApp deep-link integration

Phase 24 provides contextual `wa.me` links only. It does not load a WhatsApp SDK, create a chatbot, send outbound messages, or call the WhatsApp Business Platform.

## Configuration

The business-verified Haribol number is configured as `NEXT_PUBLIC_WHATSAPP_NUMBER=+254 794 205 115`. Human-friendly formatting is accepted and normalizes to `254794205115`. When an override is missing, the verified centralized default is used; when a supplied value is invalid, every WhatsApp link returns `null` and its UI disappears.

Normalization removes allowed presentation characters, converts a ten-digit Kenyan local number beginning with `0` to country code `254`, accepts 8–15 final digits, and rejects alphabetic content, misplaced plus signs, and implausible lengths. Only the normalized digits appear in `https://wa.me/[digits]`.

## Contextual messages

- General: `Hello Haribol Lubes, I would like to make an enquiry.`
- Product: `Hello Haribol Lubes, I would like to enquire about Mastermax Engine Oils.` followed by the trusted product name and canonical page URL.
- Category: `Hello Haribol Lubes, I would like to enquire about Engine Oils.`
- Industry: `Hello Haribol Lubes, I would like to discuss lubricant requirements for manufacturing.`
- Product Finder: `Hello Haribol Lubes, I used the Product Finder and would like to ask about Mastermax Hydraulic Oils.` An already visible catalogue grade may be included.
- RFQ: `Hello Haribol Lubes, I submitted quotation request RFQ-2026-ABC123 and would like to follow up.`

Messages are encoded with `encodeURIComponent`. Names and context come from trusted catalogue or route data. RFQ follow-up accepts only the public reference pattern and never includes customer contact details, company, quantity, location, or message.

## Placement and behavior

When configured, WhatsApp appears in the homepage closing CTA, contact direct-method module, product hero and final enquiry area, category final enquiry area, industry final CTA, Product Finder result actions, RFQ success state, and footer contact details. It is omitted from the primary header, product search cards, and all floating UI.

Links open only after an intentional user click, use `noopener noreferrer`, and do not trigger third-party requests during rendering. Styling uses the existing graphite and brass system.

## Analytics readiness

Links expose `data-analytics-event="whatsapp_clicked"` and a controlled `data-whatsapp-source` value. Context may later include trusted product, category, industry, and source slugs. Personal details and RFQ references must not be forwarded to analytics.

## Future Business Platform migration

The current message builder and typed contexts can later feed a provider adapter for Meta WhatsApp Business Platform. A later phase may add approved templates, inbound webhooks, CRM linkage, RFQ-reference matching, delivery status, and agent workflows. No webhook route or platform credential exists in this phase.
