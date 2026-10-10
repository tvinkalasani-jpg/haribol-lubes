import type { Metadata } from "next";

import { BusinessIntro } from "@/components/home/business-intro";
import { HomeHero } from "@/components/home/home-hero";
import { IndustriesSection } from "@/components/home/industries-section";
import { KenyaPresence } from "@/components/home/kenya-presence";
import { MastermaxShowcase } from "@/components/home/mastermax-showcase";
import { ProductCategories } from "@/components/home/product-categories";
import { QuoteCta } from "@/components/home/quote-cta";
import { WhyHaribol } from "@/components/home/why-haribol";
import { createMetadata } from "@/lib/seo/metadata";
import { createOrganizationSchema, createPageSchema, createSchemaGraph, createWebsiteSchema, JsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = createMetadata({
  absoluteTitle:
    "Haribol Lubes Limited | Automotive & Industrial Lubricants Kenya",
  description:
    "Haribol Lubes Limited supplies automotive and industrial lubricant solutions in Kenya, including the Mastermax lubricant range.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={createSchemaGraph([
        createOrganizationSchema(),
        createWebsiteSchema(),
        createPageSchema({ name: "Haribol Lubes Limited", description: "Automotive and industrial lubricant supply in Kenya.", path: "/" }),
      ])} />
      <HomeHero />
      <BusinessIntro />
      <ProductCategories />
      <IndustriesSection />
      <WhyHaribol />
      <KenyaPresence />
      <MastermaxShowcase />
      <QuoteCta />
    </>
  );
}
