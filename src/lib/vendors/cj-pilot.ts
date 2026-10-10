// Pilot P1 — pure helpers (testable, no network).
export const PILOT_CJ_PID = "2606050313341622800";
export const PILOT_CJ_SKU = "CJQB2922537";
export const PILOT_CATEGORY = { primaryStore: "drip", categoryKey: "drip/womens-work-drip-work-blouses" } as const;
/** Pilot P1 may only be placed in Frass Drip → Women's product categories (Founder picks which). */
export const PILOT_CATEGORY_PREFIX = "drip/womens-";
export function isPilotCategoryAllowed(primaryStore: string, categoryKey: string): boolean {
  return primaryStore === PILOT_CATEGORY.primaryStore && categoryKey.startsWith(PILOT_CATEGORY_PREFIX);
}

export type PilotVariant = { ref: string; sku: string | null; label: string | null; cost: number | null; weight: number | null; image: string | null };
export type PilotDetail = {
  pid: string;
  sku: string;
  originalName: string;
  supplierCost: number | null;
  currency: "USD";
  images: string[];
  variants: PilotVariant[];
  cjCategory: string | null;
  /** Unknown fields stay null — never invented. */
  stock: null;
  leadTimeDays: null;
};

const https = (u: unknown): string | null => (typeof u === "string" && /^https:\/\//.test(u) ? u : null);
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.split("-")[0]) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Is the pilot product in the Founder's own CJ "My Products" page rows? */
export function isInMyProducts(rows: Array<Record<string, unknown>>): boolean {
  return rows.some((r) => String(r.productId ?? "") === PILOT_CJ_PID || String(r.sku ?? "") === PILOT_CJ_SKU);
}

/** Map a raw CJ /product/query response into the truthful pilot record. */
export function mapCjDetail(x: Record<string, unknown>): PilotDetail {
  if (String(x.pid ?? "") !== PILOT_CJ_PID) throw new Error("CJ returned a different product");
  let imgs: unknown = x.productImageSet;
  if (typeof imgs === "string") { try { imgs = JSON.parse(imgs); } catch { imgs = []; } }
  const images = Array.from(new Set((Array.isArray(imgs) ? imgs : []).map(https).filter(Boolean) as string[])).slice(0, 20);
  const variants = (Array.isArray(x.variants) ? (x.variants as Array<Record<string, unknown>>) : []).slice(0, 100).map((v) => ({
    ref: String(v.vid ?? ""),
    sku: typeof v.variantSku === "string" ? v.variantSku : null,
    label: typeof v.variantKey === "string" ? v.variantKey : null,
    cost: num(v.variantSellPrice),
    weight: num(v.variantWeight),
    image: https(v.variantImage),
  })).filter((v) => v.ref);
  return {
    pid: PILOT_CJ_PID,
    sku: String(x.productSku ?? ""),
    originalName: String(x.productNameEn ?? "").slice(0, 500),
    supplierCost: num(x.sellPrice),
    currency: "USD",
    images,
    variants,
    cjCategory: typeof x.categoryName === "string" ? x.categoryName : null,
    stock: null,
    leadTimeDays: null,
  };
}

export const NAME_STYLES = ["simple_elegant", "playful", "caribbean_frass"] as const;
export type NameSuggestion = { style: (typeof NAME_STYLES)[number]; name: string; why: string };

/** Clean model output: 3 distinct styles, distinct names, sane length. */
export function cleanSuggestions(list: NameSuggestion[], originalName: string): NameSuggestion[] {
  const seen = new Set<string>();
  const out: NameSuggestion[] = [];
  for (const s of list) {
    const name = s.name.trim().replace(/\s+/g, " ").slice(0, 80);
    const k = name.toLowerCase();
    if (name.length < 3 || seen.has(k) || k === originalName.trim().toLowerCase()) continue;
    if (!NAME_STYLES.includes(s.style) || out.some((o) => o.style === s.style)) continue;
    seen.add(k);
    out.push({ style: s.style, name, why: s.why.trim().slice(0, 200) });
  }
  return out;
}
