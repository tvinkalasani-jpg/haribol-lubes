# Product Finder architecture

Phase 19 adds a guided catalogue-narrowing workflow at `/product-finder`. It is deliberately separate from the free-text catalogue search at `/products`: search helps visitors retrieve known terms, while the finder guides visitors through structured choices.

## Data and publication

`createProductFinderDataset` reuses the normalized Phase 18 catalogue records and enriches them with technical options derived from product variants and specification records. Applications, categories, grades, classifications, result content, and counts are not duplicated in the component.

The server then projects those shared records into a finder-specific transport shape. Search-only fields such as keywords, industries, markets, alternate variant names, and duplicated display arrays stay on the server instead of being serialized into the finder client boundary.

The pre-launch route passes `includeUnpublished: true` so the ten draft records can be reviewed. Production should change this to `false` when only published, indexable products should appear. The switch does not alter product publication or verification status.

## Matching

The finder applies deterministic intersection logic:

1. the record must contain the selected application;
2. the record's primary category must equal the selected category;
3. when a grade or classification is selected, the record must contain that exact normalized option;
4. when “I'm not sure” is selected, no technical filter is applied;
5. matching records retain catalogue order.

There are no fuzzy rules, synonyms, vehicle compatibility inferences, hidden scores, or suitability claims. Technical choices are offered only from records remaining after the application and category selections.

## URL and SEO

Completed selections are represented as query parameters, for example:

`/product-finder?application=diesel-engines&category=engine-oils&grade=15w-40`

Each completed step creates a browser-history entry. Back, forward, shared links, and Start over use the same state contract. The base route is indexable. Any parameterized state is `noindex, follow` and canonicalizes to `/product-finder`; no answer combinations are generated as static routes or sitemap entries.

## Client boundary and future growth

The page shell, metadata, dataset preparation, and explanatory content remain server-rendered. One client component owns step state, URL history, result filtering, focusable controls, and analytics hook events.

The current normalized dataset is intentionally sent to the browser. If the catalogue grows beyond several hundred product families or the payload becomes material to page performance, the same state and result interfaces can call a server endpoint without changing the four-step UI.

## Analytics hooks

The component emits namespaced browser `CustomEvent` hooks and does not connect to an analytics provider. Hooks remain dormant during hydration and shared-URL restoration; the first event is emitted only after a visitor interacts with the workflow:

- `haribol:product_finder_started`
- `haribol:product_finder_step_completed`
- `haribol:product_finder_result_viewed`
- `haribol:product_finder_no_result`
- `haribol:product_finder_product_selected`
- `haribol:product_finder_quote_clicked`
