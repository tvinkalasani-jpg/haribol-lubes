import { notFound } from "next/navigation";

import { CheckoutPage } from "@/components/commerce/checkout-page";
import { isStorefrontTestMode } from "@/features/storefront/config";

export const dynamic = "force-dynamic";

export default function CheckoutRoutePage() {
  if (!isStorefrontTestMode()) notFound();
  return <CheckoutPage />;
}
