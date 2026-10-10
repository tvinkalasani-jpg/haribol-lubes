import { notFound } from "next/navigation";

import { CartPage } from "@/components/commerce/cart-page";
import { isStorefrontTestMode } from "@/features/storefront/config";

export const dynamic = "force-dynamic";

export default function CartRoutePage() {
  if (!isStorefrontTestMode()) notFound();
  return <CartPage />;
}
