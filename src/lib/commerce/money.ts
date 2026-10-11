// Deterministic money arithmetic for pricing: values are rounded half-up to
// whole cents using decimal-string scaling (avoids 1.005 → 1.00 float drift).
// Pure foundation only — not a bookkeeping ledger.

/** Round a dollar amount to cents, half away from zero, deterministically. */
export function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return n;
  const sign = n < 0 ? -1 : 1;
  const [int, frac = ""] = Math.abs(n).toFixed(10).split(".");
  const cents = Number(int) * 100 + Number(frac.slice(0, 2).padEnd(2, "0")) + (Number(frac[2] ?? "0") >= 5 ? 1 : 0);
  return (sign * cents) / 100;
}

export const toCents = (n: number) => Math.round(roundMoney(n) * 100);
export const fromCents = (c: number) => c / 100;

/** Sum money amounts exactly in cents. */
export function sumMoney(...xs: number[]): number {
  return fromCents(xs.reduce((a, x) => a + toCents(x), 0));
}

/** Percentage of an amount, rounded to cents. */
export function pctOf(amount: number, pct: number): number {
  return roundMoney((amount * pct) / 100);
}
