export const whatsappSources = [
  "homepage",
  "contact",
  "product-page",
  "category-page",
  "industry-page",
  "product-finder",
  "rfq-success",
  "footer",
] as const;

export type WhatsAppSource = (typeof whatsappSources)[number];

export type WhatsAppContext =
  | { type: "general" }
  | { type: "product"; productName: string; pageUrl?: string }
  | { type: "category"; categoryName: string }
  | { type: "industry"; industryName: string }
  | { type: "productFinder"; productName: string; technicalSelection?: string }
  | { type: "rfqFollowUp"; referenceNumber: string };

export const whatsappAnalyticsEvent = "whatsapp_clicked" as const;
