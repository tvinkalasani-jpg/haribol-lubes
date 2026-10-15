# Motion, mobile and accessibility system

Phase 31J is a focused sitewide refinement pass. It preserves the approved information architecture, page compositions, catalogue data, RFQ contract, WhatsApp behavior and disabled-commerce boundary.

## Motion audit

### Useful motion

- Header and navigation transitions communicate open, closed and scrolled states.
- Product category, Product Finder and Mastermax responses reinforce an interactive selection or navigation result.
- Form loading feedback communicates a pending submission.
- Focus movement after form validation directs keyboard and assistive-technology users to the result.

### Decorative motion

- The homepage hero scan, rotating engineering rings, lubrication pulse and light sweep provide atmosphere.
- Homepage section reveals, map signal and technical illustration responses add visual continuity.
- Decorative motion never carries the only copy, status or navigation meaning.

### Removed or constrained motion

- Coarse pointers do not receive desktop-only underline or decorative hover behavior in the header.
- Short mobile landscapes use a compact static menu composition.
- Reduced motion reduces all animation and transition duration globally, disables smooth scrolling and prevents repeating animation. Local component rules also remove transforms where a final static state is required.
- No motion was found that required a new JavaScript controller. No autoplay video, WebGL runtime or animation dependency was added.

### Timing rules

The shared motion scale is 120ms for immediate feedback, 220ms for ordinary state changes, 420ms for larger transitions and 700ms for deliberate reveals. Standard easing is used for state changes; emphasized easing is reserved for spatial movement. Longer ambient hero loops remain intentionally slow and are disabled by reduced motion and constrained on mobile.

## Mobile behavior

- Verified widths: 320, 360, 390, 430, 480, 768, 1024, 1440 and 1920 pixels in Light and Dark themes.
- A short landscape viewport of 844 by 390 pixels was verified on every audited route in both themes.
- Fixed mobile layers account for top and bottom safe-area insets.
- The mobile navigation remains scrollable, contains focus, closes with Escape, restores focus and compacts vertically on short screens.
- Mobile form fields use a 16px minimum text size to avoid browser zoom.
- Fixed filter actions and the footer account for bottom safe areas.
- Long text may wrap without forcing horizontal page overflow.

## Accessibility rules

- The page shell provides a skip link and one semantic `main` landmark.
- Focus-visible styling uses a 3px semantic focus colour and is not dependent on hover.
- Buttons, form fields and audited navigation controls meet the 44px target baseline. Breadcrumb links now provide a 44px vertical target.
- Light and Dark theme controls have visible labels, pressed state and 44px targets.
- Forms retain programmatic labels, autocomplete values, invalid states, described errors and focused status feedback.
- Headings retain one visible `h1` per page without skipped levels in the audited routes.
- Images retain explicit alternative text; decorative images use an empty alternative.
- Current location, selected state, errors and form status are communicated through text or semantics as well as colour.
- Hover treatments have keyboard focus equivalents, and coarse-pointer layouts do not depend on hover.

## Automated coverage

`pnpm validate:motion-accessibility` performs 35 source-level checks for motion tokens, reduced-motion coverage, semantic landmarks, focus behavior, mobile safe areas, keyboard menu behavior and form semantics.

`pnpm qa:motion-accessibility-browser` verifies 220 route/theme/viewport states, eight keyboard flows, the mobile menu and reduced motion. It checks horizontal overflow, one main and one visible h1, duplicate IDs, missing image alternatives, accessible control names, form labels, heading jumps, 44px controls and accidental commerce language.

The browser matrix covers the homepage, products, a product detail page, industries, an industry detail page, Product Finder, about, contact, resources, insights and RFQ. It produced no browser errors.

## Lighthouse medians

Each target was measured three times using the Lighthouse mobile profile and simulated throttling. Values below are medians.

| Target | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage Light | 93 | 100 | 100 | 66 | 1604ms | 283ms | 0 |
| Homepage Dark | 93 | 100 | 100 | 66 | 1713ms | 283ms | 0 |
| Product detail Light | 90 | 100 | 100 | 69 | 1153ms | 401ms | 0 |
| Industries Light | 94 | 100 | 100 | 66 | 1068ms | 275ms | 0 |
| Contact Light | 77 | 100 | 100 | 66 | 1478ms | 1084ms | 0 |
| RFQ Light | 80 | 100 | 100 | 66 | 1279ms | 880ms | 0 |

Contact and RFQ are limited by style/layout work on their long form-oriented documents. Lighthouse attributes the median contact main-thread work primarily to Style & Layout (about 2.2 seconds), with about 315ms of script evaluation; RFQ shows about 1.7 seconds of Style & Layout and 340ms of script evaluation. There is no third-party work and Lighthouse reports no unused-JavaScript saving. Phase 31J added no client component or runtime motion code, so these results are documented for a later performance-specific pass rather than being hidden by reducing approved content.

The SEO score reflects the intentional pre-launch `noindex` state. Accessibility and Best Practices score 100 for every measured target.

## Visual evidence

Phase 31J artifacts are stored in `docs/phase-31j`. They include mobile Light and Dark homepage captures, mobile product detail, industries, contact and RFQ captures, a short-landscape capture, a desktop homepage capture, the browser audit JSON and all raw Lighthouse reports.

## Regression boundary

The pass does not change business claims, verified location data, catalogue records, RFQ persistence, WhatsApp routing, Payload/PostgreSQL architecture, analytics, payments or commerce state. Commerce remains disabled, and Request Quote remains the primary commercial action.
