"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import buttonStyles from "@/components/ui/button.module.css";
import { removeCartLine, updateCartQuantity } from "@/lib/checkout/cart";
import { formatMoney } from "@/lib/commerce/money";
import { parseStoredCart, serializeCart, storefrontCartStorageKey } from "@/lib/storefront/cart-storage";
import { detectPriceUpdates } from "@/lib/storefront/presentation";
import type { Cart, ResolvedCart, ResolvedCartLine } from "@/types/checkout";

import { QuantityControl } from "./quantity-control";
import styles from "./storefront.module.css";

async function requestResolution(cart: Cart): Promise<ResolvedCart> {
  const response = await fetch("/api/storefront-test/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cart) });
  if (!response.ok) throw new Error("Cart could not be checked.");
  return response.json() as Promise<ResolvedCart>;
}

export function CartPage() {
  const [cart, setCart] = useState<Cart>({ lines: [] });
  const [resolved, setResolved] = useState<ResolvedCart>({ lines: [], issues: [] });
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const previous = useRef<readonly ResolvedCartLine[]>([]);

  const validate = useCallback(async (next: Cart) => {
    try {
      const current = await requestResolution(next);
      const changed = detectPriceUpdates(previous.current, current.lines);
      previous.current = current.lines;
      setResolved(current);
      setMessage(changed.length ? "Price updated. Current authoritative pricing is shown." : "Cart checked against current offer data.");
    } catch {
      setMessage("The test cart could not be revalidated. Your items remain stored.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      const stored = parseStoredCart(window.localStorage.getItem(storefrontCartStorageKey));
      await Promise.resolve();
      if (!active) return;
      setCart(stored);
      setReady(true);
      await validate(stored);
    };
    void hydrate();
    return () => { active = false; };
  }, [validate]);

  const persist = (next: Cart) => {
    setCart(next); window.localStorage.setItem(storefrontCartStorageKey, serializeCart(next)); void validate(next);
  };
  const total = resolved.lines.reduce((sum, line) => sum + line.unitPriceMinor * line.quantity, 0);
  const currency = resolved.lines[0]?.currency ?? "KES";

  return <div className={styles.commercePage}><section className={styles.cartShell}>
    <header className={styles.cartHeader}><div><p className={styles.pageEyebrow}>Development preview</p><h1>Test cart</h1><p>Synthetic data only. Every line is revalidated by the server.</p></div><span className={styles.previewFlag}>Commerce disabled in production</span></header>
    <p aria-live="polite" className={styles.notice}>{message}</p>
    {ready && cart.lines.length === 0 ? <div className={styles.empty}><h2>Your test cart is empty</h2><p>Add a synthetic pack from the storefront preview.</p><Link className={`${buttonStyles.button} ${buttonStyles.primary}`} href="/products/engine-oils/mastermax-engine-oils">Browse test product</Link></div> : null}
    {resolved.issues.length ? <div className={styles.error} role="alert">{resolved.issues.map((item) => <p key={`${item.offerId}-${item.code}`}>{item.message}</p>)}</div> : null}
    <ul className={styles.cartList}>{resolved.lines.map((line) => <li className={styles.cartLine} key={line.offerId}>
      <div><h2>{line.offerDisplayName}</h2><p>{line.productName} · {line.variantName}</p><p>{line.packSize} {line.packUnit} · {line.containerType}</p>{line.unitDiscountMinor > 0 ? <p>Active promotion applied</p> : null}</div>
      <QuantityControl label={line.offerDisplayName} maximum={line.maximumOrderQuantity} minimum={line.minimumOrderQuantity} onChange={(quantity) => persist(updateCartQuantity(cart, line.offerId, quantity))} value={line.quantity} />
      <div className={styles.linePrice}><span>{formatMoney({ currency: line.currency, minorAmount: line.unitPriceMinor })} each</span><strong>{formatMoney({ currency: line.currency, minorAmount: line.unitPriceMinor * line.quantity })}</strong><button aria-label={`Remove ${line.offerDisplayName}`} onClick={() => persist(removeCartLine(cart, line.offerId))} type="button">Remove</button></div>
    </li>)}</ul>
    {resolved.lines.length ? <div className={styles.totals}><div><span>Subtotal</span><strong>{formatMoney({ currency, minorAmount: total })}</strong></div><p>Tax and delivery are not configured in this preview.</p><div className={styles.totalsActions}><Link className={`${buttonStyles.button} ${buttonStyles.primary}`} href="/checkout">Continue to test checkout</Link><Link href="/request-a-quote">Request a Quote instead</Link></div></div> : null}
  </section></div>;
}
