import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import {
  industries,
  type IndustryVisualVariant,
} from "@/data/industries";

import styles from "./industries-section.module.css";

function IndustryMark({ variant }: { variant: IndustryVisualVariant }) {
  const paths: Record<IndustryVisualVariant, React.ReactNode> = {
    automotive: (
      <>
        <circle cx="24" cy="24" r="13" />
        <circle cx="24" cy="24" r="5" />
        <path d="M24 5v6M24 37v6M5 24h6M37 24h6" />
      </>
    ),
    workshops: (
      <>
        <path d="M8 38V14h32v24M14 38V21h20v17" />
        <path d="M20 8h8M24 8v13M18 27h12" />
      </>
    ),
    transport: (
      <>
        <path d="M5 15h25l13 9-13 9H5" />
        <path d="M13 10 5 15l8 5M35 28l8-4-8-4" />
      </>
    ),
    fleet: (
      <>
        <path d="M7 12h25M7 24h34M7 36h25" />
        <circle cx="36" cy="12" r="3" />
        <circle cx="12" cy="24" r="3" />
        <circle cx="36" cy="36" r="3" />
      </>
    ),
    manufacturing: (
      <>
        <path d="M7 40V19l11 6V14l11 7V9l12 7v24Z" />
        <path d="M14 32h5M25 32h5M35 32h3" />
      </>
    ),
    construction: (
      <>
        <path d="m6 38 18-30 18 30ZM13 30h22M18 22h12" />
        <path d="M24 8v30" />
      </>
    ),
    agriculture: (
      <>
        <path d="M6 39c8-17 17-26 36-30M13 40c5-11 13-18 27-24" />
        <path d="M10 26h10M19 17v9M23 30h11M29 22v8" />
      </>
    ),
    machinery: (
      <>
        <circle cx="19" cy="24" r="11" />
        <circle cx="19" cy="24" r="4" />
        <circle cx="36" cy="24" r="7" />
        <path d="M30 24h-4M43 24h3" />
      </>
    ),
    wholesale: (
      <>
        <circle cx="9" cy="24" r="4" />
        <circle cx="39" cy="10" r="4" />
        <circle cx="39" cy="38" r="4" />
        <path d="M13 22 35 12M13 26l22 10M9 20V9h18M9 28v11h18" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 48 48" role="presentation">
      {paths[variant]}
    </svg>
  );
}

function IndustryDirectoryVisual() {
  return (
    <aside className={styles.visualPanel} aria-hidden="true">
      <div className={styles.visualMeta}>
        <span>Operating environments</span>
        <span>KE / 09</span>
      </div>

      <svg className={styles.network} viewBox="0 0 560 620" role="presentation">
        <circle className={styles.orbit} cx="280" cy="300" r="190" />
        <circle className={styles.orbitInner} cx="280" cy="300" r="88" />
        <path className={styles.networkLines} d="M280 110 410 163 465 295 412 430 280 490 145 430 95 295 148 163ZM280 110v380M95 295h370M148 163l264 267M410 163 145 430" />
        <path className={styles.activeArc} d="M143 168a190 190 0 0 1 137-58" pathLength="1" />

        {([
          [280, 110],
          [410, 163],
          [465, 295],
          [412, 430],
          [280, 490],
          [145, 430],
          [95, 295],
          [148, 163],
          [280, 300],
        ] as const).map(([cx, cy], index) => (
          <g className={styles.visualNode} key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r={index === 8 ? 13 : 8} />
            <text x={cx} y={cy - 17} textAnchor="middle">
              {String(index + 1).padStart(2, "0")}
            </text>
          </g>
        ))}
      </svg>

      <div className={styles.visualReadout}>
        <span>Vehicle</span>
        <i />
        <span>Equipment</span>
        <i />
        <span>Industry</span>
      </div>
      <p>Lubrication requirements mapped to the application and operating environment.</p>
    </aside>
  );
}

export function IndustriesSection() {
  return (
    <section className={styles.section} aria-labelledby="industries-title">
      <PageContainer className={styles.container} size="wide">
        <header className={styles.heading}>
          <p className={styles.eyebrow}>
            <span>05</span>
            Industries
          </p>
          <div className={styles.headingGrid}>
            <h2 id="industries-title">
              Lubrication support across <span>vehicles, machinery and industry.</span>
            </h2>
            <p>
              Haribol Lubes structures automotive and industrial lubricant
              solutions around the equipment, application and operating
              environment in Kenya.
            </p>
          </div>
        </header>

        <div className={styles.directory}>
          <ol className={styles.industryList} aria-label="Industries">
            {industries.map((industry) => (
              <li key={industry.slug} className={styles[industry.visualVariant]}>
                <a className={styles.industryLink} href={industry.futureHref}>
                  <span className={styles.industryNumber}>{industry.displayIndex}</span>
                  <span className={styles.industryMark} aria-hidden="true">
                    <IndustryMark variant={industry.visualVariant} />
                  </span>
                  <span className={styles.industryContent}>
                    <h3>{industry.name}</h3>
                    <p>{industry.shortDescription}</p>
                  </span>
                  <span className={styles.industryArrow} aria-hidden="true">
                    <ArrowRightIcon />
                  </span>
                </a>
              </li>
            ))}
          </ol>

          <IndustryDirectoryVisual />
        </div>

        <footer className={styles.footer}>
          <p>Sector-led routes for automotive, commercial and industrial requirements.</p>
          {/* Native navigation keeps this section outside the client router bundle. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
            href="/industries"
          >
            Explore Industries
            <ArrowRightIcon />
          </a>
        </footer>
      </PageContainer>
    </section>
  );
}
