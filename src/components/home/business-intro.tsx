import { PageContainer } from "@/components/ui/page-container";
import { siteConfig } from "@/config/site";

import styles from "./business-intro.module.css";

const pillars = [
  {
    index: "01",
    title: "Automotive",
    description:
      "Lubrication solutions for vehicles, workshops and transport applications.",
  },
  {
    index: "02",
    title: "Industrial",
    description:
      "Lubricants for machinery, equipment and industrial systems.",
  },
  {
    index: "03",
    title: "Specialty",
    description:
      "Specialty lubricants and application-specific products for targeted maintenance and operating requirements.",
  },
] as const;

function BusinessModelVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.visualMeta}>
        <span>Haribol / Operating model</span>
        <span>MLO · KE</span>
      </div>

      <svg
        className={styles.diagram}
        viewBox="0 0 560 420"
        role="presentation"
      >
        <defs>
          <linearGradient id="business-flow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E0A52B" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="#E0A52B" stopOpacity="0.9" />
            <stop offset="1" stopColor="#E0A52B" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        <path className={styles.diagramGrid} d="M40 60H520M40 210H520M40 360H520" />
        <path className={styles.diagramGrid} d="M80 30V390M280 30V390M480 30V390" />
        <circle className={styles.outerOrbit} cx="280" cy="210" r="148" />
        <circle className={styles.innerOrbit} cx="280" cy="210" r="88" />
        <path
          className={styles.flowArc}
          d="M154 287A148 148 0 0 1 390 111"
          pathLength="1"
        />
        <path className={styles.connector} d="M173 108 280 210 430 260Z" />

        <g className={styles.node}>
          <circle cx="173" cy="108" r="8" />
          <circle cx="280" cy="210" r="12" />
          <circle cx="430" cy="260" r="8" />
        </g>

        <g className={styles.measurement}>
          <path d="M101 334h94M365 82h94" />
          <path d="M101 327v14M195 327v14M365 75v14M459 75v14" />
        </g>
      </svg>

      <div className={styles.visualLabels}>
        <span className={styles.labelSupply}>Supply</span>
        <span className={styles.labelApplication}>Application</span>
        <span className={styles.labelPerformance}>Performance</span>
      </div>

      <p className={styles.visualCaption}>
        <span>01</span>
        Supply to application
        <i />
        Performance in motion
      </p>
    </div>
  );
}

export function BusinessIntro() {
  return (
    <section className={styles.section} aria-labelledby="business-intro-title">
      <div className={styles.transition} aria-hidden="true">
        <span />
      </div>

      <PageContainer className={styles.container} size="wide">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowIndex}>02</span>
            <span className={styles.eyebrowLabel}>About Haribol</span>
            <i aria-hidden="true" />
            <span className={styles.eyebrowLocation}>{siteConfig.city}, {siteConfig.country}</span>
          </p>

          <h2 id="business-intro-title" className={styles.title}>
            Lubrication solutions built around{" "}
            <span>performance, protection</span> and reliable supply.
          </h2>

          <div className={styles.introduction}>
            <p>
              Haribol Lubes supplies automotive and industrial lubricants across
              Kenya, supporting vehicles, machinery and industrial applications
              from its Mlolongo base.
            </p>
            <p>
              The business focuses on practical product selection and reliable
              supply for automotive, commercial and industrial requirements.
            </p>
          </div>
        </div>

        <BusinessModelVisual />

        <ol className={styles.pillars} aria-label="Haribol Lubes business areas">
          {pillars.map((pillar) => (
            <li key={pillar.title}>
              <span className={styles.pillarIndex}>{pillar.index}</span>
              <div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
