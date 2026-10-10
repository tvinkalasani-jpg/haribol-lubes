"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ArrowRightIcon } from "@/components/ui/icons";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import {
  createProductFinderParams,
  findProducts,
  getFinderCategoryOptions,
  getFinderTechnicalOptions,
  getProductFinderStep,
  hydrateProductFinderState,
  parseProductFinderParams,
  type ProductFinderDataset,
  type ProductFinderState,
} from "@/features/catalogue/product-finder";

import styles from "./product-finder.module.css";

type FinderEventName =
  | "product_finder_started"
  | "product_finder_step_completed"
  | "product_finder_result_viewed"
  | "product_finder_no_result"
  | "product_finder_product_selected"
  | "product_finder_quote_clicked";

type ProductFinderProps = {
  dataset: ProductFinderDataset;
  initialState: ProductFinderState;
};

const steps = [
  { number: 1, label: "Application" },
  { number: 2, label: "Product type" },
  { number: 3, label: "Technical detail" },
  { number: 4, label: "Catalogue matches" },
] as const;

function dispatchFinderEvent(name: FinderEventName, detail: Record<string, unknown> = {}) {
  window.dispatchEvent(
    new CustomEvent(`haribol:${name}`, { detail: { event: name, ...detail } }),
  );
}

export function ProductFinder({ dataset, initialState }: ProductFinderProps) {
  const [state, setState] = useState(() => hydrateProductFinderState(dataset, initialState));
  const [draftSelection, setDraftSelection] = useState("");
  const hasInteracted = useRef(false);
  const step = getProductFinderStep(state);
  const categoryOptions = useMemo(
    () => getFinderCategoryOptions(dataset, state.application ?? ""),
    [dataset, state.application],
  );
  const technicalOptions = useMemo(
    () => getFinderTechnicalOptions(dataset, state.application ?? "", state.category ?? ""),
    [dataset, state.application, state.category],
  );
  const results = useMemo(() => findProducts(dataset, state), [dataset, state]);
  const recordInteraction = () => {
    if (hasInteracted.current) {
      return;
    }
    hasInteracted.current = true;
    dispatchFinderEvent("product_finder_started");
  };

  useEffect(() => {
    const handlePopState = () => {
      recordInteraction();
      setState(
        hydrateProductFinderState(
          dataset,
          parseProductFinderParams(new URLSearchParams(window.location.search)),
        ),
      );
      setDraftSelection("");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [dataset]);

  useEffect(() => {
    if (!hasInteracted.current || step !== 4) {
      return;
    }

    if (results.length === 0) {
      dispatchFinderEvent("product_finder_no_result", {
        application: state.application,
        category: state.category,
      });
    } else {
      dispatchFinderEvent("product_finder_result_viewed", {
        resultCount: results.length,
        productIds: results.map((result) => result.record.id),
      });
    }
  }, [results, state.application, state.category, step]);

  const commitState = (nextState: ProductFinderState) => {
    const params = createProductFinderParams(nextState);
    const nextUrl = params.size ? `/product-finder?${params.toString()}` : "/product-finder";
    window.history.pushState({}, "", nextUrl);
    setState(nextState);
    setDraftSelection("");
  };

  const completeStep = () => {
    if (!draftSelection) {
      return;
    }
    recordInteraction();

    if (step === 1) {
      commitState({ application: draftSelection, unsure: false });
    } else if (step === 2) {
      commitState({ ...state, category: draftSelection, technical: undefined, unsure: false });
    } else if (step === 3) {
      if (draftSelection === "unsure") {
        commitState({ ...state, technical: undefined, unsure: true });
      } else {
        const [kind, value] = draftSelection.split(":", 2);
        const technical = technicalOptions.find(
          (option) => option.kind === kind && option.value === value,
        );
        if (!technical) {
          return;
        }
        commitState({ ...state, technical, unsure: false });
      }
    }

    dispatchFinderEvent("product_finder_step_completed", {
      step,
      selection: draftSelection,
    });
  };

  const goBack = () => {
    recordInteraction();
    if (step === 4) {
      commitState({ ...state, technical: undefined, unsure: false });
    } else if (step === 3) {
      commitState({ application: state.application, unsure: false });
    } else if (step === 2) {
      commitState({ unsure: false });
    }
  };

  const startOver = () => {
    recordInteraction();
    commitState({ unsure: false });
  };

  const selectDraft = (value: string) => {
    recordInteraction();
    setDraftSelection(value);
  };

  return (
    <section className={styles.finder} aria-labelledby="finder-workflow-title">
      <aside className={styles.progress} aria-label="Product Finder progress">
        <p>Selection path</p>
        <ol>
          {steps.map((item) => (
            <li
              className={item.number === step ? styles.currentStep : undefined}
              key={item.number}
            >
              <span>{String(item.number).padStart(2, "0")}</span>
              <span>
                {item.label}
                {item.number < step ? <small>Complete</small> : null}
              </span>
              {item.number === step ? <em aria-current="step">Current</em> : null}
            </li>
          ))}
        </ol>
        <div className={styles.supportNote}>
          <span>Need assistance?</span>
          <p>Haribol can help clarify a catalogue enquiry before final selection.</p>
          <Link href="/contact">Contact Haribol</Link>
        </div>
      </aside>

      <div className={styles.workflow}>
        <div className={styles.stepMeta}>
          <span>Step {step} of 4</span>
          <span>{step === 4 ? `${results.length} catalogue match${results.length === 1 ? "" : "es"}` : "Guided selection"}</span>
        </div>

        <div aria-live="polite" className={styles.liveRegion}>
          {step === 1 ? (
            <fieldset aria-describedby="application-help" className={styles.question}>
              <legend id="finder-workflow-title">What are you lubricating?</legend>
              <p id="application-help">
                Choose the application that most closely describes the current requirement.
              </p>
              <div className={styles.optionGrid}>
                {dataset.applications.map((option) => (
                  <label key={option.value}>
                    <input
                      checked={draftSelection === option.value}
                      name="finder-application"
                      onChange={() => selectDraft(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <span className={styles.optionNumber} aria-hidden="true">
                      {String(dataset.applications.indexOf(option) + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                    <span className={styles.optionMark} aria-hidden="true" />
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 2 ? (
            <fieldset aria-describedby="category-help" className={styles.question}>
              <legend id="finder-workflow-title">What type of product are you looking for?</legend>
              <p id="category-help">
                Only product categories connected to {dataset.applications.find((option) => option.value === state.application)?.label ?? "the selected application"} are shown.
              </p>
              <div className={styles.optionGrid}>
                {categoryOptions.map((option, index) => (
                  <label key={option.value}>
                    <input
                      checked={draftSelection === option.value}
                      name="finder-category"
                      onChange={() => selectDraft(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <span className={styles.optionNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.count} current catalogue {option.count === 1 ? "family" : "families"}</small>
                    </span>
                    <span className={styles.optionMark} aria-hidden="true" />
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 3 ? (
            <fieldset aria-describedby="technical-help" className={styles.question}>
              <legend id="finder-workflow-title">Do you know the grade or classification?</legend>
              <p id="technical-help">
                Select a catalogue-listed value if it is known. You can continue without technical detail.
              </p>
              <div className={styles.optionGrid}>
                {technicalOptions.map((option, index) => {
                  const value = `${option.kind}:${option.value}`;
                  return (
                    <label key={value}>
                      <input
                        checked={draftSelection === value}
                        name="finder-technical"
                        onChange={() => selectDraft(value)}
                        type="radio"
                        value={value}
                      />
                      <span className={styles.optionNumber} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.kind === "grade" ? "Grade / viscosity" : "Classification"}</small>
                      </span>
                      <span className={styles.optionMark} aria-hidden="true" />
                    </label>
                  );
                })}
                <label className={styles.unsureOption}>
                  <input
                    checked={draftSelection === "unsure"}
                    name="finder-technical"
                    onChange={() => selectDraft("unsure")}
                    type="radio"
                    value="unsure"
                  />
                  <span className={styles.optionNumber} aria-hidden="true">—</span>
                  <span>
                    <strong>I&apos;m not sure</strong>
                    <small>Show catalogue families without filtering by technical value</small>
                  </span>
                  <span className={styles.optionMark} aria-hidden="true" />
                </label>
              </div>
            </fieldset>
          ) : null}

          {step === 4 ? (
            <div className={styles.results}>
              <header>
                <p>Current catalogue / Selection result</p>
                <h2 id="finder-workflow-title">
                  {results.length ? "Catalogue matches" : "No current catalogue matches"}
                </h2>
                <span>
                  {results.length
                    ? "These product families match the structured selections entered."
                    : "No current catalogue products match all of your selections."}
                </span>
              </header>

              {results.length ? (
                <ol aria-label="Product Finder catalogue matches">
                  {results.map((result, index) => (
                    <li key={result.record.id}>
                      <div className={styles.resultVisual}>
                        {result.record.image ? (
                          <Image
                            alt={result.record.image.alt}
                            fill
                            sizes="(max-width: 48rem) 100vw, 28vw"
                            src={result.record.image.src}
                          />
                        ) : null}
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <div className={styles.resultContent}>
                        <div className={styles.resultMeta}>
                          <span>{result.record.brandName}</span>
                          <span>{result.record.categoryName}</span>
                        </div>
                        <h3>{result.record.name}</h3>
                        <p>{result.record.description}</p>
                        <dl>
                          <div>
                            <dt>Application match</dt>
                            <dd>{result.applicationLabel}</dd>
                          </div>
                          <div>
                            <dt>Technical selection</dt>
                            <dd>{result.technicalLabel ?? "Not specified"}</dd>
                          </div>
                        </dl>
                        <div className={styles.resultActions}>
                          <Link
                            href={result.record.href}
                            onClick={() => dispatchFinderEvent("product_finder_product_selected", { productId: result.record.id })}
                          >
                            View product <ArrowRightIcon />
                          </Link>
                          <Link
                            href={`/request-a-quote?product=${encodeURIComponent(result.record.slug)}`}
                            onClick={() => dispatchFinderEvent("product_finder_quote_clicked", { productId: result.record.id })}
                          >
                            Request Quote
                          </Link>
                          <Link href="/contact">Contact Haribol</Link>
                          <WhatsAppLink
                            context={{ type: "productFinder", productName: result.record.name, technicalSelection: result.technicalLabel ?? undefined }}
                            source="product-finder"
                          >
                            Ask on WhatsApp
                          </WhatsAppLink>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className={styles.emptyState} role="status">
                  <span>00</span>
                  <p>
                    Change one of the selections, browse the full catalogue, or ask Haribol about the requirement.
                  </p>
                  <div>
                    <button onClick={goBack} type="button">Change selections</button>
                    <Link href="/products">Browse all products</Link>
                    <Link href="/contact">Contact Haribol</Link>
                    <Link href="/request-a-quote?source=product-finder">Request a Quote</Link>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className={styles.controls}>
          {step > 1 ? (
            <button onClick={goBack} type="button">Back</button>
          ) : (
            <Link href="/products">Browse catalogue</Link>
          )}
          {step < 4 ? (
            <button disabled={!draftSelection} onClick={completeStep} type="button">
              Continue <ArrowRightIcon />
            </button>
          ) : (
            <button onClick={startOver} type="button">Start over</button>
          )}
        </div>

        <p className={styles.accuracyNote}>
          <strong>Selection guidance</strong>
          This tool narrows the current Haribol catalogue based on the information selected. It does not confirm vehicle, machine or OEM compatibility. Final lubricant selection should be checked against the manufacturer&apos;s specification or confirmed with Haribol.
        </p>
      </div>
    </section>
  );
}
