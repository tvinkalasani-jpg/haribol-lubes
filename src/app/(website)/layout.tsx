import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { defaultMetadata } from "@/lib/seo/metadata";
import { themeInitializationScript } from "@/lib/theme";
import "@/styles/globals.css";

const displayFont = Barlow_Condensed({ variable: "--font-barlow-condensed", subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const bodyFont = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function WebsiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`} data-theme="light" data-theme-preference="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} /></head>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div className="site-shell"><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></div>
      </body>
    </html>
  );
}
