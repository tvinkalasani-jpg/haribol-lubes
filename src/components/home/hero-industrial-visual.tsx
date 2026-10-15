import { HeroVisualEnhancer } from "./hero-visual-enhancer";
import styles from "./home-hero.module.css";

const VISUAL_ID = "haribol-hero-industrial-visual";
const rollerAngles = Array.from({ length: 12 }, (_, index) => index * 30);
const gearAngles = Array.from({ length: 14 }, (_, index) => index * (360 / 14));

export function HeroIndustrialVisual() {
  return (
    <div
      id={VISUAL_ID}
      className={styles.visual}
      aria-hidden="true"
      data-hero-visual="industrial-bearing"
      data-motion-state="static"
      data-visual-slot="hero"
    >
      <span className={styles.visualLabel}>Lubrication system</span>
      <span className={styles.visualIndex}>HL / 01</span>

      <div className={styles.visualAssembly}>
        <svg
          className={styles.instrument}
          viewBox="0 0 760 720"
          focusable="false"
          role="presentation"
        >
          <defs>
            <radialGradient id="hero-bearing-face" cx="38%" cy="30%" r="72%">
              <stop offset="0" stopColor="#7d8586" />
              <stop offset="0.28" stopColor="#343b3d" />
              <stop offset="0.7" stopColor="#171c1e" />
              <stop offset="1" stopColor="#080a0b" />
            </radialGradient>
            <linearGradient id="hero-bearing-rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#eff0eb" stopOpacity="0.76" />
              <stop offset="0.2" stopColor="#555d5f" stopOpacity="0.72" />
              <stop offset="0.55" stopColor="#181d1f" stopOpacity="0.94" />
              <stop offset="0.82" stopColor="#899092" stopOpacity="0.42" />
              <stop offset="1" stopColor="#111517" stopOpacity="0.92" />
            </linearGradient>
            <linearGradient id="hero-lubricant" x1="0" y1="0" x2="1" y2="0.9">
              <stop offset="0" stopColor="#f4d57d" stopOpacity="0.08" />
              <stop offset="0.24" stopColor="#e0a52b" stopOpacity="0.92" />
              <stop offset="0.62" stopColor="#ad6e13" stopOpacity="0.8" />
              <stop offset="1" stopColor="#6e3c05" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="hero-lubricant-edge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff2c0" stopOpacity="0" />
              <stop offset="0.48" stopColor="#fff2c0" stopOpacity="0.72" />
              <stop offset="1" stopColor="#e0a52b" stopOpacity="0" />
            </linearGradient>
            <filter id="hero-assembly-shadow" x="-35%" y="-35%" width="170%" height="180%">
              <feDropShadow dx="0" dy="26" stdDeviation="28" floodColor="#020303" floodOpacity="0.48" />
            </filter>
          </defs>

          <g className={styles.blueprintLayer}>
            <circle cx="378" cy="344" r="306" />
            <circle cx="378" cy="344" r="276" />
            <path d="M378 18v48M378 622v48M52 344h48M656 344h48" />
            <path d="M148 114l34 34m426-34-34 34M148 574l34-34m426 34-34-34" />
            <path d="M60 610h184M516 88h184" />
          </g>

          <g className={styles.mechanicalAssembly} filter="url(#hero-assembly-shadow)">
            <circle className={styles.backPlate} cx="378" cy="344" r="242" />
            <circle className={styles.outerRim} cx="378" cy="344" r="224" />
            <circle className={styles.outerRimHighlight} cx="378" cy="344" r="216" />
            <circle className={styles.bearingFace} cx="378" cy="344" r="190" />

            <g className={styles.rollerCage}>
              <circle className={styles.rollerTrack} cx="378" cy="344" r="151" />
              {rollerAngles.map((angle) => (
                <rect
                  key={angle}
                  className={styles.roller}
                  x="365"
                  y="181"
                  width="26"
                  height="58"
                  rx="13"
                  transform={`rotate(${angle} 378 344)`}
                />
              ))}
            </g>

            <circle className={styles.innerRace} cx="378" cy="344" r="102" />
            <circle className={styles.shaftFace} cx="378" cy="344" r="68" />
            <circle className={styles.shaftBore} cx="378" cy="344" r="31" />
            <path className={styles.shaftKey} d="M371 312h14v34h-14z" />

            <g transform="translate(552 490)">
              <g className={styles.gearAssembly}>
                {gearAngles.map((angle) => (
                  <rect
                    key={angle}
                    className={styles.gearTooth}
                    x="-8"
                    y="-72"
                    width="16"
                    height="27"
                    rx="2"
                    transform={`rotate(${angle})`}
                  />
                ))}
                <circle className={styles.gearFace} r="54" />
                <circle className={styles.gearHub} r="20" />
                <path className={styles.gearSpokes} d="M0-45V-20M45 0H20M0 45V20M-45 0h25" />
              </g>
            </g>
          </g>

          <g className={styles.lubricantLayer}>
            <path
              className={styles.oilRibbonShadow}
              d="M166 387C179 213 333 101 499 156c94 31 164 112 183 207-47-76-124-127-213-137-128-14-250 53-303 161Z"
            />
            <path
              className={styles.oilRibbon}
              d="M157 368C189 211 342 113 495 164c83 28 149 94 177 176-54-69-132-111-217-112-124-2-237 55-298 140Z"
            />
            <path
              className={styles.oilRibbonEdge}
              d="M190 320c57-108 186-167 304-121 48 19 91 53 122 96"
            />
            <circle className={styles.oilDroplet} cx="636" cy="308" r="8" />
          </g>

          <g className={styles.readoutLayer}>
            <path d="M80 498h100l32-32" />
            <circle cx="220" cy="458" r="4" />
            <path d="M555 166l34-34h94" />
            <circle cx="547" cy="174" r="4" />
            <path d="M575 574h113" />
            <circle cx="562" cy="574" r="4" />
          </g>
        </svg>

        <span className={styles.depthPlane} />
        <span className={styles.lightSweep} />
      </div>

      <span className={styles.visualCaption}>Bearing / Film / Load</span>
      <span className={styles.visualCoordinate}>Mlolongo · KE</span>
      <HeroVisualEnhancer targetId={VISUAL_ID} />
    </div>
  );
}
