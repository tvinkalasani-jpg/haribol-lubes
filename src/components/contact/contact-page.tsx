import Link from "next/link";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PageContainer } from "@/components/ui/page-container";
import { SocialLinks } from "@/components/ui/social-links";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { siteConfig } from "@/config/site";
import { createEmailUrl, createPhoneUrl } from "@/lib/utils/contact";
import { normalizeWhatsAppNumber } from "@/lib/utils/whatsapp";
import { contactAnalyticsEvents } from "@/types/enquiry";

import { ContactForm } from "./contact-form";
import styles from "./contact-page.module.css";

const pathways = [
  { index: "01", title: "Request a Quote", description: "For product, quantity, pack-size and commercial supply enquiries.", href: "/request-a-quote", event: contactAnalyticsEvents.quoteClicked },
  { index: "02", title: "Product Selection", description: "For help narrowing the current catalogue before making an enquiry.", href: "/product-finder", event: contactAnalyticsEvents.pathSelected },
  { index: "03", title: "Product & Technical Enquiry", description: "For questions about current categories, grades or technical documentation.", href: "#contact-form", event: contactAnalyticsEvents.pathSelected },
  { index: "04", title: "Bulk / Commercial Enquiry", description: "For workshop, fleet, reseller, transport and industrial requirements.", href: "/request-a-quote", event: contactAnalyticsEvents.quoteClicked },
  { index: "05", title: "General Enquiry", description: "For enquiries that do not fit the dedicated product or quotation routes.", href: "#contact-form", event: contactAnalyticsEvents.pathSelected },
] as const;

