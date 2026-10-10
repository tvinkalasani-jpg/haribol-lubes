const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getRfqNotificationEmail(): string | null {
  const value = process.env.RFQ_NOTIFICATION_EMAIL?.trim() ?? "";
  return emailPattern.test(value) ? value : null;
}
