"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import buttonStyles from "@/components/ui/button.module.css";
import { formatMoney } from "@/lib/commerce/money";
import { parseStoredCart, storefrontCartStorageKey } from "@/lib/storefront/cart-storage";
import type { Cart, OrderDraft, ResolvedCart } from "@/types/checkout";

import styles from "./storefront.module.css";

type SafeCreatedOrder = Pick<OrderDraft, "referenceNumber" | "paymentStatus" | "totals">;

export function CheckoutPage() {
  const [cart, setCart] = useState<Cart>({ lines: [] });
  const [resolved, setResolved] = useState<ResolvedCart>({ lines: [], issues: [] });
  const [error, setError] = useState("");
  const [created, setCreated] = useState<SafeCreatedOrder | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      const stored = parseStoredCart(window.localStorage.getItem(storefrontCartStorageKey));
      try {
        const response = await fetch("/api/storefront-test/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(stored) });
        if (!response.ok) throw new Error();
        const current = await response.json() as ResolvedCart;
        if (!active) return;
        setCart(stored);
        setResolved(current);
      } catch {
        if (active) setError("The order summary could not be revalidated.");
      }
    };
    void hydrate();
    return () => { active = false; };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    const checkout = { fullName: String(form.get("fullName") ?? ""), company: String(form.get("company") ?? ""), phone: String(form.get("phone") ?? ""), email: String(form.get("email") ?? ""), deliveryLocation: String(form.get("deliveryLocation") ?? ""), deliveryInstructions: String(form.get("deliveryInstructions") ?? "") };
    try {
      const response = await fetch("/api/storefront-test/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cart, checkout, idempotencyKey: crypto.randomUUID() }) });
      const body = await response.json() as SafeCreatedOrder & { error?: string };
      if (!response.ok) throw new Error(body.error || "The test order could not be created.");
      setCreated(body);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The test order could not be created."); }
    finally { setPending(false); }
  };
  const total = resolved.lines.reduce((sum, line) => sum + line.unitPriceMinor * line.quantity, 0);
  const currency = resolved.lines[0]?.currency ?? "KES";

  return <div className={styles.commercePage}><section className={styles.checkoutShell}>
    <header className={styles.checkoutHeader}><div><p className={styles.pageEyebrow}>Development preview</p><h1>Test checkout</h1><p>No payment details are collected and no live order is placed.</p></div><span className={styles.previewFlag}>Synthetic checkout</span></header>
    {created ? <div className={styles.success} aria-live="polite"><h2>Order created — payment pending</h2><p>Reference <strong>{created.referenceNumber}</strong></p><p>Total {formatMoney({ currency: created.totals.currency, minorAmount: created.totals.grandTotalMinor })}</p><p>Payment status: {created.paymentStatus}. This synthetic order exists only in test memory.</p><Link href="/products">Return to products</Link></div> : <div className={styles.checkoutGrid}>
      <form className={styles.checkoutForm} noValidate onSubmit={submit}>
        <label><span>Full Name *</span><input autoComplete="name" name="fullName" required /></label><label><span>Company</span><input autoComplete="organization" name="company" /></label>
        <label><span>Phone *</span><input autoComplete="tel" name="phone" required /></label><label><span>Email</span><input autoComplete="email" name="email" type="email" /></label>
        <label className={styles.full}><span>Delivery town / location *</span><input autoComplete="address-level2" name="deliveryLocation" required /></label><label className={styles.full}><span>Delivery instructions</span><textarea name="deliveryInstructions" /></label>
        <div className={`${styles.paymentPlaceholder} ${styles.full}`}><strong>Payment placeholder</strong><p>Payment method will be selected only after a verified payment integration is enabled. No M-Pesa prompt or card fields are active.</p></div>
        {error ? <p className={`${styles.error} ${styles.full}`} role="alert">{error}</p> : null}<button className={`${buttonStyles.button} ${buttonStyles.primary} ${styles.full}`} disabled={pending || !resolved.lines.length || Boolean(resolved.issues.length)} type="submit">{pending ? "Creating test order…" : "Create synthetic order — payment pending"}</button>
      </form>
      <aside className={styles.summary} aria-label="Order summary"><h2>Order summary</h2><ul>{resolved.lines.map((line) => <li key={line.offerId}><span>{line.offerDisplayName} × {line.quantity}</span><strong>{formatMoney({ currency: line.currency, minorAmount: line.unitPriceMinor * line.quantity })}</strong></li>)}</ul><div className={styles.totals}><div><span>Subtotal</span><strong>{formatMoney({ currency, minorAmount: total })}</strong></div><div><span>Discount</span><span>Included above</span></div><div><span>Tax</span><span>Not configured</span></div><div><span>Delivery</span><span>Not configured</span></div><div><span>Test total</span><strong>{formatMoney({ currency, minorAmount: total })}</strong></div></div></aside>
    </div>}
  </section></div>;
}
