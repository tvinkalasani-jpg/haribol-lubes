export function createPhoneUrl(phone: string): string | undefined {
  const sanitized = phone.trim().replace(/[^+\d]/g, "");
  return sanitized ? `tel:${sanitized}` : undefined;
}

export function createEmailUrl(email: string): string | undefined {
  const sanitized = email.trim();
  return sanitized ? `mailto:${sanitized}` : undefined;
}
