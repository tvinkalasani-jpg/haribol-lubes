import { IndustryIndexPage } from "@/components/industry/industry-pages";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  absoluteTitle: "Industries | Haribol Lubes Limited",
  description:
    "Explore automotive, commercial and industrial lubricant catalogue pathways by industry for customers in Kenya.",
  path: "/industries",
});

export default function IndustriesPage() {
  return <><JsonLd data={createSchemaGraph([
    createPageSchema({ type: "CollectionPage", path: "/industries", name: "Industries", description: "Lubricant catalogue pathways by industry." }),
    createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Industries", path: "/industries" }]),
  ])} /><IndustryIndexPage /></>;
}
