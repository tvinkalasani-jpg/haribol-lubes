import Link from "next/link";

import { siteConfig } from "@/config/site";
import { SocialLinks } from "@/components/ui/social-links";
import { brands } from "@/data/brands";
import { industries } from "@/data/industries";
import { mastermaxCatalogueTaxonomy } from "@/data/mastermax-catalogue";
import { productCategories } from "@/data/product-categories";
import { siteNavigation } from "@/data/site-navigation";

import { PageContainer } from "../ui/page-container";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./site-footer.module.css";

type FooterLink = {
  href: string;
  label: string;
};

const categoryLinks = new Map(
  productCategories.map((category) => [category.name, { href: category.href, label: category.name }]),
);

const mastermaxGroupLinks = new Map(
  mastermaxCatalogueTaxonomy.map((group) => [
    group.id,
    { href: group.futureHref, label: group.category },
  ]),
);

const footerProductLinks = [
  categoryLinks.get("Engine Oils"),
  categoryLinks.get("Hydraulic Oils"),
  mastermaxGroupLinks.get("transmission"),
  mastermaxGroupLinks.get("compressor"),
  categoryLinks.get("Industrial Lubricants"),
  categoryLinks.get("Greases"),
  { href: "/products", label: "All Products" },
].filter((link): link is FooterLink => Boolean(link));

const footerIndustrySlugs = [
  "automotive",
  "transport-logistics",
  "fleet-operators",
  "manufacturing",
  "construction",
  "agriculture",
] as const;

const footerIndustryLinks = [
  ...footerIndustrySlugs.map((slug) => {
    const industry = industries.find((item) => item.slug === slug);
    return industry ? { href: industry.futureHref, label: industry.name } : undefined;
  }),
  { href: "/industries", label: "All Industries" },
].filter((link): link is FooterLink => Boolean(link));

const companyResourcePaths = [
  "/about",
  "/applications",
  "/resources",
  "/insights",
  "/contact",
  "/request-a-quote",
] as const;

const companyResourceLinks: FooterLink[] = companyResourcePaths.flatMap((path) => {
  const link = siteNavigation.find((item) => item.href === path);
  return link ? [{ href: link.href, label: link.label }] : [];
});

const footerBrandLinks = brands
  .filter((brand) => brand.status === "active")
  .map((brand) => ({ href: brand.futureHref, label: brand.name }));

function FooterNavigation({ label, links }: { label: string; links: readonly FooterLink[] }) {
  return (
    <nav aria-label={`${label} footer navigation`} className={styles.navigationGroup}>
      <p>{label}</p>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const phone = String(siteConfig.phone);
  const email = String(siteConfig.publicEmail);
  const whatsappHref = buildWhatsAppUrl(siteConfig.whatsapp, { type: "general" });
  const hasContactDetails = Boolean(phone || whatsappHref || email);

  return (
    <footer className={styles.footer}>
      <PageContainer className={styles.container} size="wide">
        <div className={styles.identityBar}>
          <Link className={styles.wordmark} href="/">
            <span>Haribol</span>
            <span>Lubes</span>
          </Link>
          <p>Automotive · Commercial · Industrial</p>
          <span className={styles.reference} aria-hidden="true">HL / KE</span>
        </div>

        <div className={styles.footerGrid}>
          <section className={styles.company} aria-labelledby="footer-company-title">
            <p className={styles.groupLabel}>Company</p>
            <h2 id="footer-company-title">{siteConfig.companyName}</h2>
            <p className={styles.description}>
              Automotive and industrial lubricant supply and distribution based in {siteConfig.city}, {siteConfig.country}.
            </p>
            <address className={styles.location}>{siteConfig.businessAddress.venue}<br />{siteConfig.businessAddress.street}<br />{siteConfig.businessAddress.locality}, {siteConfig.businessAddress.country}</address>

            {hasContactDetails ? (
              <div className={styles.contactDetails}>
                {phone ? <a href={`tel:${phone}`}>{phone}</a> : null}
                {whatsappHref ? <a data-analytics-event="whatsapp_clicked" data-whatsapp-source="footer" href={whatsappHref} rel="noopener noreferrer" target="_blank">WhatsApp Sales</a> : null}
                {email ? <a href={`mailto:${email}`}>{email}</a> : null}
              </div>
            ) : null}

            <SocialLinks className={styles.socialLinks} links={siteConfig.socialLinks} />
          </section>

          <FooterNavigation label="Products" links={footerProductLinks} />
          <FooterNavigation label="Industries" links={footerIndustryLinks} />
          <FooterNavigation label="Company & Resources" links={companyResourceLinks} />
          <FooterNavigation label="Brands" links={footerBrandLinks} />
        </div>

        <div className={styles.lowerBar}>
          <p>© {currentYear} {siteConfig.companyName}</p>
          <nav aria-label="Legal navigation">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
          <p>{siteConfig.city}, {siteConfig.country}</p>
        </div>
      </PageContainer>
    </footer>
  );
}
