import { PageContainer } from "@/components/ui/page-container";
import { siteConfig } from "@/config/site";
import { featuredBrand } from "@/data/brands";
import { mastermaxCatalogueTaxonomy } from "@/data/mastermax-catalogue";

import styles from "./kenya-presence.module.css";

function LocationReference() {
  return (
    <section className={styles.locationFigure} aria-labelledby="home-location-title">
      <div className={styles.mapMeta}><span>Verified location / KE</span><span>MLO · BUSINESS BASE</span></div>
      <div className={styles.locator} aria-hidden="true"><span className={styles.pin}>●</span><span className={styles.axis} /><strong>MLOLONGO</strong><small>KENYA / VERIFIED ADDRESS</small></div>
      <div className={styles.addressBlock}>
        <p id="home-location-title">Business address</p>
        <address><strong>{siteConfig.businessAddress.venue}</strong><span>{siteConfig.businessAddress.street}</span><span>{siteConfig.businessAddress.locality}, {siteConfig.businessAddress.country}</span></address>
        <a href={siteConfig.businessAddress.mapsUrl} rel="noopener noreferrer" target="_blank">Get Directions <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}

export function KenyaPresence() {
  return (
    <section className={styles.section} aria-labelledby="kenya-presence-title">
      <PageContainer className={styles.container} size="wide">
        <header className={styles.heading}>
          <p className={styles.eyebrow}>
            <span>06</span>
            Kenya Presence
          </p>
          <div className={styles.headingGrid}>
            <h2 id="kenya-presence-title">
              Operating from Mlolongo. <span>Built for Kenya&apos;s automotive and industrial market.</span>
            </h2>
            <p>
              Haribol Lubes Limited operates from Mlolongo, supporting lubricant requirements across automotive, commercial and industrial applications in Kenya.
            </p>
          </div>
        </header>

        <div className={styles.presenceGrid}>
          <LocationReference />

          <aside className={styles.brandPanel} aria-labelledby="featured-brand-title">
            <div className={styles.brandHeader}>
              <p>Featured Brand</p>
              <span>Current / 01</span>
            </div>

            <div className={styles.brandNameLockup}>
              <span aria-hidden="true">MM</span>
              <div>
                <p>Haribol Lubes Limited</p>
                <h3 id="featured-brand-title">{featuredBrand.name}</h3>
              </div>
            </div>

            <p className={styles.brandDescription}>{featuredBrand.shortDescription}</p>

            <ul className={styles.brandCategories} aria-label="Mastermax catalogue groups">
              {mastermaxCatalogueTaxonomy.map((group, index) => (
                <li key={group.category}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {group.category}
                </li>
              ))}
            </ul>

            <div className={styles.brandFooter}>
              <span>Brand architecture</span>
              <p>Structured to support additional brands in future phases.</p>
            </div>
          </aside>
        </div>
      </PageContainer>
    </section>
  );
}
