# Catalogue search architecture

The `/products` catalogue uses a server-prepared, normalized search dataset and a focused client component for filtering and URL state. Product, brand, category, variant, application, industry, specification, and market relationships continue to come from the Phase 15 catalogue records.

## Matching and filters

Search is deterministic and conservative. It prioritizes exact product or family names, product-name tokens, variants, brand, category, grades, specifications, applications, industries, and catalogue keywords. Normalization handles case, spacing, and punctuation differences in technical grades without introducing broad lubricant synonyms.

Selections inside one filter group use OR logic. Different groups use AND logic. Market IDs remain in the browser dataset, but the UI does not expose a market filter while Kenya is the only current market.

## Publication control

`createCatalogueSearchDataset` accepts `includeUnpublished`. The pre-launch catalogue passes `true` so the ten draft records remain reviewable. Public launch can pass `false` to include only records that are both published and indexable without changing the interface.

## URL and SEO

Search and filter state use the `/products` query string. Search typing replaces the current history entry, while filter changes create history entries. Filtered responses canonicalize to `/products` and use `noindex, follow`; the unfiltered catalogue remains indexable.

## Growth path

The current compact dataset is appropriate for tens or low hundreds of records. When serialized catalogue search data or client filtering becomes material to page performance, keep the normalized record and filter-state contracts, move `searchCatalogue` behind a route handler or search service, and return results plus facet counts. The UI and URL model do not need to change.

## Analytics hooks

The client dispatches namespaced browser events without sending them anywhere:

- `haribol:catalogue_search`
- `haribol:catalogue_filter_applied`
- `haribol:catalogue_filter_removed`
- `haribol:catalogue_no_results`
- `haribol:product_result_selected`

An analytics integration can subscribe later without coupling provider code to the catalogue component.
