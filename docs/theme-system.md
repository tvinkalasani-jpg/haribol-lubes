# Public theme system

The public Haribol website supports `system`, `light`, and `dark` preferences. `system` is the default and remains the stored preference while the resolved appearance follows `prefers-color-scheme`. The single functional preference key is `haribol-theme`; it is not analytics data and does not require a marketing-consent banner.

## Rendering and flash prevention

The website layout includes a small inline script in `<head>`. Before the body paints, it validates the stored preference, resolves System against the OS, and sets `data-theme="light|dark"` plus `data-theme-preference="system|light|dark"` on `<html>`. The `<html>` element suppresses only this expected attribute difference during hydration. Public content remains server/static rendered.

Without JavaScript, semantic defaults remain dark and a `prefers-color-scheme: light` fallback supplies the light palette. Manual selection naturally requires JavaScript.

## Synchronization

The control stores the chosen preference, including the literal value `system`. While System is selected, a media-query listener updates the resolved appearance when the OS changes. Light or Dark overrides ignore OS changes until System is selected again. A small same-window event keeps the desktop and mobile controls synchronized; `localStorage` persists across refreshes and route navigation.

## Semantic tokens

Components use shared tokens for background, raised and muted surfaces, foreground levels, borders, accent states, focus, panels, inputs, overlays, header surfaces, shadows, and Mastermax accents. New components should use these tokens rather than theme checks or dark-only hexadecimal colors.

The dark palette preserves graphite backgrounds, off-white type, brass accents, and restrained Mastermax orange. The light palette uses mineral off-white, warm stone surfaces, graphite type, muted charcoal, brass with AA-safe darker text usage, and a darker Mastermax orange. Raster product imagery is never inverted.

## Component decisions

The header follows the selected theme. Its dropdown and mobile navigation use theme surfaces. The footer deliberately remains a dark brand anchor in both themes and locally scopes its contrast tokens. Technical panels may remain visually deeper, but general page surfaces, forms, filters, Product Finder cards, enquiry states, and public navigation adapt through semantic tokens.

The selector is a compact menu with local monitor, sun, and moon SVGs. It exposes an expanded state, a menu of checked radio choices, keyboard focus, Escape handling, outside-click dismissal, and focus return. The mobile control uses a full-width comfortable target.

## Accessibility and motion

Theme choices have accessible names and checked states. Focus uses the brass focus token. Text, borders, inputs, errors, success states, and Mastermax orange use theme-specific contrast values. Theme application has no global color animation, so it does not create a large flash and respects existing reduced-motion rules.

## Payload isolation

The public tokens are imported only by `src/app/(website)/layout.tsx`. Payload admin uses its own layout and `custom.css`; it does not receive the public theme script, control, attributes, or token stylesheet.
