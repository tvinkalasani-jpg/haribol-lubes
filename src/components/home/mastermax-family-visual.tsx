import Image from "next/image";

import { mastermaxCatalogueTaxonomy } from "@/data/mastermax-catalogue";

import styles from "./mastermax-showcase.module.css";

const featuredPackGroups = mastermaxCatalogueTaxonomy.slice(0, 4);

export function MastermaxFamilyVisual() {
  return (
    <figure
      aria-labelledby="mastermax-family-caption"
      className={styles.familyVisual}
      data-mastermax-family-visual
    >
      <svg
        aria-hidden="true"
        className={styles.technicalBackdrop}
        focusable="false"
        viewBox="0 0 760 720"
      >
        <g className={styles.backdropGrid}>
          <path d="M64 118H696M64 236H696M64 354H696M64 472H696M64 590H696" />
          <path d="M124 70V650M252 70V650M380 70V650M508 70V650M636 70V650" />
        </g>
        <g className={styles.backdropOrbits}>
          <circle cx="380" cy="360" r="238" />
          <circle cx="380" cy="360" r="168" />
          <path d="M88 520C224 414 316 592 442 470S622 324 690 388" />
        </g>
        <g className={styles.backdropTicks}>
          <path d="M88 96H158M88 96V166M602 624H672M672 554V624" />
          <path d="M106 552H184M576 172H654" />
        </g>
      </svg>

      <div className={styles.familyHalo} aria-hidden="true" />
      <div className={styles.familyBaseline} aria-hidden="true" />

      {featuredPackGroups.map((group, index) => (
        <div
          aria-hidden="true"
          className={`${styles.familyPack} ${styles[`familyPack${index + 1}`]}`}
          data-family-pack={group.id}
          key={group.id}
        >
          <Image
            alt=""
            className={styles.familyPackImage}
            height={900}
            sizes="(max-width: 480px) 42vw, (max-width: 900px) 34vw, 22vw"
            src={group.image.src}
            width={700}
          />
        </div>
      ))}

      <div className={styles.visualReadout} aria-hidden="true">
        <span>MM / FAMILY 01</span>
        <span>CATALOGUE SOURCE</span>
      </div>
      <figcaption id="mastermax-family-caption">
        Catalogue-derived Mastermax product-family imagery
      </figcaption>
    </figure>
  );
}
