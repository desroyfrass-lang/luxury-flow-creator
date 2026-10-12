// Founder CJ review station — pure helpers (no network). A queue record is a
// stored CJ catalogue snapshot; nothing here invents shipping, FX, stock or variants.
export const STATION_STATUSES = ["pending", "drafted"] as const;
export type StationStatus = (typeof STATION_STATUSES)[number];

/** Founder-approved working names — suggestions only until the Founder saves a draft. */
export const SUGGESTED_NAMES: Record<string, string> = {
  "2607170938071630700": "The Empress Lace Maxi",
  "2607170943591639200": "Rebel Chic Shoulder Bag",
  "2607171029281633900": "Everyday Muse Top",
  "2607170956071616600": "Little Legend Plaid Shirt",
  "2607170940371632800": "The Class Act Blouse",
};

export type StationItem = {
  id: string;
  cjPid: string;
  sourceSku: string | null;
  supplierTitle: string;
  workingName: string | null;
  suggestedName: string | null;
  images: string[];
  supplierCost: number | null;
  currency: "USD";
  weightGrams: number | null;
  cjCategory: string | null;
  variants: [];
  status: StationStatus;
  draftProductId: string | null;
  missing: string[];
};

const https = (u: unknown): string | null => (typeof u === "string" && /^https:\/\//.test(u) ? u : null);
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.split("-")[0]) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function snapshotImages(cj: Record<string, unknown>, primary: string | null): string[] {
  const out = new Set<string>();
  const p = https(primary);
  if (p) out.add(p);
  for (const key of ["productImage", "productImageSet", "bigImage"]) {
    let v = cj[key];
    if (typeof v === "string" && v.trim().startsWith("[")) { try { v = JSON.parse(v); } catch { /* keep string */ } }
    for (const u of Array.isArray(v) ? v : [v]) { const h = https(u); if (h) out.add(h); }
  }
  return [...out].slice(0, 20);
}

type Row = { id: string; cj_pid: string; cj_data: unknown; title: string | null; image_url: string | null; source_price: number | string | null; status: string };

/** Map one stored queue row into what the station shows — unknowns stay null and are listed. */
export function mapQueueRow(row: Row, draftProductId: string | null = null): StationItem {
  const cj = (row.cj_data ?? {}) as Record<string, unknown>;
  const original = String(cj.productNameEn ?? cj.productName ?? row.title ?? "Untitled").slice(0, 500);
  const cost = row.source_price == null ? num(cj.sellPrice) : num(row.source_price);
  const sku = typeof cj.productSku === "string" && cj.productSku ? cj.productSku : null;
  const images = snapshotImages(cj, row.image_url);
  const cjCategory = typeof cj.categoryName === "string" ? cj.categoryName : null;
  const missing = [
    !sku && "Source SKU",
    cost == null && "Supplier cost",
    images.length === 0 && "Supplier photos",
    "Variants / sizes / colours (not in the stored CJ record)",
    "Shipping quote",
    "Stock",
  ].filter(Boolean) as string[];
  return {
    id: row.id, cjPid: row.cj_pid, sourceSku: sku, supplierTitle: original,
    workingName: row.title && row.title !== original ? row.title : null,
    suggestedName: SUGGESTED_NAMES[row.cj_pid] ?? null,
    images, supplierCost: cost, currency: "USD", weightGrams: num(cj.productWeight), cjCategory,
    variants: [], status: row.status === "drafted" ? "drafted" : "pending", draftProductId, missing,
  };
}

/** Draft payload built only from the stored server-side snapshot. */
export function draftPayload(item: StationItem) {
  return {
    offer: {
      sku: item.sourceSku, unit_cost: item.supplierCost, currency: item.currency,
      stock_quantity: null, lead_time_min_days: null, lead_time_max_days: null,
      fulfillment_mode: "dropship", ip_protection_level: "standard",
    },
    media: item.images.map((url) => ({ url })),
    variants: [] as never[],
  };
}

/** Profit and margin need verified shipping; a stored list price alone never yields them. */
export function stationPricing(item: StationItem) {
  return { supplierCost: item.supplierCost, shipping: null, margin: null, status: item.supplierCost == null ? "missing_cost" : "provisional_no_shipping" } as const;
}

