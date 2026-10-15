import type { Metadata } from "next";

import { BusinessIntro } from "@/components/home/business-intro";
import { HomeHero } from "@/components/home/home-hero";
import { IndustriesSection } from "@/components/home/industries-section";
import { KenyaPresence } from "@/components/home/kenya-presence";
import { MastermaxShowcase } from "@/components/home/mastermax-showcase";
import { KnowledgeSection } from "@/components/home/knowledge-section";
import { ProductCategories } from "@/components/home/product-categories";
import { ProductFinderFeature } from "@/components/home/product-finder-feature";
import { QuoteCta } from "@/components/home/quote-cta";
import { WhyHaribol } from "@/components/home/why-haribol";
import { getPublicInsights, getPublicResources } from "@/features/content/content-repository";
import { createMetadata } from "@/lib/seo/metadata";
import { createOrganizationSchema, createPageSchema, createSchemaGraph, createWebsiteSchema, JsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = createMetadata({
  absoluteTitle:
    "Haribol Lubes Limited | Automotive & Industrial Lubricants Kenya",
  description:
    "Haribol Lubes Limited supplies automotive and industrial lubricant solutions in Kenya, including the Mastermax lubricant range.",
  path: "/",
});

// Public content is backed by Payload in deployed environments. Railway's
// private database network is available to the running service, not to its
// isolated image builder, so resolve this page at request time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [insights, resources] = await Promise.all([
    getPublicInsights(),
    getPublicResources(),
  ]);

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
      <MastermaxShowcase />
      <IndustriesSection />
      <ProductFinderFeature />
      <KenyaPresence />
      <WhyHaribol />
      <KnowledgeSection insights={insights} resources={resources} />
      <QuoteCta />
    </>
  );
}
