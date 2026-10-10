import type { CheckoutOrderLineSnapshot, OrderTotals, ResolvedCartLine } from "../../types/checkout";

function safeMultiply(left: number, right: number): number {
  const result = left * right;
  if (!Number.isSafeInteger(result)) throw new Error("Order total exceeds safe integer limits.");
  return result;
}

function safeAdd(values: readonly number[]): number {
  const result = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isSafeInteger(result)) throw new Error("Order total exceeds safe integer limits.");
  return result;
}

export function snapshotOrderLines(lines: readonly ResolvedCartLine[]): CheckoutOrderLineSnapshot[] {
  return lines.map((line) => {
    const lineSubtotalMinor = safeMultiply(line.regularUnitPriceMinor, line.quantity);
    const lineDiscountMinor = safeMultiply(line.unitDiscountMinor, line.quantity);
    const lineTotalMinor = safeMultiply(line.unitPriceMinor, line.quantity);
    return { ...line, lineSubtotalMinor, lineDiscountMinor, lineTaxMinor: 0, lineTotalMinor };
  });
}

export function calculateOrderTotals(lines: readonly CheckoutOrderLineSnapshot[], deliveryTotalMinor = 0): OrderTotals {
  if (lines.length === 0) throw new Error("An order requires at least one resolved line.");
  if (!Number.isSafeInteger(deliveryTotalMinor) || deliveryTotalMinor < 0) throw new Error("Delivery total must be a non-negative whole minor amount.");
  const currency = lines[0]!.currency;
  if (lines.some((line) => line.currency !== currency)) throw new Error("A single order cannot mix currencies.");
  const subtotalMinor = safeAdd(lines.map((line) => line.lineSubtotalMinor));
  const discountTotalMinor = safeAdd(lines.map((line) => line.lineDiscountMinor));
  const taxTotalMinor = safeAdd(lines.map((line) => line.lineTaxMinor));
  const grandTotalMinor = safeAdd([subtotalMinor, -discountTotalMinor, taxTotalMinor, deliveryTotalMinor]);
  if (grandTotalMinor < 0) throw new Error("Grand total cannot be negative.");
  return { currency, subtotalMinor, discountTotalMinor, taxTotalMinor, deliveryTotalMinor, grandTotalMinor };
}
