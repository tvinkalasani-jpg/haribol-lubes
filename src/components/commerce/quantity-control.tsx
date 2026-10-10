"use client";

type QuantityControlProps = {
  value: number;
  minimum: number;
  maximum?: number;
  label: string;
  onChange: (value: number) => void;
};

export function QuantityControl({ value, minimum, maximum, label, onChange }: QuantityControlProps) {
  const commit = (next: number) => onChange(Math.min(maximum ?? Number.MAX_SAFE_INTEGER, Math.max(minimum, Math.trunc(next || minimum))));
  return (
    <div className="commerce-quantity">
      <button aria-label={`Decrease ${label} quantity`} disabled={value <= minimum} onClick={() => commit(value - 1)} type="button">−</button>
      <label><span>Quantity</span><input aria-label={`${label} quantity`} inputMode="numeric" max={maximum} min={minimum} onChange={(event) => commit(Number(event.target.value))} step={1} type="number" value={value} /></label>
      <button aria-label={`Increase ${label} quantity`} disabled={maximum !== undefined && value >= maximum} onClick={() => commit(value + 1)} type="button">+</button>
    </div>
  );
}
