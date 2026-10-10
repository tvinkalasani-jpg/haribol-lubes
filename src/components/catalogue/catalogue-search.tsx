"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { ArrowRightIcon } from "@/components/ui/icons";
import {
  catalogueFilterKeys,
  createCatalogueSearchParams,
  emptyCatalogueSearchState,
  hasActiveCatalogueState,
  parseCatalogueSearchParams,
  searchCatalogue,
  type CatalogueFilterGroup,
  type CatalogueFilterKey,
  type CatalogueSearchDataset,
  type CatalogueSearchState,
} from "@/features/catalogue/catalogue-search";

import styles from "./catalogue-search.module.css";

type CatalogueSearchProps = {
  dataset: CatalogueSearchDataset;
  initialState: CatalogueSearchState;
};

type CatalogueEventName =
  | "catalogue_search"
  | "catalogue_filter_applied"
  | "catalogue_filter_removed"
  | "catalogue_no_results"
  | "product_result_selected";

function dispatchCatalogueEvent(name: CatalogueEventName, detail: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent(`haribol:${name}`, {
      detail: { event: name, ...detail },
    }),
  );
}

function FilterControls({
  groups,
  idPrefix,
  state,
  onToggle,
}: {
  groups: readonly CatalogueFilterGroup[];
  idPrefix: string;
  state: CatalogueSearchState;
  onToggle: (key: CatalogueFilterKey, value: string) => void;
}) {
  return (
    <div className={styles.filterGroups}>
      {groups.map((group) => (
        <details key={group.key}>
          <summary>
            <span>{group.label}</span>
            <small>{group.options.length}</small>
          </summary>
          <fieldset>
            <legend className={styles.visuallyHidden}>{group.label}</legend>
            {group.options.map((option) => {
              const id = `${idPrefix}-${group.key}-${option.value}`;
              return (
                <label htmlFor={id} key={option.value}>
                  <input
                    checked={state.filters[group.key].includes(option.value)}
                    id={id}
                    onChange={() => onToggle(group.key, option.value)}
                    type="checkbox"
                  />
                  <span>{option.label}</span>
                  <small>{option.count}</small>
                </label>
              );
            })}
          </fieldset>
        </details>
      ))}
    </div>
  );
}

