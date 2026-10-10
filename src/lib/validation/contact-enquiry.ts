import type { ContactEnquiry, ContactEnquiryErrors, EnquiryType } from "@/types/enquiry";
import { enquiryTypes } from "@/types/enquiry";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactFieldLimits = {
  name: 100,
  company: 120,
  phone: 40,
  email: 160,
  message: 2000,
} as const;

export function parseContactEnquiry(formData: FormData): ContactEnquiry {
  const enquiryTypeValue = String(formData.get("enquiryType") ?? "general");
  const enquiryType: EnquiryType = enquiryTypes.includes(enquiryTypeValue as EnquiryType)
    ? (enquiryTypeValue as EnquiryType)
    : "general";

  return {
    name: String(formData.get("name") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    enquiryType,
    message: String(formData.get("message") ?? "").trim(),
    consent: formData.get("consent") === "on",
  };
}

export function validateContactEnquiry(enquiry: ContactEnquiry): ContactEnquiryErrors {
  const errors: ContactEnquiryErrors = {};

  if (!enquiry.name) errors.name = "Enter your name.";
  else if (enquiry.name.length > contactFieldLimits.name) errors.name = "Use 100 characters or fewer.";

  if (enquiry.company.length > contactFieldLimits.company) errors.company = "Use 120 characters or fewer.";
  if (enquiry.phone.length > contactFieldLimits.phone) errors.phone = "Use 40 characters or fewer.";
  if (enquiry.email && !emailPattern.test(enquiry.email)) errors.email = "Enter a valid email address.";
  else if (enquiry.email.length > contactFieldLimits.email) errors.email = "Use 160 characters or fewer.";
  if (!enquiry.phone && !enquiry.email) errors.contactMethod = "Enter a phone number or email address.";
  if (!enquiry.message) errors.message = "Describe your enquiry.";
  else if (enquiry.message.length > contactFieldLimits.message) errors.message = "Use 2,000 characters or fewer.";
  if (!enquiry.consent) errors.consent = "Confirm that Haribol may use these details to handle the enquiry.";

  return errors;
}
