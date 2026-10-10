import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Applications",
  path: "/applications",
  indexable: false,
});

export default function ApplicationsPage() {
  return <PlaceholderPage title="Applications" />;
}
