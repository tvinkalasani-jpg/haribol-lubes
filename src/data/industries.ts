import type { CatalogueCategoryId } from "@/data/catalogue/categories";

export type IndustryVisualVariant =
  | "automotive" | "workshops" | "transport" | "fleet" | "manufacturing"
  | "construction" | "agriculture" | "machinery" | "wholesale";

export type IndustryId =
  | "automotive" | "garages-workshops" | "transport-logistics" | "fleet-operators"
  | "manufacturing" | "construction" | "agriculture" | "industrial-machinery"
  | "wholesale-retail";

export type Industry = {
  displayIndex: string;
  futureHref: string;
  id: IndustryId;
  intro: string;
  name: string;
  pageTitle: string;
  relatedIndustryIds: readonly IndustryId[];
  relevantCategoryIds: readonly CatalogueCategoryId[];
  requirementPoints: readonly string[];
  seoDescription: string;
  seoTitle: string;
  shortDescription: string;
  slug: string;
  visualVariant: IndustryVisualVariant;
};

export const industries = [
  {
    id: "automotive", displayIndex: "01", slug: "automotive", name: "Automotive",
    pageTitle: "Automotive Lubricants",
    intro: "Lubricant categories relevant to passenger vehicles, commercial vehicles, driveline systems and general automotive maintenance.",
    shortDescription: "Lubrication requirements across passenger vehicles, commercial vehicles and general maintenance.",
    requirementPoints: ["Engine lubrication across petrol, diesel and commercial applications", "Transmission, gearbox and driveline lubrication", "Chassis and general automotive grease applications"],
    relevantCategoryIds: ["engine-oils", "transmission-gear-oils", "greases"],
    relatedIndustryIds: ["garages-workshops", "transport-logistics", "fleet-operators"],
    seoTitle: "Automotive Lubricants Kenya | Haribol Lubes Limited",
    seoDescription: "Explore automotive lubricant categories and current Mastermax catalogue matches for vehicle maintenance requirements in Kenya.",
    visualVariant: "automotive", futureHref: "/industries/automotive",
  },
  {
    id: "garages-workshops", displayIndex: "02", slug: "garages-workshops", name: "Garages & Workshops",
    pageTitle: "Lubricants for Garages & Workshops",
    intro: "A practical catalogue view for routine service, maintenance and workshop lubricant enquiries.",
    shortDescription: "Product discovery for routine servicing, maintenance and workshop enquiries.",
    requirementPoints: ["Engine-oil selection for routine service requirements", "Transmission, gearbox and driveline fluids", "Hydraulic oils where equipment requirements call for them", "Greases for chassis and workshop applications"],
    relevantCategoryIds: ["engine-oils", "transmission-gear-oils", "hydraulic-oils", "greases"],
    relatedIndustryIds: ["automotive", "fleet-operators", "transport-logistics"],
    seoTitle: "Garage & Workshop Lubricants Kenya | Haribol Lubes Limited",
    seoDescription: "Explore lubricant categories and current Mastermax catalogue matches for garages, workshops and maintenance enquiries in Kenya.",
    visualVariant: "workshops", futureHref: "/industries/garages-workshops",
  },
  {
    id: "transport-logistics", displayIndex: "03", slug: "transport-logistics", name: "Transport & Logistics",
    pageTitle: "Lubricants for Transport & Logistics",
    intro: "Lubricant categories relevant to commercial vehicles, driveline systems and transport operations.",
    shortDescription: "Catalogue pathways for commercial vehicles, drivelines and transport operations.",
    requirementPoints: ["Engine oils for commercial vehicle applications", "Transmission and driveline lubricant requirements", "Greases for chassis and related mechanical applications"],
    relevantCategoryIds: ["engine-oils", "transmission-gear-oils", "greases"],
    relatedIndustryIds: ["fleet-operators", "automotive", "garages-workshops"],
    seoTitle: "Transport & Logistics Lubricants Kenya | Haribol Lubes Limited",
    seoDescription: "Explore lubricant categories and current Mastermax catalogue matches relevant to transport and logistics operations in Kenya.",
    visualVariant: "transport", futureHref: "/industries/transport-logistics",
  },
  {
    id: "fleet-operators", displayIndex: "04", slug: "fleet-operators", name: "Fleet Operators",
    pageTitle: "Lubricants for Fleet Operators",
    intro: "Structured product discovery for organisations managing multiple commercial vehicles and recurring lubricant requirements.",
    shortDescription: "Structured product discovery for recurring commercial-vehicle lubricant requirements.",
    requirementPoints: ["Repeat engine-oil requirements across managed vehicles", "Transmission, gear and driveline lubricant selection", "Grease requirements for chassis and mechanical components"],
    relevantCategoryIds: ["engine-oils", "transmission-gear-oils", "greases"],
    relatedIndustryIds: ["transport-logistics", "automotive", "garages-workshops"],
    seoTitle: "Fleet Lubricants Kenya | Haribol Lubes Limited",
    seoDescription: "Explore lubricant categories and current Mastermax catalogue matches for recurring fleet requirements in Kenya.",
    visualVariant: "fleet", futureHref: "/industries/fleet-operators",
  },
  {
    id: "manufacturing", displayIndex: "05", slug: "manufacturing", name: "Manufacturing",
    pageTitle: "Industrial Lubricants for Manufacturing",
    intro: "Lubricant categories relevant to machinery, hydraulic systems, compressors, bearings and production environments.",
    shortDescription: "Industrial lubricant categories for machinery, hydraulic systems and production environments.",
    requirementPoints: ["Hydraulic oils for industrial hydraulic systems", "Compressor oils across catalogue-listed grades", "Industrial process oils for supported applications", "Greases for bearings and mechanical equipment"],
    relevantCategoryIds: ["hydraulic-oils", "compressor-oils", "industrial-lubricants", "greases"],
    relatedIndustryIds: ["industrial-machinery", "construction", "wholesale-retail"],
    seoTitle: "Industrial Lubricants for Manufacturing Kenya | Haribol Lubes Limited",
    seoDescription: "Explore industrial lubricant categories and current Mastermax catalogue matches for manufacturing requirements in Kenya.",
    visualVariant: "manufacturing", futureHref: "/industries/manufacturing",
  },
  {
    id: "construction", displayIndex: "06", slug: "construction", name: "Construction",
    pageTitle: "Lubricants for Construction Equipment",
    intro: "Lubricant categories relevant to heavy machinery, hydraulic systems, driveline components and mechanical equipment.",
    shortDescription: "Lubricant categories relevant to construction machinery and mechanical equipment.",
    requirementPoints: ["Engine-oil requirements for machinery applications", "Hydraulic oils for mobile and equipment systems", "Transmission and gear lubrication", "Greases for supported mechanical applications"],
    relevantCategoryIds: ["engine-oils", "hydraulic-oils", "transmission-gear-oils", "greases"],
    relatedIndustryIds: ["industrial-machinery", "manufacturing", "agriculture"],
    seoTitle: "Construction Equipment Lubricants Kenya | Haribol Lubes Limited",
    seoDescription: "Explore lubricant categories and current Mastermax catalogue matches relevant to construction equipment requirements in Kenya.",
    visualVariant: "construction", futureHref: "/industries/construction",
  },
  {
    id: "agriculture", displayIndex: "07", slug: "agriculture", name: "Agriculture",
    pageTitle: "Lubricants for Agricultural Machinery",
    intro: "Lubricant categories relevant to tractors, machinery, hydraulic systems and mechanical equipment used in agricultural applications.",
    shortDescription: "Lubricant categories for tractors, hydraulic systems and agricultural machinery.",
    requirementPoints: ["Engine-oil requirements for tractors and machinery", "Hydraulic oils for agricultural equipment systems", "Transmission and gear lubrication", "Greases for mechanical and bearing applications"],
    relevantCategoryIds: ["engine-oils", "hydraulic-oils", "transmission-gear-oils", "greases"],
    relatedIndustryIds: ["construction", "industrial-machinery", "automotive"],
    seoTitle: "Agricultural Machinery Lubricants Kenya | Haribol Lubes Limited",
    seoDescription: "Explore lubricant categories and current Mastermax catalogue matches relevant to agricultural machinery requirements in Kenya.",
    visualVariant: "agriculture", futureHref: "/industries/agriculture",
  },
  {
    id: "industrial-machinery", displayIndex: "08", slug: "industrial-machinery", name: "Industrial Machinery",
    pageTitle: "Lubricants for Industrial Machinery",
    intro: "Product categories relevant to hydraulic systems, compressors, bearings, gear systems and industrial mechanical applications.",
    shortDescription: "Catalogue pathways for hydraulic systems, compressors, bearings and industrial machinery.",
    requirementPoints: ["Hydraulic oils for industrial machinery systems", "Compressor-oil requirements across listed grades", "Gear oils where equipment specifications require them", "Greases for bearings and supported machinery applications"],
    relevantCategoryIds: ["hydraulic-oils", "compressor-oils", "industrial-lubricants", "greases", "transmission-gear-oils"],
    relatedIndustryIds: ["manufacturing", "construction", "agriculture"],
    seoTitle: "Industrial Machinery Lubricants Kenya | Haribol Lubes Limited",
    seoDescription: "Explore lubricant categories and current Mastermax catalogue matches for industrial machinery requirements in Kenya.",
    visualVariant: "machinery", futureHref: "/industries/industrial-machinery",
  },
  {
    id: "wholesale-retail", displayIndex: "09", slug: "wholesale-retail", name: "Wholesale & Retail",
    pageTitle: "Lubricant Supply for Wholesale & Retail",
    intro: "A commercial enquiry pathway for resellers, trade customers and businesses seeking lubricant products for onward supply.",
    shortDescription: "Commercial catalogue access for resellers, trade customers and onward-supply enquiries.",
    requirementPoints: ["Catalogue exploration across current automotive and industrial groups", "Commercial enquiries covering relevant products and pack requirements", "Product information for reseller and trade discussions"],
    relevantCategoryIds: ["engine-oils", "hydraulic-oils", "transmission-gear-oils", "compressor-oils", "industrial-lubricants", "greases"],
    relatedIndustryIds: ["automotive", "manufacturing", "garages-workshops"],
    seoTitle: "Wholesale & Retail Lubricant Enquiries Kenya | Haribol Lubes Limited",
    seoDescription: "Explore Haribol's current lubricant catalogue and commercial enquiry pathways for wholesale and retail requirements in Kenya.",
    visualVariant: "wholesale", futureHref: "/industries/wholesale-retail",
  },
] as const satisfies readonly Industry[];

export function getIndustryById(id: string): Industry | undefined {
  return industries.find((industry) => industry.id === id);
}

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
