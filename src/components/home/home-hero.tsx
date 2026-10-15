import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";

import { HeroIndustrialVisual } from "./hero-industrial-visual";

import styles from "./home-hero.module.css";

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
              <WhatsAppLink
                className={styles.whatsappAction}
                context={{ type: "general" }}
                source="homepage"
              >
                WhatsApp Sales
                <ArrowRightIcon />
              </WhatsAppLink>
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

          <HeroIndustrialVisual />
        </PageContainer>

        <div className={styles.scrollCue} aria-hidden="true">
          <span>Scroll to discover</span>
          <i />
        </div>
      </section>

    </div>
  );
}
