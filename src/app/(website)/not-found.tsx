import Link from "next/link";

import { PageContainer } from "@/components/ui/page-container";
import { createMetadata } from "@/lib/seo/metadata";

import styles from "./not-found.module.css";

export const metadata = createMetadata({
  title: "Page Not Found",
  description: "The requested page could not be found.",
  path: "/404",
  indexable: false,
});

export default function NotFound() {
  return (
    <section className={styles.page}>
      <PageContainer className={styles.container} size="wide">
        <p className={styles.code}>404 / PAGE NOT FOUND</p>
        <h1>The page you requested is not available.</h1>
        <p>Use one of these routes to continue.</p>
        <nav aria-label="Not found recovery links">
          <Link href="/products">Products</Link>
          <Link href="/product-finder">Product Finder</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </PageContainer>
    </section>
  );
}
