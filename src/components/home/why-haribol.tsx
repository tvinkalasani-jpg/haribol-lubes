import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { valuePropositions } from "@/data/value-propositions";

import styles from "./why-haribol.module.css";

function SupplyPathVisual() {
  return (
    <div className={styles.supplyPath} aria-hidden="true">
      <div className={styles.pathMeta}>
        <span>Supply framework</span>
        <span>HL / KE</span>
      </div>

      <svg viewBox="0 0 620 330" role="presentation">
        <path className={styles.guide} d="M40 165h540M125 50v230M310 50v230M495 50v230" />
        <path className={styles.route} d="M72 218C160 218 171 102 274 102s103 116 206 116h68" pathLength="1" />
        <path className={styles.routeEcho} d="M72 234c100 0 110-92 202-92 96 0 112 92 206 92h68" />
        <g className={styles.pathNodes}>
          <circle cx="72" cy="218" r="8" />
          <circle cx="274" cy="102" r="8" />
          <circle cx="480" cy="218" r="8" />
          <circle cx="548" cy="218" r="12" />
        </g>
        <g className={styles.measurements}>
          <path d="M72 276h202M72 268v16M274 268v16M320 62h228M320 54v16M548 54v16" />
        </g>
      </svg>

      <div className={styles.pathLabels}>
        <span className={styles.labelLocation}>Mlolongo</span>
        <span className={styles.labelSourcing}>International sourcing</span>
        <span className={styles.labelSelection}>Product selection</span>
        <span className={styles.labelEnquiry}>Enquiry</span>
      </div>

      <p>
        <span>01</span>
        Market access
        <i />
        Product range
        <i />
        Direct enquiry
      </p>
    </div>
  );
}

export function WhyHaribol() {
  return (
    <section className={styles.section} aria-labelledby="why-haribol-title">
      <PageContainer className={styles.container} size="wide">
        <header className={styles.heading}>
          <p className={styles.eyebrow}>
            <span>05</span>
            Why Haribol
          </p>
          <div className={styles.headingGrid}>
            <h2 id="why-haribol-title">
              A practical partner for <span>lubricant supply and product selection.</span>
            </h2>
            <p>
              Haribol Lubes combines local market access in Kenya with
              international sourcing and a structured approach to automotive and
              industrial lubricant requirements.
            </p>
          </div>
        </header>

        <div className={styles.architecture}>
          <div className={styles.manifesto}>
            <p className={styles.manifestoLabel}>Operating principle / 01</p>
            <p className={styles.manifestoStatement}>
              One supply conversation, structured around the{" "}
              <span>application in front of you.</span>
            </p>
            <SupplyPathVisual />
          </div>

          <ol className={styles.values} aria-label="Haribol Lubes value propositions">
            {valuePropositions.map((value) => (
              <li key={value.id}>
                <span className={styles.valueNumber}>{value.id}</span>
                <div>
                  <span className={styles.valueCode}>{value.code}</span>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <footer className={styles.footer}>
          <div>
            <span>Lubricant supply enquiries</span>
            <p>Mlolongo, Kenya</p>
          </div>
          <div className={styles.actions}>
            <a
              className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
              href="/request-a-quote"
            >
              Request a Quote
              <ArrowRightIcon />
            </a>
            <a
              className={`${buttonStyles.button} ${buttonStyles.text} ${buttonStyles.large}`}
              href="/contact"
            >
              Contact Haribol
              <ArrowRightIcon />
            </a>
          </div>
        </footer>
      </PageContainer>
    </section>
  );
}
