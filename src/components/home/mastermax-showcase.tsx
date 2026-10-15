import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { mastermaxBrand } from "@/data/brands";
import { mastermaxCatalogueTaxonomy } from "@/data/mastermax-catalogue";

import { MastermaxFamilyVisual } from "./mastermax-family-visual";
import styles from "./mastermax-showcase.module.css";

export function MastermaxShowcase() {
  return (
    <section
      className={styles.section}
      aria-labelledby="mastermax-showcase-title"
      data-mastermax-showcase
      data-visual-slot="mastermax"
    >
      <PageContainer className={styles.container} size="wide">
        <header className={styles.campaignGrid}>
          <div className={styles.campaignCopy}>
            <p className={styles.eyebrow}>
              <span>04</span>
              Featured owned brand
            </p>
            <h2 id="mastermax-showcase-title">Mastermax</h2>
            <p className={styles.brandStatement}>{mastermaxBrand.shortDescription}</p>
            <p className={styles.ownershipStatement}>
              Mastermax is an owned brand of Haribol Lubes Limited.
            </p>
            <div className={styles.campaignActions}>
              <a
                className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`}
                href={mastermaxBrand.futureHref}
              >
                Explore Mastermax
                <ArrowRightIcon />
              </a>
              <a
                className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
                href="/request-a-quote?source=mastermax-showcase"
              >
                Request a Quote
                <ArrowRightIcon />
              </a>
            </div>
          </div>

          <MastermaxFamilyVisual />
        </header>

        <div className={styles.rangeIntro}>
          <div>
            <span>Product family index</span>
            <h3>Catalogue-supported groups</h3>
          </div>
          <p>
            Review the current Mastermax groups and continue to the relevant product category for
            catalogue details and enquiry options.
          </p>
        </div>

        <div className={styles.rangeInstrument}>
          <fieldset className={styles.selector}>
            <legend>Choose a Mastermax product group</legend>
            {mastermaxCatalogueTaxonomy.map((group, index) => (
              <label className={styles.selectorItem} key={group.id}>
                <input
                  aria-controls={`mastermax-panel-${group.id}`}
                  defaultChecked={index === 0}
                  id={`mastermax-group-${group.id}`}
                  name="mastermax-product-group"
                  type="radio"
                  value={group.id}
                />
                <span className={styles.selectorIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span>{group.category}</span>
                <ArrowRightIcon />
              </label>
            ))}
          </fieldset>

          <div className={styles.panelStack} aria-live="polite">
            {mastermaxCatalogueTaxonomy.map((group) => (
              <article
                aria-labelledby={`mastermax-panel-title-${group.id}`}
                className={styles.productPanel}
                data-mastermax-group={group.id}
                id={`mastermax-panel-${group.id}`}
                key={group.id}
              >
                <div className={styles.panelHeading}>
                  <p>{group.subCategory}</p>
                  <h4 id={`mastermax-panel-title-${group.id}`}>{group.category}</h4>
                </div>
                <p className={styles.description}>{group.description}</p>
                <div className={styles.gradesBlock}>
                  <span>Selected catalogue entries</span>
                  <ul>
                    {group.knownGrades.slice(0, group.displayGradeCount).map((grade) => (
                      <li key={grade}>{grade}</li>
                    ))}
                  </ul>
                </div>
                <a className={styles.rangeLink} href={group.futureHref}>
                  Explore category
                  <ArrowRightIcon />
                </a>
              </article>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <p>Catalogue-derived imagery and product groups · Technical verification required</p>
          <span>Commerce remains enquiry-led</span>
        </footer>
      </PageContainer>
    </section>
  );
}
