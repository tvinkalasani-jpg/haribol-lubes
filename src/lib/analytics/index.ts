export const analyticsEventNames = [
  "navigation",
  "product_viewed",
  "product_category_viewed",
  "product_finder_started",
  "product_finder_completed",
  "rfq_started",
  "rfq_submitted",
  "whatsapp_clicked",
  "insight_viewed",
  "resource_downloaded",
  "add_to_cart",
  "begin_checkout",
  "order_created",
  "payment_completed",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsPropertyValue = boolean | number | string;
export type AnalyticsProperties = Readonly<Record<string, AnalyticsPropertyValue>>;
export type AnalyticsAdapter = (name: AnalyticsEventName, properties: AnalyticsProperties) => void;

const sensitivePropertyFragments = [
  "address", "company", "email", "message", "name", "order_reference", "phone", "rfq_reference",
] as const;
const safePropertyName = /^[a-z][a-z0-9_]{0,49}$/;
let adapter: AnalyticsAdapter | undefined;
let consentGranted = false;

export function validateAnalyticsProperties(properties: AnalyticsProperties): boolean {
  return Object.entries(properties).every(([key, value]) => {
    const normalized = key.toLowerCase();
    if (!safePropertyName.test(normalized)) return false;
    if (sensitivePropertyFragments.some((fragment) => normalized.includes(fragment))) return false;
    if (typeof value === "string" && value.length > 120) return false;
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
  });
}

export function configureAnalytics(nextAdapter: AnalyticsAdapter | undefined): void {
  adapter = nextAdapter;
}

export function setAnalyticsConsent(granted: boolean): void {
  consentGranted = granted;
}

export function trackEvent(name: AnalyticsEventName, properties: AnalyticsProperties = {}): boolean {
  if (!analyticsEventNames.includes(name) || !validateAnalyticsProperties(properties)) return false;
  if (!consentGranted || !adapter) return false;
  adapter(name, properties);
  return true;
}