export function CatalogueSearch({ dataset, initialState }: CatalogueSearchProps) {
  const [state, setState] = useState(initialState);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const results = useMemo(() => searchCatalogue(dataset.records, state), [dataset.records, state]);
  const active = hasActiveCatalogueState(state);
  const selectedFilterCount = catalogueFilterKeys.reduce(
    (count, key) => count + state.filters[key].length,
    0,
  );
  const optionByValue = useMemo(
    () =>
      new Map(
        dataset.filterGroups.flatMap((group) =>
          group.options.map((option) => [
            `${group.key}:${option.value}`,
            { ...option, groupLabel: group.label },
          ] as const),
        ),
      ),
    [dataset.filterGroups],
  );

  useEffect(() => {
    const handlePopState = () => {
      setState(parseCatalogueSearchParams(new URLSearchParams(window.location.search)));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (filterPanelOpen && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!filterPanelOpen && dialog.open) {
      dialog.close();
    }
  }, [filterPanelOpen]);

  useEffect(() => {
    if (!filterPanelOpen) {
      return;
    }

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [filterPanelOpen]);

  useEffect(() => {
    if (results.length === 0) {
      dispatchCatalogueEvent("catalogue_no_results", {
        query: state.query,
        activeFilterCount: selectedFilterCount,
      });
    }
  }, [results.length, selectedFilterCount, state.query]);

  const commitState = (
    nextState: CatalogueSearchState,
    historyMode: "push" | "replace" = "push",
  ) => {
    const params = createCatalogueSearchParams(nextState);
    const nextUrl = params.size ? `/products?${params.toString()}` : "/products";
    window.history[historyMode === "push" ? "pushState" : "replaceState"]({}, "", nextUrl);
    setState(nextState);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    commitState({ ...state, query }, "replace");
    dispatchCatalogueEvent("catalogue_search", { query });
  };

  const toggleFilter = (key: CatalogueFilterKey, value: string) => {
    const currentlySelected = state.filters[key];
    const removing = currentlySelected.includes(value);
    const nextValues = removing
      ? currentlySelected.filter((entry) => entry !== value)
      : [...currentlySelected, value];
    commitState({
      ...state,
      filters: { ...state.filters, [key]: nextValues },
    });
    dispatchCatalogueEvent(
      removing ? "catalogue_filter_removed" : "catalogue_filter_applied",
      { group: key, value },
    );
  };

  const clearAll = () => {
    commitState(emptyCatalogueSearchState);
  };

  const closeDialog = () => {
    setFilterPanelOpen(false);
  };

  const handleDialogClose = () => {
    setFilterPanelOpen(false);
    filterTriggerRef.current?.focus();
  };

  return (
    <section className={styles.catalogue} aria-labelledby="catalogue-search-title">
      <div className={styles.searchBar}>
        <label htmlFor="catalogue-query" id="catalogue-search-title">
          Search the catalogue
        </label>
        <div className={styles.searchControl}>
          <span aria-hidden="true">⌕</span>
          <input
            autoComplete="off"
            id="catalogue-query"
            onChange={handleSearch}
            placeholder="Product, grade, application or classification"
            type="search"
            value={state.query}
          />
        </div>
        <button
          aria-controls="mobile-catalogue-filters"
          aria-expanded={filterPanelOpen}
          className={styles.mobileFilterTrigger}
          onClick={() => setFilterPanelOpen(true)}
          ref={filterTriggerRef}
          type="button"
        >
          Filters
          {selectedFilterCount ? <span>{selectedFilterCount}</span> : null}
        </button>
      </div>

      {active ? (
        <div className={styles.activeFilters} aria-label="Active catalogue filters">
          <span>Active selection</span>
          <div>
            {state.query.trim() ? (
              <button
                onClick={() => commitState({ ...state, query: "" })}
                type="button"
              >
                Search: {state.query}
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
            {catalogueFilterKeys.flatMap((key) =>
              state.filters[key].map((value) => {
                const option = optionByValue.get(`${key}:${value}`);
                return (
                  <button key={`${key}:${value}`} onClick={() => toggleFilter(key, value)} type="button">
                    {option?.groupLabel}: {option?.label ?? value}
                    <span aria-hidden="true">×</span>
                  </button>
                );
              }),
            )}
          </div>
          <button className={styles.clearAll} onClick={clearAll} type="button">
            Clear all
          </button>
        </div>
      ) : null}

      <div className={styles.catalogueGrid}>
        <aside className={styles.filterRail} aria-label="Catalogue filters">
          <header>
            <span>Filter catalogue</span>
            <small>OR within · AND across</small>
          </header>
          <FilterControls
            groups={dataset.filterGroups}
            idPrefix="desktop-filter"
            onToggle={toggleFilter}
            state={state}
          />
        </aside>

        <div className={styles.results}>
          <header className={styles.resultsHeader}>
            <div>
              <p aria-atomic="true" aria-live="polite">
                {results.length} {results.length === 1 ? "product" : "products"}
                {active ? " matching your selection" : " in the current catalogue"}
              </p>
              <span>
                {state.query.trim() ? "Ordered by search relevance" : "Structured catalogue order"}
              </span>
            </div>
          </header>

          {results.length ? (
            <ol className={styles.resultList}>
              {results.map(({ record, matchedOn }, index) => (
                <li key={record.id}>
                  <article className={styles.resultCard}>
                    <a
                      aria-label={`View product details for ${record.name}`}
                      className={styles.resultVisual}
                      href={record.href}
                      onClick={() =>
                        dispatchCatalogueEvent("product_result_selected", {
                          productSlug: record.slug,
                          position: index + 1,
                        })
                      }
                    >
                      {record.image ? (
                        <Image
                          alt={record.image.alt}
                          height={420}
                          sizes="(max-width: 768px) 86vw, 17rem"
                          src={record.image.src}
                          width={360}
                        />
                      ) : null}
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </a>
                    <div className={styles.resultContent}>
                      <div className={styles.resultMeta}>
                        <a href="/brands/mastermax">{record.brandName}</a>
                        <span>{record.categoryName}</span>
                      </div>
                      <h2>
                        <a href={record.href}>{record.name}</a>
                      </h2>
                      <p>{record.description}</p>
                      <div className={styles.resultDetails}>
                        <span>Known catalogue entries</span>
                        <p>
                          {record.variantNames.length
                            ? record.variantNames.slice(0, 4).join(" · ")
                            : "Individual catalogue product"}
                          {record.variantNames.length > 4
                            ? ` · +${record.variantNames.length - 4} more`
                            : ""}
                        </p>
                      </div>
                      <footer>
                        {matchedOn ? (
                          <span className={styles.matchReason}>Matched: {matchedOn}</span>
                        ) : (
                          <span />
                        )}
                        <a href={record.href}>
                          View product
                          <ArrowRightIcon />
                        </a>
                      </footer>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.emptyState} role="status">
              <span aria-hidden="true">00</span>
              <h2>No products currently match these filters.</h2>
              <p>
                The current catalogue returned no matches. Adjust your search or contact Haribol
                to discuss the requirement.
              </p>
              <div>
                <button onClick={clearAll} type="button">Clear filters</button>
                <a href="/contact">Contact Haribol</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <dialog
        aria-labelledby="mobile-filter-title"
        className={styles.filterDialog}
        id="mobile-catalogue-filters"
        onCancel={closeDialog}
        onClose={handleDialogClose}
        ref={dialogRef}
      >
        <div className={styles.dialogHeader}>
          <div>
            <span>Catalogue controls</span>
            <h2 id="mobile-filter-title">Filters</h2>
          </div>
          <button aria-label="Close filters" onClick={closeDialog} ref={closeButtonRef} type="button">
            Close
          </button>
        </div>
        <FilterControls
          groups={dataset.filterGroups}
          idPrefix="mobile-filter"
          onToggle={toggleFilter}
          state={state}
        />
        <div className={styles.dialogFooter}>
          <button onClick={clearAll} type="button">Clear all</button>
          <button onClick={closeDialog} type="button">
            View {results.length} {results.length === 1 ? "product" : "products"}
          </button>
        </div>
      </dialog>
    </section>
  );
}
