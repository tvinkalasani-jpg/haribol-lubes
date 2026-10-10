import type { CurrencyCode, Money } from "../../types/commerce";

const currencyFractionDigits: Record<CurrencyCode, number> = {
  KES: 2,
  USD: 2,
  UGX: 0,
  TZS: 0,
  RWF: 0,
};

export function isValidMinorAmount(value: unknown, { allowZero = false } = {}): value is number {
  return Number.isSafeInteger(value) && (allowZero ? Number(value) >= 0 : Number(value) > 0);
}

export function minorToMajor({ currency, minorAmount }: Money): number {
  return minorAmount / 10 ** currencyFractionDigits[currency];
}

export function formatMoney(money: Money, locale = "en-KE"): string {
  const fractionDigits = currencyFractionDigits[money.currency];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(minorToMajor(money)).replace(/\u00a0/g, " ");
}
