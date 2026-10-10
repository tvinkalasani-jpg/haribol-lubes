"use client";

import { useRef, useState, type FormEvent } from "react";

import { contactFieldLimits, parseContactEnquiry, validateContactEnquiry } from "@/lib/validation/contact-enquiry";
import { contactAnalyticsEvents, type ContactEnquiryErrors } from "@/types/enquiry";

import styles from "./contact-page.module.css";

const enquiryOptions = [
  { value: "general", label: "General enquiry" },
  { value: "product", label: "Product enquiry" },
  { value: "technical", label: "Technical enquiry" },
  { value: "commercial", label: "Bulk / commercial enquiry" },
  { value: "dealer-reseller", label: "Dealer / reseller enquiry" },
] as const;

export function ContactForm() {
  const [errors, setErrors] = useState<ContactEnquiryErrors>({});
  const [checked, setChecked] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const enquiry = parseContactEnquiry(new FormData(event.currentTarget));
    const nextErrors = validateContactEnquiry(enquiry);
    const hasErrors = Object.keys(nextErrors).length > 0;

    setErrors(nextErrors);
    setChecked(!hasErrors);
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  return (
    <form
      className={styles.form}
      id="contact-form"
      noValidate
      onSubmit={handleSubmit}
      data-analytics-start-event={contactAnalyticsEvents.formStarted}
      data-analytics-error-event={contactAnalyticsEvents.validationError}
    >
      <div className={styles.formHeader}>
        <p>General and technical enquiry shell</p>
        <span>Not connected to delivery</span>
      </div>

      {(Object.keys(errors).length > 0 || checked) && (
        <div
          className={checked ? styles.checkedNotice : styles.errorSummary}
          ref={statusRef}
          role={checked ? "status" : "alert"}
          tabIndex={-1}
        >
          {checked ? (
            <>
              <strong>Details checked.</strong>
              <span>This enquiry has not been sent or stored. Online delivery is not active yet.</span>
            </>
          ) : (
            <>
              <strong>Review the highlighted fields.</strong>
              <span>Your enquiry has not been sent or stored.</span>
            </>
          )}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="contact-name">Name <span aria-hidden="true">*</span></label>
          <input id="contact-name" name="name" type="text" autoComplete="name" maxLength={contactFieldLimits.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} />
          {errors.name && <p className={styles.fieldError} id="contact-name-error">{errors.name}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-company">Company</label>
          <input id="contact-company" name="company" type="text" autoComplete="organization" maxLength={contactFieldLimits.company} aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? "contact-company-error" : undefined} />
          {errors.company && <p className={styles.fieldError} id="contact-company-error">{errors.company}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-phone">Phone</label>
          <input id="contact-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={contactFieldLimits.phone} aria-invalid={Boolean(errors.phone || errors.contactMethod)} aria-describedby={errors.phone ? "contact-phone-error" : errors.contactMethod ? "contact-method-error" : undefined} />
          {errors.phone && <p className={styles.fieldError} id="contact-phone-error">{errors.phone}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={contactFieldLimits.email} aria-invalid={Boolean(errors.email || errors.contactMethod)} aria-describedby={errors.email ? "contact-email-error" : errors.contactMethod ? "contact-method-error" : undefined} />
          {errors.email && <p className={styles.fieldError} id="contact-email-error">{errors.email}</p>}
        </div>
        {errors.contactMethod && <p className={`${styles.fieldError} ${styles.contactError}`} id="contact-method-error">{errors.contactMethod}</p>}
        <div className={`${styles.field} ${styles.fullField}`}>
          <label htmlFor="contact-enquiry-type">Enquiry type</label>
          <select id="contact-enquiry-type" name="enquiryType" defaultValue="general">
            {enquiryOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className={`${styles.field} ${styles.fullField}`}>
          <label htmlFor="contact-message">Message <span aria-hidden="true">*</span></label>
          <textarea id="contact-message" name="message" rows={6} maxLength={contactFieldLimits.message} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : "contact-message-help"} />
          {errors.message ? <p className={styles.fieldError} id="contact-message-error">{errors.message}</p> : <p className={styles.fieldHelp} id="contact-message-help">Include the product, grade, specification, equipment or quantity where known.</p>}
        </div>
      </div>

      <label className={styles.consent}>
        <input type="checkbox" name="consent" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "contact-consent-error" : "contact-consent-note"} />
        <span>I understand these details would be used only to handle this enquiry. See the <a href="/privacy">privacy information</a>.</span>
      </label>
      {errors.consent ? <p className={styles.fieldError} id="contact-consent-error">{errors.consent}</p> : <p className={styles.fieldHelp} id="contact-consent-note">No details entered here are currently transmitted or stored.</p>}

      <div className={styles.formFooter}>
        <button type="submit">Check enquiry details <span aria-hidden="true">↗</span></button>
        <p>Online delivery is not active. For commercial requirements, use the dedicated Request a Quote pathway.</p>
      </div>
    </form>
  );
}
