"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { rfqAnalyticsEvents, type RfqErrors, type RfqOutcome, type RfqSource } from "@/types/enquiry";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";

import styles from "./rfq-page.module.css";

export type RfqProductOption = { id: string; slug: string; name: string; brand: string; categoryId: string; href: string };
export type RfqCategoryOption = { id: string; name: string };
type Props = { products: readonly RfqProductOption[]; categories: readonly RfqCategoryOption[]; initialProductSlug: string; source: RfqSource; industry: { name: string; slug: string } | null };

const businessTypes = [
  ["garage-workshop", "Garage / Workshop"], ["fleet-operator", "Fleet Operator"], ["transport-logistics", "Transport / Logistics"],
  ["industrial-manufacturing", "Industrial / Manufacturing"], ["construction", "Construction"], ["agriculture", "Agriculture"],
  ["wholesale-reseller", "Wholesale / Reseller"], ["retail-trade", "Retail / Trade"], ["other", "Other"],
] as const;
const units = [["litres", "Litres"], ["drums", "Drums"], ["pails", "Pails"], ["containers", "Containers"], ["units", "Units"], ["other", "Other"]] as const;

export function RfqForm({ products, categories, initialProductSlug, source, industry }: Props) {
  const [errors, setErrors] = useState<RfqErrors>({});
  const [outcome, setOutcome] = useState<RfqOutcome | null>(null);
  const [pending, setPending] = useState(false);
  const [productSlug, setProductSlug] = useState(initialProductSlug);
  const [startedAt] = useState(() => Date.now());
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (initialProductSlug) document.documentElement.dataset.rfqEvent = rfqAnalyticsEvents.productContextLoaded; }, [initialProductSlug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setErrors({}); setOutcome(null);
    const formData = new FormData(event.currentTarget);
    const raw: Record<string, FormDataEntryValue | boolean | number> = Object.fromEntries(formData.entries());
    raw.unsure = formData.has("unsure"); raw.consent = formData.has("consent"); raw.formStartedAt = startedAt; raw.idempotencyKey = idempotencyKey;
    try {
      const response = await fetch("/api/enquiries/rfq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(raw) });
      const result = await response.json() as RfqOutcome;
      setOutcome(result);
      if (result.type === "validation_error") { setErrors(result.errors); document.documentElement.dataset.rfqEvent = rfqAnalyticsEvents.validationError; setTimeout(() => summaryRef.current?.focus(), 0); }
      else if (result.type === "success") { document.documentElement.dataset.rfqEvent = rfqAnalyticsEvents.submitted; setTimeout(() => successRef.current?.focus(), 0); }
      else { document.documentElement.dataset.rfqEvent = rfqAnalyticsEvents.submissionFailed; setTimeout(() => summaryRef.current?.focus(), 0); }
    } catch {
      setOutcome({ type: "storage_error", message: "We couldn’t record your quotation request. Please try again." });
      setTimeout(() => summaryRef.current?.focus(), 0);
    } finally { setPending(false); }
  }

  if (outcome?.type === "success") return <div className={styles.success} ref={successRef} tabIndex={-1} role="status"><span className={styles.successMark} aria-hidden>✓</span><p>Quotation request received</p><h2>Your quotation request has been received.</h2><div><span>Your reference</span><strong>{outcome.referenceNumber}</strong></div><p>Haribol Lubes Limited will use the contact details supplied to follow up on your enquiry.</p><div className={styles.successActions}><WhatsAppLink context={{ type: "rfqFollowUp", referenceNumber: outcome.referenceNumber }} source="rfq-success">Continue on WhatsApp</WhatsAppLink><Link href="/products">Continue browsing products</Link></div></div>;

  const globalError = outcome && outcome.type !== "validation_error" ? outcome.message : null;
  const sourcePage = source === "product-finder" ? "/product-finder" : initialProductSlug ? `/products/${products.find((p) => p.slug === initialProductSlug)?.categoryId ?? ""}/${initialProductSlug}` : industry ? `/industries/${industry.slug}` : "/request-a-quote";
  return <form className={styles.form} onSubmit={submit} noValidate data-analytics-start={rfqAnalyticsEvents.started}>
    {(Object.keys(errors).length > 0 || globalError) && <div className={styles.errorSummary} role="alert" tabIndex={-1} ref={summaryRef}><strong>{globalError ? "Submission not recorded" : "Please check your details"}</strong><p>{globalError ?? "Some fields need your attention before we can record the request."}</p></div>}
    <input type="hidden" name="source" value={source} /><input type="hidden" name="sourcePage" value={sourcePage} /><input type="hidden" name="industrySlug" value={industry?.slug ?? ""} />
    <div className={styles.honeypot} aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <fieldset><legend><span>01</span> Contact details</legend><div className={styles.grid}>
      <Field name="name" label="Full name" required error={errors.name}><input id="name" name="name" autoComplete="name" maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} /></Field>
      <Field name="company" label="Company / business name" error={errors.company}><input id="company" name="company" autoComplete="organization" maxLength={120} /></Field>
      <Field name="phone" label="Phone" error={errors.phone ?? errors.contactMethod}><input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} aria-invalid={!!(errors.phone || errors.contactMethod)} /></Field>
      <Field name="email" label="Email" error={errors.email ?? errors.contactMethod}><input id="email" name="email" type="email" autoComplete="email" maxLength={160} aria-invalid={!!(errors.email || errors.contactMethod)} /></Field>
    </div><p className={styles.sectionHelp}>Provide at least one: phone or email.</p></fieldset>
    <fieldset><legend><span>02</span> Business details</legend><Field name="businessType" label="Business type" error={errors.businessType}><select id="businessType" name="businessType" defaultValue=""><option value="">Select if applicable</option>{businessTypes.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field></fieldset>
    <fieldset><legend><span>03</span> Product requirement</legend><div className={styles.grid}>
      <Field name="productSlug" label="Product" error={errors.productSlug ?? errors.productRequirement}><select id="productSlug" name="productSlug" value={productSlug} onChange={(event) => setProductSlug(event.target.value)}><option value="">No specific product selected</option>{categories.map((category) => <optgroup key={category.id} label={category.name}>{products.filter((product) => product.categoryId === category.id).map((product) => <option key={product.id} value={product.slug}>{product.name} · {product.brand}</option>)}</optgroup>)}</select></Field>
      <Field name="categoryId" label="Product category" error={errors.categoryId ?? errors.productRequirement}><select id="categoryId" name="categoryId" defaultValue=""><option value="">No category selected</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></Field>
    </div><label className={styles.check}><input type="checkbox" name="unsure" /><span>I’m not sure which product I need</span></label>{fieldError(errors,"productRequirement")}</fieldset>
    <fieldset><legend><span>04</span> Technical details <small>Optional</small></legend><div className={styles.grid}>
      <Field name="gradeOrViscosity" label="Grade / viscosity" error={errors.gradeOrViscosity}><input id="gradeOrViscosity" name="gradeOrViscosity" maxLength={160} placeholder="e.g. 15W-40 or ISO VG 68" /></Field>
      <Field name="specification" label="Specification / classification" error={errors.specification}><input id="specification" name="specification" maxLength={160} placeholder="e.g. API CI-4" /></Field>
      <Field name="application" label="Equipment / application" error={errors.application} wide><input id="application" name="application" maxLength={160} placeholder="Vehicle, machine, system or use" /></Field>
    </div></fieldset>
    <fieldset><legend><span>05</span> Quantity & location</legend><div className={styles.grid}>
      <Field name="quantity" label="Quantity" error={errors.quantity}><input id="quantity" name="quantity" type="number" inputMode="decimal" min="0.01" step="any" /></Field>
      <Field name="quantityUnit" label="Unit" error={errors.quantityUnit}><select id="quantityUnit" name="quantityUnit" defaultValue=""><option value="">Select a unit</option>{units.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      <Field name="location" label="Town / delivery location" required error={errors.location} wide><input id="location" name="location" autoComplete="address-level2" maxLength={120} placeholder="Requirement or delivery context" /></Field>
    </div><p className={styles.sectionHelp}>Packaging and availability will be confirmed by Haribol.</p></fieldset>
    <fieldset><legend><span>06</span> Additional information <small>Optional</small></legend><Field name="message" label="Additional requirements / notes" error={errors.message}><textarea id="message" name="message" maxLength={2000} rows={5} /></Field></fieldset>
    <div className={styles.consent}><label><input type="checkbox" name="consent" aria-invalid={!!errors.consent} /><span>I agree that Haribol Lubes Limited may use the details provided to respond to this quotation request. Read our <Link href="/privacy">privacy notice</Link>.</span></label>{fieldError(errors,"consent")}</div>
    <div className={styles.submitRow}><button type="submit" disabled={pending || !startedAt || !idempotencyKey} aria-busy={pending}>{pending ? "Recording request…" : "Submit quotation request"}<span aria-hidden>↗</span></button><p aria-live="polite">{pending ? "Your quotation request is being securely recorded." : "Your details are used only to handle this enquiry."}</p></div>
  </form>;
}

function fieldError(errors: RfqErrors, field: keyof RfqErrors) { return errors[field] ? <p className={styles.fieldError} id={`${field}-error`}>{errors[field]}</p> : null; }
function Field({ name, label, required = false, error, wide = false, children }: { name: string; label: string; required?: boolean; error?: string; wide?: boolean; children: ReactNode }) {
  return <div className={`${styles.field} ${wide ? styles.wide : ""}`}><label htmlFor={name}>{label}{required && <span> Required</span>}</label>{children}{error && <p className={styles.fieldError} id={`${name}-error`}>{error}</p>}</div>;
}
