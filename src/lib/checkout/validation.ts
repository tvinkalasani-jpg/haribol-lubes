import type { CheckoutInput } from "../../types/checkout";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9() .-]{6,38}[0-9]$/;

export type CheckoutValidationErrors = Partial<Record<keyof CheckoutInput, string>>;

export function validateCheckoutInput(input: CheckoutInput): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const location = input.deliveryLocation.trim();
  if (fullName.length < 2 || fullName.length > 120) errors.fullName = "Enter a full name using 2–120 characters.";
  if (!phonePattern.test(phone) || phone.length > 40) errors.phone = "Enter a usable Kenyan or international phone number.";
  if (input.email && (!emailPattern.test(input.email.trim()) || input.email.length > 254)) errors.email = "Enter a valid email address.";
  if (input.company && input.company.trim().length > 160) errors.company = "Use 160 characters or fewer.";
  if (location.length < 2 || location.length > 200) errors.deliveryLocation = "Enter a delivery town or location using 2–200 characters.";
  if (input.deliveryInstructions && input.deliveryInstructions.trim().length > 1_000) errors.deliveryInstructions = "Use 1,000 characters or fewer.";
  return errors;
}
