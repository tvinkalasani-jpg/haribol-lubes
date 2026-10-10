import type { Market } from "@/types/product";

export const markets: readonly Market[] = [
  { id: "ke", code: "KE", slug: "kenya", name: "Kenya", region: "East Africa", status: "active" },
  { id: "ug", code: "UG", slug: "uganda", name: "Uganda", region: "East Africa", status: "planned" },
  { id: "tz", code: "TZ", slug: "tanzania", name: "Tanzania", region: "East Africa", status: "planned" },
  { id: "rw", code: "RW", slug: "rwanda", name: "Rwanda", region: "East Africa", status: "planned" },
] as const;

export type MarketId = (typeof markets)[number]["id"];
