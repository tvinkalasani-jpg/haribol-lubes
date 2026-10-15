# Header and navigation

Phase 31B establishes the public website header as a light-first, fixed navigation surface. The typographic `Haribol / Lubes Limited` wordmark remains the brand identifier; no provisional symbol or image logo is used.

## Information architecture

The primary header sequence is Products, Industries, Product Finder, Resources and About. Products remains a keyboard-operable disclosure for the catalogue categories. Applications and Insights remain available elsewhere in the website information architecture but are intentionally removed from the primary header to reduce crowding and improve task clarity.

Request Quote is the strongest action in both desktop and mobile layouts. WhatsApp is a secondary sales action built with the shared, configuration-driven `WhatsAppLink`, so it is omitted automatically if the configured number becomes invalid. Contact remains available in the mobile utility area and footer.

## Responsive behavior

At wide desktop sizes, the wordmark, centered primary links and right-side utilities form three clear zones. The labelled Light/Dark control, WhatsApp and Request Quote remain visible without wrapping. At 82rem and below, the header switches to the menu treatment rather than squeezing the desktop links into a smaller laptop width.

The mobile and smaller-laptop menu is a full-height dialog below the fixed header. It presents the five primary destinations first, followed by Request Quote, WhatsApp, the Light/Dark control, Contact and the verified business locality, `Mlolongo, Kenya`. The verified physical address is Emerald Business Park, Kutch Rd, Mlolongo, Kenya. At narrow mobile widths the same hierarchy becomes a single column with targets above the 44px baseline.

## Interaction and accessibility

The header starts at 5rem for an open presentation and compacts to the shared 4.5rem header height after 16px of scrolling. The scrolled state uses a more opaque semantic surface, a border, a restrained shadow and a 10px backdrop blur with an opaque fallback. Motion is removed when `prefers-reduced-motion` is enabled.

Both Products disclosures expose `aria-controls` and `aria-expanded`. The mobile overlay is a labelled modal dialog, remains inert while closed, locks background scrolling while open, receives focus on entry, loops keyboard focus through the menu and its persistent close trigger, closes with Escape, and returns focus to the trigger. Current routes expose `aria-current="page"`, including Product descendants through the Products control.

## Validation

Run `pnpm validate:header` for the Phase 31B architecture and accessibility contract. The normal `pnpm lint`, `pnpm type-check`, `pnpm build`, theme, WhatsApp, RFQ and security checks remain required regressions.
