export const enquiryTypes = [
  "general",
  "product",
  "technical",
  "commercial",
  "dealer-reseller",
] as const;

export type EnquiryType = (typeof enquiryTypes)[number];

export type ContactEnquiry = {
  company: string;
  consent: boolean;
  email: string;
  enquiryType: EnquiryType;
  message: string;
  name: string;
  phone: string;
};

export type ContactEnquiryErrors = Partial<Record<keyof ContactEnquiry | "contactMethod", string>>;

export const contactAnalyticsEvents = {
  pathSelected: "contact_path_selected",
  phoneClicked: "contact_phone_clicked",
  whatsappClicked: "contact_whatsapp_clicked",
  emailClicked: "contact_email_clicked",
  formStarted: "contact_form_started",
  validationError: "contact_form_validation_error",
  quoteClicked: "contact_quote_clicked",
} as const;

export const rfqBusinessTypes = [
  "garage-workshop",
  "fleet-operator",
  "transport-logistics",
  "industrial-manufacturing",
  "construction",
  "agriculture",
  "wholesale-reseller",
  "retail-trade",
  "other",
] as const;

export type RfqBusinessType = (typeof rfqBusinessTypes)[number];

export const rfqQuantityUnits = ["litres", "drums", "pails", "containers", "units", "other"] as const;
export type RfqQuantityUnit = (typeof rfqQuantityUnits)[number];

export const rfqSources = [
  "product-page",
  "product-finder",
  "products",
  "industry-page",
  "contact-page",
  "direct",
] as const;
export type RfqSource = (typeof rfqSources)[number];

export type RfqStatus = "received" | "reviewing" | "contacted" | "quoted" | "closed";
export type RfqNotificationStatus = "pending" | "sent" | "failed" | "unavailable";

export type RfqInput = {
  name: string;
  company: string;
  phone: string;
  email: string;
  businessType: RfqBusinessType | "";
  productSlug: string;
  categoryId: string;
  unsure: boolean;
  gradeOrViscosity: string;
  specification: string;
  application: string;
  quantity: number | null;
  quantityUnit: RfqQuantityUnit | "";
  location: string;
  message: string;
  consent: boolean;
  source: RfqSource;
  sourcePage: string;
  industrySlug: string;
  idempotencyKey: string;
  formStartedAt: number;
  website: string;
};

export type RfqField = keyof RfqInput | "contactMethod" | "productRequirement";
export type RfqErrors = Partial<Record<RfqField, string>>;

export type RfqRecord = Omit<RfqInput, "website" | "formStartedAt" | "consent" | "productSlug"> & {
  id: string;
  referenceNumber: string;
  createdAt: string;
  updatedAt: string;
  status: RfqStatus;
  productId: string | null;
  productSlug: string | null;
  consentRecordedAt: string;
  notificationStatus: RfqNotificationStatus;
  notificationAttempts: number;
  metadata: {
    industryId: string | null;
    requestFingerprint: string;
  };
};

export type RfqOutcome =
  | { type: "success"; referenceNumber: string }
  | { type: "validation_error"; message: string; errors: RfqErrors }
  | { type: "rate_limited"; message: string; retryAfterSeconds: number }
  | { type: "storage_error"; message: string };

export const rfqAnalyticsEvents = {
  started: "rfq_started",
  productContextLoaded: "rfq_product_context_loaded",
  validationError: "rfq_validation_error",
  submitted: "rfq_submitted",
  submissionFailed: "rfq_submission_failed",
} as const;
