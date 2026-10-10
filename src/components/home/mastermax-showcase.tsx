import Image from "next/image";

import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { mastermaxBrand } from "@/data/brands";
import { mastermaxCatalogueTaxonomy } from "@/data/mastermax-catalogue";

import styles from "./mastermax-showcase.module.css";

export function MastermaxShowcase() {
  return (
    <section className={styles.section} aria-labelledby="mastermax-showcase-title">
      <PageContainer className={styles.container} size="wide">
        <header className={styles.heading}>
          <p className={styles.eyebrow}>
            <span>07</span>
            Mastermax Range
          </p>
          <div className={styles.headingGrid}>
            <h2 id="mastermax-showcase-title">
              Built for automotive, commercial and <span>industrial applications.</span>
            </h2>
            <p>
              Mastermax brings together engine, hydraulic, transmission, compressor,
              industrial and grease products within Haribol Lubes Limited&apos;s current
              lubricant range.
            </p>
          </div>
        </header>

        <div className={styles.showcaseShell}>
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
              </label>
            ))}
          </fieldset>

          <div className={styles.panelStack}>
            {mastermaxCatalogueTaxonomy.map((group, index) => (
              <article
                aria-labelledby={`mastermax-panel-title-${group.id}`}
                className={styles.productPanel}
                data-group={group.id}
                id={`mastermax-panel-${group.id}`}
                key={group.id}
              >
                <div className={styles.productVisual}>
                  <div className={styles.visualMeta} aria-hidden="true">
                    <span>Mastermax / {String(index + 1).padStart(2, "0")}</span>
                    <span>Catalogue-derived</span>
                  </div>
                  <div className={styles.imageStage}>
                    <div className={styles.imageGlow} aria-hidden="true" />
                    <Image
                      alt={group.image.alt}
                      className={styles.productImage}
                      height={760}
                      sizes="(max-width: 768px) 88vw, (max-width: 1024px) 58vw, 46vw"
                      src={group.image.src}
                      width={640}
                    />
                    <span className={styles.visualCategory} aria-hidden="true">
                      {group.category}
                    </span>
                  </div>
                  <p className={styles.visualNote}>Catalogue visual reference · technical details require verification</p>
                </div>

                <div className={styles.productDetails}>
                  <div className={styles.brandLine}>
                    <span>{mastermaxBrand.name}</span>
                    <p>Haribol Lubes Limited</p>
                  </div>
                  <p className={styles.technicalLabel}>{group.subCategory}</p>
                  <h3 id={`mastermax-panel-title-${group.id}`}>{group.category}</h3>
                  <p className={styles.description}>{group.description}</p>

                  <div className={styles.gradesBlock}>
                    <span>Selected catalogue entries</span>
                    <ul>
                      {group.knownGrades.slice(0, group.displayGradeCount).map((grade) => (
                        <li key={grade}>{grade}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.verification}>
                    <span>Source status</span>
                    <p>Catalogue-derived · Technical verification required</p>
                  </div>

                  <a
                    className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
                    href={group.futureHref}
                  >
                    View Range
                    <ArrowRightIcon />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <div>
            <span>Current featured lubricant brand</span>
            <p>Six catalogue-supported product groups prepared for future catalogue expansion.</p>
          </div>
          <a
            className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`}
            href={mastermaxBrand.futureHref}
          >
            Explore Mastermax Range
            <ArrowRightIcon />
          </a>
        </footer>
      </PageContainer>
    </section>
  );
}
