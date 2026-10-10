import type { WhatsAppContext } from "../../types/whatsapp";

const allowedNumberCharacters = /^\+?[\d\s().-]+$/;
const referencePattern = /^RFQ-\d{4}-[A-Z0-9]{6}$/;

export function normalizeWhatsAppNumber(value: string): string | null {
  const input = value.trim();
  if (!input || !allowedNumberCharacters.test(input)) return null;
  if ((input.match(/\+/g) ?? []).length > 1 || (input.includes("+") && !input.startsWith("+"))) return null;

  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) digits = `254${digits.slice(1)}`;
  return /^\d{8,15}$/.test(digits) ? digits : null;
}

function safeText(value: string, maximum = 120): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}

export function buildWhatsAppMessage(context: WhatsAppContext): string | null {
  switch (context.type) {
    case "general":
      return "Hello Haribol Lubes, I would like to make an enquiry.";
    case "product": {
      const productName = safeText(context.productName);
      if (!productName) return null;
      const introduction = `Hello Haribol Lubes, I would like to enquire about ${productName}.`;
      return context.pageUrl ? `${introduction}\n\nProduct: ${productName}\nPage: ${context.pageUrl}` : introduction;
    }
    case "category": {
      const categoryName = safeText(context.categoryName);
      return categoryName ? `Hello Haribol Lubes, I would like to enquire about ${categoryName}.` : null;
    }
    case "industry": {
      const industryName = safeText(context.industryName).toLocaleLowerCase("en");
      return industryName ? `Hello Haribol Lubes, I would like to discuss lubricant requirements for ${industryName}.` : null;
    }
    case "productFinder": {
      const productName = safeText(context.productName);
      const technicalSelection = context.technicalSelection ? safeText(context.technicalSelection, 60) : "";
      if (!productName) return null;
      return `Hello Haribol Lubes, I used the Product Finder and would like to ask about ${productName}.${technicalSelection ? `\nTechnical selection: ${technicalSelection}` : ""}`;
    }
    case "rfqFollowUp":
      return referencePattern.test(context.referenceNumber)
        ? `Hello Haribol Lubes, I submitted quotation request ${context.referenceNumber} and would like to follow up.`
        : null;
  }
}

export function buildWhatsAppUrl(number: string, context: WhatsAppContext): string | null {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  const message = buildWhatsAppMessage(context);
  return normalizedNumber && message
    ? `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`
    : null;
}
