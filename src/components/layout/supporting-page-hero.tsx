import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PageContainer } from "@/components/ui/page-container";

import styles from "./supporting-page-hero.module.css";

type HeroItem = { label: string; value: string };

type SupportingPageHeroProps = {
  breadcrumb: string;
  code: string;
  description: string;
  eyebrow: string;
  items: readonly HeroItem[];
  note?: ReactNode;
  title: ReactNode;
  variant: "finder" | "resources" | "insights";
};

export function SupportingPageHero({ breadcrumb, code, description, eyebrow, items, note, title, variant }: SupportingPageHeroProps) {
  return <header className={styles.hero} data-hero-variant={variant}>
    <PageContainer className={styles.container} size="wide">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: breadcrumb }]} />
      <div className={styles.grid}>
        <div className={styles.copy}><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span>{note ? <small>{note}</small> : null}</div>
        <aside className={styles.visual} aria-label={`${breadcrumb} page reference`}>
          <div className={styles.visualMeta}><span>HL / {code}</span><span>PUBLIC PAGE</span></div>
          <div className={styles.diagram} aria-hidden="true"><i /><i /><b>{code}</b><span>01</span><span>02</span><span>03</span></div>
          <dl>{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        </aside>
      </div>
    </PageContainer>
  </header>;
}
