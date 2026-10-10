import Link from "next/link";

import type { RfqSource } from "@/types/enquiry";

import { RfqForm, type RfqCategoryOption, type RfqProductOption } from "./rfq-form";
import styles from "./rfq-page.module.css";

type RfqPageProps = { categories: readonly RfqCategoryOption[]; products: readonly RfqProductOption[]; initialProductSlug: string; source: RfqSource; industry: { name: string; slug: string } | null };

export function RfqPage(props: RfqPageProps) {
  const selected = props.products.find((product) => product.slug === props.initialProductSlug);
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="rfq-title">
        <div className={styles.heroGrid}>
          <div><p className={styles.eyebrow}>Commercial enquiries · Kenya</p><h1 id="rfq-title">Request a quotation</h1></div>
          <div className={styles.heroCopy}><p>Tell us what your operation requires. Haribol Lubes Limited will use the details supplied to assess the request and follow up through your chosen contact method.</p><ul aria-label="Quotation process"><li><span>01</span> Describe the requirement</li><li><span>02</span> We review the details</li><li><span>03</span> We follow up directly</li></ul></div>
        </div>
      </section>
      {(selected || props.industry) && <section className={styles.context} aria-label="Enquiry context"><div>
        {selected && <p><span>Selected product</span><strong>{selected.name}</strong><Link href={selected.href}>View product</Link></p>}
        {props.industry && <p><span>Industry context</span><strong>{props.industry.name}</strong><Link href={`/industries/${props.industry.slug}`}>View industry</Link></p>}
      </div></section>}
      <section className={styles.formSection} aria-labelledby="form-heading"><div className={styles.formLayout}>
        <aside><p className={styles.eyebrow}>RFQ · Structured enquiry</p><h2 id="form-heading">Your requirement</h2><p>Required fields are marked. A phone number or email address is enough for us to respond.</p><div className={styles.note}><span>Packaging note</span><p>Requested units describe your requirement. Haribol will confirm available products and packaging during follow-up.</p></div></aside>
        <RfqForm {...props} />
      </div></section>
    </div>
  );
}
