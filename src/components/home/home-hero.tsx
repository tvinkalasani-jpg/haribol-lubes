import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";

import styles from "./home-hero.module.css";

function LubricationVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <span className={styles.visualLabel}>Engineered flow</span>
      <span className={styles.visualIndex}>HL / 01</span>
      <svg
        className={styles.instrument}
        viewBox="0 0 720 720"
        role="presentation"
      >
        <defs>
          <radialGradient id="hero-core" cx="42%" cy="35%" r="65%">
            <stop offset="0" stopColor="#4b5051" />
            <stop offset="0.46" stopColor="#1b2023" />
            <stop offset="1" stopColor="#090b0c" />
          </radialGradient>
          <linearGradient id="hero-oil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2c65d" stopOpacity="0.08" />
            <stop offset="0.38" stopColor="#e0a52b" stopOpacity="0.9" />
            <stop offset="0.72" stopColor="#8f5b0d" stopOpacity="0.48" />
            <stop offset="1" stopColor="#e0a52b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-metal" x1="0" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor="#d8d9d6" stopOpacity="0.55" />
            <stop offset="0.25" stopColor="#343a3d" stopOpacity="0.15" />
            <stop offset="0.68" stopColor="#8b9294" stopOpacity="0.42" />
            <stop offset="1" stopColor="#202528" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <circle className={styles.outerGuide} cx="360" cy="360" r="302" />
        <circle className={styles.dashedOrbit} cx="360" cy="360" r="268" />

        <g className={styles.rotor}>
          <circle cx="360" cy="360" r="221" fill="url(#hero-core)" />
          <circle className={styles.metalRing} cx="360" cy="360" r="221" />
          <circle className={styles.innerRing} cx="360" cy="360" r="164" />
          <path
            className={styles.oilFilm}
            d="M193 346c35-116 149-180 263-135 91 36 142 129 121 222-12 56-48 104-96 133 34-34 55-80 55-131 0-104-84-188-188-188-63 0-119 31-155 78Z"
            fill="url(#hero-oil)"
          />
          <path
            className={styles.highlightArc}
            d="M216 269c50-86 153-126 247-87 40 16 74 43 99 77"
          />
          <path
            className={styles.metalSweep}
            d="M237 502c-67-69-75-177-18-255 56-77 160-106 248-69-77-10-154 27-194 99-42 75-34 166 18 229Z"
            fill="url(#hero-metal)"
          />
        </g>

        <g className={styles.core}>
          <circle cx="360" cy="360" r="87" />
          <circle cx="360" cy="360" r="54" />
          <path d="M360 310v100M310 360h100" />
        </g>

        <g className={styles.calibrationMarks}>
          <path d="M360 36v23M360 661v23M36 360h23M661 360h23" />
          <path d="m131 131 16 16m426-16-16 16M131 589l16-16m426 16-16-16" />
        </g>

        <g className={styles.readout}>
          <path d="M64 504h96" />
          <circle cx="175" cy="504" r="4" />
          <path d="M559 190h97" />
          <circle cx="545" cy="190" r="4" />
        </g>
      </svg>
      <span className={styles.visualCaption}>Film / Friction / Flow</span>
      <span className={styles.visualCoordinate}>Mlolongo · KE</span>
    </div>
  );
}

export function HomeHero() {
  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-hero-title">
        <div className={styles.environment} aria-hidden="true">
          <span className={styles.grid} />
          <span className={styles.light} />
          <span className={styles.horizon} />
        </div>

        <PageContainer className={styles.heroContainer} size="wide">
          <div className={styles.content}>
            <p className={styles.eyebrow}>
              <span>Haribol Lubes</span>
              <span className={styles.eyebrowRule} aria-hidden="true" />
              <span>Mlolongo, Kenya</span>
            </p>

            <h1 id="home-hero-title" className={styles.title}>
              <span className={styles.qualifier}>
                Automotive &amp; Industrial Lubricants in Kenya
              </span>
              <span className={styles.statement}>
                <span>Powering Motion.</span>
                <span>Protecting Performance.</span>
              </span>
            </h1>

            <p className={styles.supportingCopy}>
              Lubricant supply for vehicles, machinery and commercial operations
              in Kenya.
            </p>

            <div className={styles.actions}>
              {/* Native anchors keep this static hero outside the client navigation bundle. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`}
                href="/products"
              >
                <span>Explore Products</span>
                <ArrowRightIcon />
              </a>
              <a
                className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
                href="/request-a-quote"
              >
                <span>Request a Quote</span>
              </a>
            </div>

            <dl className={styles.capabilities}>
              <div>
                <dt>01</dt>
                <dd>Automotive</dd>
              </div>
              <div>
                <dt>02</dt>
                <dd>Industrial</dd>
              </div>
              <div>
                <dt>03</dt>
                <dd>Technical support</dd>
              </div>
            </dl>
          </div>

          <LubricationVisual />
        </PageContainer>

        <div className={styles.scrollCue} aria-hidden="true">
          <span>Scroll to discover</span>
          <i />
        </div>
      </section>

    </div>
  );
}
