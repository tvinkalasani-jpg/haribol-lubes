import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";

import styles from "./product-finder-feature.module.css";

const selectionPath = [
  { index: "01", label: "Application", value: "Where will the lubricant work?" },
  { index: "02", label: "Requirement", value: "What equipment or system is involved?" },
  { index: "03", label: "Catalogue", value: "Review relevant product pathways." },
] as const;

export function ProductFinderFeature() {
  return (
    <section className={styles.section} aria-labelledby="product-finder-feature-title">
      <PageContainer className={styles.container} size="wide">
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span>06</span>Guided selection</p>
          <h2 id="product-finder-feature-title">
            Start with the application. <span>Find a clearer route through the catalogue.</span>
          </h2>
          <p>
            Use structured questions to narrow Haribol&apos;s automotive and industrial
            product categories before confirming suitability for the actual equipment,
            specification and operating conditions.
          </p>
          <a
            className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`}
            href="/product-finder"
          >
            Open Product Finder
            <ArrowRightIcon />
          </a>
        </div>

        <div className={styles.instrument} aria-label="Product Finder selection path">
          <div className={styles.instrumentHeader}>
            <span>Selection sequence</span>
            <span>PF / 01—03</span>
          </div>
          <ol>
            {selectionPath.map((step) => (
              <li key={step.index}>
                <span className={styles.stepIndex}>{step.index}</span>
                <span className={styles.stepCopy}>
                  <strong>{step.label}</strong>
                  <small>{step.value}</small>
                </span>
                <span className={styles.stepIndicator} aria-hidden="true" />
              </li>
            ))}
          </ol>
          <div className={styles.instrumentFooter} aria-hidden="true">
            <span>Input</span><i /><span>Filter</span><i /><span>Review</span>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
