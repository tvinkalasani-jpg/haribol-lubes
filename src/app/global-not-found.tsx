import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import Link from "next/link";

import { PageContainer } from "@/components/ui/page-container";
import { themeInitializationScript } from "@/lib/theme";
import "@/styles/globals.css";

import styles from "./(website)/not-found.module.css";

const displayFont = Barlow_Condensed({ variable: "--font-barlow-condensed", subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const bodyFont = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Page Not Found | Haribol Lubes",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} /></head>
      <body>
        <main id="main-content">
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
        </main>
      </body>
    </html>
  );
}
