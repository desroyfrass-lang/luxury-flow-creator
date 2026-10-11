// FRASS KICKS "Standard Shipping Included" (Founder-approved 2026-10-11).
// Standard delivery is built into each zone's retail price; the customer is
// not charged shipping again at checkout. Zones are configuration only here —
// nothing is switched on for shoppers, and Shopify checkout is untouched.
// No shipping amount is ever invented: a zone price needs a fresh saved quote.

export type ShippingZone = {
  code: string;
  name: string;
  countries: string[]; // ISO-3166 alpha-2
  currency: string;
  liveForShoppers: boolean; // always false until Founder enables after verification
};

export const SHIPPING_ZONES: ShippingZone[] = [
  { code: "US", name: "United States", countries: ["US"], currency: "USD", liveForShoppers: false },
  // Read-only quoting/planning only. Retail prices here need a verified FX source,
  // which does not exist yet, so pricing for these zones fails closed.
  { code: "CA", name: "Canada", countries: ["CA"], currency: "CAD", liveForShoppers: false },
  { code: "GB", name: "United Kingdom", countries: ["GB"], currency: "GBP", liveForShoppers: false },
  { code: "JM", name: "Jamaica", countries: ["JM"], currency: "JMD", liveForShoppers: false },
];

/** Saved quotes older than this are stale and refuse a price. */
export const QUOTE_TTL_HOURS = 72;

export type SavedQuote = { method: string; price: number; currency: string; fetched_at: string; expires_at: string; aging_days?: string | null };
export type QuoteStatus =
  | { status: "ok"; quote: SavedQuote }
  | { status: "stale"; quote: SavedQuote }
  | { status: "missing" }
  | { status: "quote_required"; reason: string }
  | { status: "unsupported"; reason: string };

export function zoneForCountry(country: string): ShippingZone | null {
  return SHIPPING_ZONES.find((z) => z.countries.includes(country.toUpperCase())) ?? null;
}

/**
 * Standard-shipping quote for one variant + destination. Uses the cheapest
 * fresh CJ option (the standard method has not been chosen by the Founder yet,
 * so callers must treat it as an estimate). Fails closed.
 */
export function standardQuote(country: string, quotes: SavedQuote[], now: Date, exception?: "oversized" | null): QuoteStatus {
  if (!zoneForCountry(country)) return { status: "unsupported", reason: `${country} is not a FRASS shipping zone yet.` };
  if (exception === "oversized") return { status: "quote_required", reason: "Oversized or heavy item — needs an individual quote." };
  const usable = quotes.filter((q) => Number.isFinite(q.price) && q.price >= 0);
  if (!usable.length) return { status: "missing" };
  const fresh = usable.filter((q) => new Date(q.expires_at).getTime() > now.getTime());
  if (!fresh.length) {
    const latest = [...usable].sort((a, b) => b.fetched_at.localeCompare(a.fetched_at))[0];
    return { status: "stale", quote: latest };
  }
  const cheapest = [...fresh].sort((a, b) => a.price - b.price)[0];
  return { status: "ok", quote: cheapest };
}
