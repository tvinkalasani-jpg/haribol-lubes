# Public theme system

The public Haribol website supports two explicit appearances: `light` and `dark`. Light is the brand default and the deterministic server-rendered fallback. The functional preference key is `haribol-theme`; it is not analytics data and does not require a marketing-consent banner.

## Rendering and flash prevention

The website and global not-found layouts render `<html data-theme="light" data-theme-preference="light">`. A small inline script in `<head>` reads the saved value before the body paints and changes both attributes only when the saved value is `dark`. Missing, malformed, or legacy values such as `system` resolve to light. Invalid stored values are replaced with `light` when storage is available.

The script also sets the native `color-scheme` value. The layout suppresses only the expected pre-hydration attribute difference for a returning dark-mode visitor. Without JavaScript the site remains fully readable in light mode, and the initial theme never depends on an operating-system media query.

## Control and persistence

The header exposes a labelled `Light | Dark` segmented control on desktop and inside the mobile menu. Each option is a native button with an `aria-pressed` state, a visible text label, a check mark in the active option, a comfortable target, and a visible focus ring. Selection applies immediately and stores only `light` or `dark` in local storage.

A same-window event keeps the desktop and mobile instances synchronized. Normal document persistence carries the selected appearance across client and full-page navigation. There is no operating-system listener or third theme state.

## Semantic tokens

Shared tokens describe page backgrounds, raised and muted surfaces, foreground levels, borders, accent states, focus, panels, inputs, overlays, header surfaces, status colours, shadows, and Mastermax accents. Components consume those roles instead of switching themes themselves. Light values are defined on `:root`; `[data-theme="dark"]` supplies the dark override.

The light palette uses mineral ivory surfaces, graphite text, charcoal secondary text, AA-safe brass, restrained burnt orange, and stronger functional-control borders. The dark palette retains graphite backgrounds, off-white type, warm brass, and restrained Mastermax orange. Raster product imagery is never inverted.

The footer and Mastermax homepage showcase are intentional dark brand anchors in both appearances and scope the contrast tokens they need. General page surfaces, forms, filters, Product Finder cards, enquiry states, and public navigation follow the selected theme.

## Payload isolation

Public theme styles are imported only by the website layout. Payload admin uses its own layout and `custom.css`; it does not receive the public initialization script, controls, attributes, or token stylesheet.
