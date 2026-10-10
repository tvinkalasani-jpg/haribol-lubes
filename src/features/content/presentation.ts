import { insightCategories, resourceTypes } from "@/cms/content";
import type { InsightCategory } from "./types";

export function insightCategoryLabel(category: InsightCategory): string {
  return insightCategories.find(({ value }) => value === category)?.label ?? category;
}

export function resourceTypeLabel(type: string): string {
  return resourceTypes.find(({ value }) => value === type)?.label ?? type;
}

export function formatEditorialDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" }).format(date);
}