export function ContactPageContent() {
  const directMethods = [
    siteConfig.phone && createPhoneUrl(siteConfig.phone) ? { label: "Call Haribol", value: siteConfig.phone, href: createPhoneUrl(siteConfig.phone)!, event: contactAnalyticsEvents.phoneClicked } : undefined,
    siteConfig.publicEmail && createEmailUrl(siteConfig.publicEmail) ? { label: "Email Haribol", value: siteConfig.publicEmail, href: createEmailUrl(siteConfig.publicEmail)!, event: contactAnalyticsEvents.emailClicked } : undefined,
  ].filter((method): method is NonNullable<typeof method> => Boolean(method));
  const hasWhatsApp = Boolean(normalizeWhatsAppNumber(siteConfig.whatsapp));

  return (
    <article className={styles.page}>
      <section className={styles.hero} aria-labelledby="contact-title">
        <PageContainer className={styles.heroContainer} size="wide">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Contact Haribol</p>
              <h1 id="contact-title">Talk to Haribol Lubes Limited</h1>
              <p className={styles.intro}>Whether you are looking for a product, planning a commercial lubricant requirement or need help navigating the current catalogue, start with the enquiry route that best matches your need.</p>
            </div>
            <aside className={styles.heroReference} aria-label="Current contact context">
              <div><span>MLO</span><i /><span>KE</span></div>
              <dl>
                <div><dt>Company base</dt><dd>{siteConfig.city}</dd></div>
                <div><dt>Current market</dt><dd>{siteConfig.country}</dd></div>
                <div><dt>Enquiry routes</dt><dd>05</dd></div>
              </dl>
              <a href="/request-a-quote" data-analytics-event={contactAnalyticsEvents.quoteClicked}>Request a Quote <span aria-hidden="true">↗</span></a>
            </aside>
          </div>
        </PageContainer>
      </section>

      <section className={styles.pathways} aria-labelledby="pathways-title">
        <PageContainer size="wide">
          <header className={styles.sectionHeading}><p><span>01</span>Choose a pathway</p><h2 id="pathways-title">Start with the reason for your enquiry.</h2></header>
          <ol>
            {pathways.map((pathway) => (
              <li key={pathway.index}>
                <a href={pathway.href} data-analytics-event={pathway.event}>
                  <span>{pathway.index}</span><div><h3>{pathway.title}</h3><p>{pathway.description}</p></div><b aria-hidden="true">↗</b>
                </a>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>

      {(directMethods.length > 0 || hasWhatsApp) && (
        <section className={styles.direct} aria-labelledby="direct-title">
          <PageContainer size="wide">
            <header className={styles.sectionHeading}><p><span>02</span>Verified contact methods</p><h2 id="direct-title">Contact Haribol directly.</h2></header>
            <div className={styles.directGrid}>
              {directMethods.map((method) => <a href={method.href} data-analytics-event={method.event} key={method.label}><span>{method.label}</span><strong>{method.value}</strong><b aria-hidden="true">↗</b></a>)}
              <WhatsAppLink context={{ type: "general" }} source="contact"><span>WhatsApp Sales</span><strong>Message the sales team</strong><b aria-hidden="true">↗</b></WhatsAppLink>
            </div>
          </PageContainer>
        </section>
      )}

      <section className={styles.formSection} aria-labelledby="form-title">
        <PageContainer className={styles.formLayout} size="wide">
          <div className={styles.formCopy}>
            <p className={styles.eyebrow}>02 / Enquiry details</p>
            <h2 id="form-title">Prepare a clear product or technical enquiry.</h2>
            <p>Provide a contact method and the information you already know. This front-end form checks the details but does not yet transmit or store them.</p>
            <div className={styles.formGuide}><span>Useful details</span><ul><li>Product or category</li><li>Grade or specification</li><li>Equipment or application</li><li>Quantity or pack size</li></ul></div>
          </div>
          <ContactForm />
        </PageContainer>
      </section>

      <section className={styles.location} aria-labelledby="location-title">
        <PageContainer className={styles.locationGrid} size="wide">
          <section className={styles.locationVisual} aria-label="Verified Haribol business address">
            <div className={styles.mapMeta}><span>Verified location / KE</span><span>MLO · BUSINESS BASE</span></div>
            <div className={styles.contactLocator} aria-hidden="true"><span>●</span><strong>MLOLONGO</strong><small>KENYA / VERIFIED ADDRESS</small></div>
            <address className={styles.contactAddress}><strong>{siteConfig.businessAddress.venue}</strong><span>{siteConfig.businessAddress.street}</span><span>{siteConfig.businessAddress.locality}, {siteConfig.businessAddress.country}</span></address>
          </section>
          <div className={styles.locationCopy}>
            <p className={styles.eyebrow}>03 / Location</p>
            <h2 id="location-title">Operating from Mlolongo. Focused on Kenya.</h2>
            <p>{siteConfig.companyName} operates from the verified address below, with {siteConfig.country} as the current primary market.</p>
            <dl><div><dt>Business address</dt><dd>{siteConfig.businessAddress.formatted}</dd></div><div><dt>Current market</dt><dd>{siteConfig.country}</dd></div>{siteConfig.businessHours && <div><dt>Business hours</dt><dd>{siteConfig.businessHours}</dd></div>}</dl>
            <a className={styles.directionsLink} href={siteConfig.businessAddress.mapsUrl} rel="noopener noreferrer" target="_blank">Get Directions to Haribol Lubes Limited <span aria-hidden="true">↗</span></a>
          </div>
        </PageContainer>
      </section>

      <section className={styles.mastermax} aria-labelledby="mastermax-contact-title">
        <PageContainer className={styles.mastermaxGrid} size="wide">
          <div><p>Current featured brand</p><h2 id="mastermax-contact-title">Mastermax product enquiries.</h2></div>
          <div><p>Browse the current Mastermax range or explore the full product catalogue before beginning a quotation enquiry.</p><div><a href="/brands/mastermax">Explore Mastermax <span aria-hidden="true">↗</span></a><Link href="/products">Browse Products <span aria-hidden="true">↗</span></Link></div></div>
        </PageContainer>
      </section>

      <PageContainer><SocialLinks className={styles.socials} links={siteConfig.socialLinks} /></PageContainer>

      <section className={styles.cta} aria-labelledby="contact-cta-title">
        <PageContainer className={styles.ctaGrid} size="wide">
          <div><p>Commercial requirements</p><h2 id="contact-cta-title">Ready to request a quotation?</h2></div>
          <div><a href="/request-a-quote" data-analytics-event={contactAnalyticsEvents.quoteClicked}>Request a Quote <span aria-hidden="true">↗</span></a><a href="/product-finder">Find a Product <span aria-hidden="true">↗</span></a></div>
        </PageContainer>
      </section>
    </article>
  );
}