// ---------- Supplier detail foundation (read-only CJ /product/query cache) ----------
export const DETAIL_REFRESH_MIN_MS = 10 * 60_000;

export type SupplierImage = { url: string; width: number | null; height: number | null; source: "product" | "variant" };
export type SupplierVariant = {
  vid: string; sku: string | null; key: string | null; name: string | null;
  colour: string | null; size: string | null; cost: number | null; weightGrams: number | null; image: string | null;
};
export type SupplierDetail = {
  pid: string; sku: string | null; originalName: string; description: string | null;
  supplierCost: number | null; currency: "USD"; cjCategory: string | null; weightGrams: number | null;
  images: SupplierImage[]; variants: SupplierVariant[]; colours: string[]; sizes: string[];
  /** Stock is not part of /product/query — never inferred. */
  inventory: { status: "not_fetched"; note: string };
  source: "cj_product_query"; fetchedAt: string;
};

const optionNames = (raw: unknown): string[] =>
  typeof raw === "string" ? raw.split("-").map((s) => s.trim().toLowerCase()) : [];

/** Map a raw CJ /product/query response. Throws if CJ returned a different product. Unknowns stay null. */
export function mapCjQueueDetail(x: Record<string, unknown>, expectedPid: string, fetchedAt: string): SupplierDetail {
  if (String(x.pid ?? "") !== expectedPid) throw new Error("CJ returned a different product");
  let set: unknown = x.productImageSet;
  if (typeof set === "string") { try { set = JSON.parse(set); } catch { set = [set]; } }
  const seen = new Set<string>();
  const images: SupplierImage[] = [];
  const add = (u: unknown, source: SupplierImage["source"]) => {
    const h = https(u); if (h && !seen.has(h) && images.length < 50) { seen.add(h); images.push({ url: h, width: null, height: null, source }); }
  };
  for (const u of Array.isArray(set) ? set : []) add(u, "product");
  add(x.bigImage, "product");
  const keys = optionNames(x.productKeyEn);
  const ci = keys.findIndex((k) => k.includes("colo"));
  const si = keys.findIndex((k) => k.includes("size"));
  const rawVariants = Array.isArray(x.variants) ? (x.variants as Array<Record<string, unknown>>).slice(0, 200) : [];
  const variants: SupplierVariant[] = rawVariants.map((v) => {
    const key = typeof v.variantKey === "string" ? v.variantKey : null;
    const parts = key ? key.split("-").map((s) => s.trim()) : [];
    const pick = (i: number) => (i >= 0 && parts.length === keys.length && parts[i] ? parts[i] : null);
    add(v.variantImage, "variant");
    return {
      vid: String(v.vid ?? ""), sku: typeof v.variantSku === "string" ? v.variantSku : null, key,
      name: typeof v.variantNameEn === "string" ? v.variantNameEn.slice(0, 300) : null,
      colour: pick(ci), size: pick(si), cost: num(v.variantSellPrice), weightGrams: num(v.variantWeight), image: https(v.variantImage),
    };
  }).filter((v) => v.vid);
  const uniq = (a: Array<string | null>) => [...new Set(a.filter(Boolean) as string[])];
  const desc = typeof x.description === "string" ? x.description.slice(0, 20000) : null;
  return {
    pid: expectedPid, sku: typeof x.productSku === "string" && x.productSku ? x.productSku : null,
    originalName: String(x.productNameEn ?? x.productName ?? "").slice(0, 500), description: desc,
    supplierCost: num(x.sellPrice), currency: "USD",
    cjCategory: typeof x.categoryName === "string" ? x.categoryName : null, weightGrams: num(x.productWeight),
    images, variants, colours: uniq(variants.map((v) => v.colour)), sizes: uniq(variants.map((v) => v.size)),
    inventory: { status: "not_fetched", note: "Stock is not included in CJ product detail and was not requested." },
    source: "cj_product_query", fetchedAt,
  };
}

/** Rate limit: refuse a remote refresh within the window. */
export function canRefreshDetail(fetchedAt: string | null, now: number): boolean {
  if (!fetchedAt) return true;
  const t = Date.parse(fetchedAt);
  return !Number.isFinite(t) || now - t >= DETAIL_REFRESH_MIN_MS;
}
