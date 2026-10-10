import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";

import styles from "./quote-cta.module.css";

export function QuoteCta() {
  return (
    <section className={styles.section} aria-labelledby="quote-cta-title">
      <PageContainer className={styles.container} size="wide">
        <div className={styles.frame}>
          <div className={styles.statement}>
            <div className={styles.sectionMeta} aria-hidden="true">
              <span>HL / 08</span>
              <span>Commercial Enquiries</span>
            </div>

            <p className={styles.eyebrow}>
              <span>08</span>
              Ready to talk?
            </p>
            <h2 id="quote-cta-title">Need lubricants for your business?</h2>
            <p className={styles.introduction}>
              Tell {siteConfig.companyName} what you need and our sales team can help you
              identify the relevant product range, packaging requirement and next step.
            </p>

            <div className={styles.context}>
              <span>{siteConfig.city}, {siteConfig.country}</span>
              <span>Automotive · Commercial · Industrial</span>
            </div>
          </div>

          <aside className={styles.actions} aria-label="Sales enquiry options">
            <div className={styles.actionHeader}>
              <span>Start an enquiry</span>
              <span>01—02</span>
            </div>

            <p className={styles.microcopy}>
              For bulk requirements, product selection, trade supply or general lubricant
              enquiries.
            </p>

            <div className={styles.actionList}>
              <ButtonLink
                className={styles.primaryAction}
                href="/request-a-quote"
                iconRight={<ArrowRightIcon />}
                size="large"
                variant="primary"
              >
                Request a Quote
              </ButtonLink>

              <ButtonLink
                className={styles.secondaryAction}
                href="/contact"
                iconRight={<ArrowRightIcon />}
                size="large"
                variant="ghost"
              >
                Contact Haribol
              </ButtonLink>

              <WhatsAppLink className={`${styles.secondaryAction} ${styles.whatsappAction}`} context={{ type: "general" }} source="homepage">
                <span>WhatsApp Sales</span><ArrowRightIcon />
              </WhatsAppLink>
            </div>

            <p className={styles.actionNote}>Tell us the application, volume or product range you need.</p>
          </aside>

          <div className={styles.technicalMark} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
