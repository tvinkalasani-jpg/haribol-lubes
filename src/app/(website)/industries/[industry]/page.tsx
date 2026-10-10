import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IndustryLandingPage } from "@/components/industry/industry-pages";
import { getIndustryById, industries } from "@/data/industries";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

type IndustryPageProps = {
  params: Promise<{ industry: string }>;
};

function findIndustry(slug: string) {
  return getIndustryById(slug);
}

export function generateStaticParams() {
  return industries.map((industry) => ({ industry: industry.slug }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { industry: slug } = await params;
  const industry = findIndustry(slug);

  if (!industry) {
    return {};
  }

  return createMetadata({
    absoluteTitle: industry.seoTitle,
    description: industry.seoDescription,
    path: industry.futureHref,
  });
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { industry: slug } = await params;
  const industry = findIndustry(slug);

  if (!industry) {
    notFound();
  }

  return <><JsonLd data={createSchemaGraph([
    createPageSchema({ path: industry.futureHref, name: industry.pageTitle, description: industry.seoDescription }),
    createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Industries", path: "/industries" }, { name: industry.name, path: industry.futureHref }]),
  ])} /><IndustryLandingPage industry={industry} /></>;
}
