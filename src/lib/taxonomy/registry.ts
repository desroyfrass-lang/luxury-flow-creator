// FRASS Product Taxonomy Registry (Phase B).
//
// One classification map for incoming products. It REUSES the existing store
// definitions (drip-catalog, frass-kids, frass-plus) and the same handle
// formulas the storefront routes already use — it never redefines them, so
// navigation and public collections are unchanged.
//
// Rules:
// - Every product gets exactly ONE primary store + one category path.
// - Overlays (virals, founder picks, new arrivals, best sellers) are tags
//   layered on top; they are never primary stores.
// - Anything not yet Founder-confirmed is `pending` and cannot be assigned.

import {
  MEN_CATEGORIES,
  WOMEN_CATEGORIES,
  KICKS_SECTIONS,
  BARE_MEN_CATEGORIES,
  BARE_WOMEN_CATEGORIES,
} from "@/lib/drip-catalog";
import { KIDS_SEGMENTS, KIDS_COLLECTIONS, kidsHandle } from "@/lib/frass-kids";
import { toPlusHandle } from "@/lib/frass-plus";
import { SHAPE_MEN_CATEGORIES, SHAPE_WOMEN_CATEGORIES, shapeHandle } from "@/lib/shape-catalog";
import { LUXURY_COLLECTIONS } from "@/lib/luxury-house";
import { MARKETPLACE_GROUPS } from "@/lib/bridal";
import { SERVICE_CATEGORIES } from "@/lib/services/marketplace";

export const PRIMARY_STORES = [
  { id: "marketplace", title: "FRASS Marketplace" },
  { id: "kicks", title: "Frass Kicks" },
  { id: "drip", title: "Frass Drip" },
  { id: "bare-drip", title: "Bare Drip" },
  { id: "kids", title: "Frass Kids" },
  { id: "plus", title: "Frass Plus+" },
  { id: "luxury-house", title: "Luxury House" },
  { id: "bridal", title: "Frass Bridal" },
  { id: "shape", title: "Frass Shape" },
] as const;
export type PrimaryStoreId = (typeof PRIMARY_STORES)[number]["id"];

export const OVERLAYS = [
  { id: "social-media-virals", title: "Social Media Virals" },
  { id: "founder-picks", title: "Founder Picks" },
  { id: "new-arrivals", title: "New Arrivals" },
  { id: "best-sellers", title: "Best Sellers" },
] as const;
export type OverlayId = (typeof OVERLAYS)[number]["id"];

export type SafetyGate = "infant-water-safety";

export interface TaxonomyNode {
  /** Unique classification key, e.g. "drip/mens-work-drip-dress-shirts". */
  key: string;
  store: PrimaryStoreId;
  title: string;
  /** Existing storefront collection handle, when one already exists. */
  handle?: string;
  status: "active" | "provisional" | "pending";
  /**
   * Physical goods vs bookable services. "product-or-service" allows either,
   * chosen explicitly per listing (currently Bridal Wedding Cakes only).
   */
  kind: "product" | "service" | "product-or-service";
  /** Product cannot be drafted into this node without passing this gate. */
  safetyGate?: SafetyGate;
}

// ---- Marketplace (provisional; subcategories pending Founder confirmation) --
export const MARKETPLACE_CATEGORIES = [
  ["home-living", "Home & Living"],
  ["baby-kids", "Baby & Kids"],
  ["beauty-personal-care", "Beauty & Personal Care"],
  ["electronics-gadgets", "Electronics & Gadgets"],
  ["health-fitness-wellness", "Health, Fitness & Wellness"],
  ["garden-outdoors", "Garden & Outdoors"],
  ["pet-world", "Pet World"],
  ["auto-travel", "Auto & Travel"],
] as const;

function marketplaceNodes(): TaxonomyNode[] {
  const nodes: TaxonomyNode[] = MARKETPLACE_CATEGORIES.map(([slug, title]) => ({
    key: `marketplace/${slug}`,
    store: "marketplace",
    title,
    status: "provisional",
    kind: "product",
  }));
  // Non-fashion infant swim gear (floats, vests) lives here, NOT in Kids or
  // Bare Drip, and always requires a safety review.
  nodes.push({
    key: "marketplace/baby-kids/swimming-water-play",
    store: "marketplace",
    title: "Swimming & Water Play",
    status: "provisional",
    kind: "product",
    safetyGate: "infant-water-safety",
  });
  nodes.push({
    key: "marketplace/_subcategories",
    store: "marketplace",
    title: "Remaining Marketplace subcategories (awaiting Founder confirmation)",
    status: "pending",
    kind: "product",
  });
  return nodes;
}

// ---- Fashion stores derived from existing definitions ----------------------
const GENDERS = [
  ["mens", MEN_CATEGORIES, BARE_MEN_CATEGORIES, "men"],
  ["womens", WOMEN_CATEGORIES, BARE_WOMEN_CATEGORIES, "women"],
] as const;

function standardFashionNodes(): TaxonomyNode[] {
  const out: TaxonomyNode[] = [];
  for (const [prefix, drip, bare, g] of GENDERS) {
    for (const [section, title] of KICKS_SECTIONS) {
      const handle = `${section}-kicks-${g}`;
      out.push({ key: `kicks/${handle}`, store: "kicks", title: `${title} Kicks (${g})`, handle, status: "active", kind: "product" });
    }
    for (const [cat, def] of Object.entries(drip)) {
      for (const [slug, title, override] of def.subs) {
        const handle = override ?? `${prefix}-${cat}-drip-${slug}`;
        // Shared collections (e.g. frass-drip-90s-*) serve both genders on the
        // live site; classify them once.
        if (out.some((n) => n.handle === handle)) continue;
        out.push({ key: `drip/${handle}`, store: "drip", title: `${def.title} — ${title}`, handle, status: "active", kind: "product" });
      }
    }
    for (const [cat, def] of Object.entries(bare)) {
      for (const [slug, title] of def.subs) {
        const handle = `${prefix}-bare-drip-${cat}-${slug}`;
        out.push({ key: `bare-drip/${handle}`, store: "bare-drip", title: `${def.title} — ${title}`, handle, status: "active", kind: "product" });
      }
    }
  }
  return out;
}

function kidsNodes(): TaxonomyNode[] {
  const out: TaxonomyNode[] = [];
  for (const seg of KIDS_SEGMENTS) {
    for (const col of KIDS_COLLECTIONS) {
      for (const [sub, title] of col.subs) {
        const handle = kidsHandle(seg, col.slug, sub);
        out.push({ key: `kids/${handle}`, store: "kids", title: `${seg.title} ${col.title} — ${title}`, handle, status: "active", kind: "product" });
      }
    }
  }
  return out;
}

/** Plus+ mirrors the standard Kicks/Drip/Bare architecture with `-plus`. */
function plusNodes(standard: TaxonomyNode[]): TaxonomyNode[] {
  return standard
    .filter((n) => n.handle && (n.store === "kicks" || n.store === "drip" || n.store === "bare-drip"))
    .map((n) => {
      const handle = toPlusHandle(n.handle!);
      return { key: `plus/${handle}`, store: "plus" as const, title: `${n.title} Plus+`, handle, status: "active" as const, kind: "product" as const };
    });
}

/** Luxury House: the six existing East/West Wing collections, exact handles. */
function luxuryNodes(): TaxonomyNode[] {
  return (["men", "women"] as const).flatMap((g) =>
    LUXURY_COLLECTIONS[g].map((c) => ({
      key: `luxury-house/${c.handle}`,
      store: "luxury-house" as const,
      title: `Luxury House ${g === "men" ? "Men" : "Women"} — ${c.title}`,
      handle: c.handle,
      status: "active" as const,
      kind: "product" as const,
    })),
  );
}

/** Frass Shape: derived from the existing men's/women's storefront definitions. */
function shapeNodes(): TaxonomyNode[] {
  const out: TaxonomyNode[] = [];
  for (const [g, cats] of [["men", SHAPE_MEN_CATEGORIES], ["women", SHAPE_WOMEN_CATEGORIES]] as const) {
    for (const [cat, def] of Object.entries(cats)) {
      for (const [sub, title] of def.subs) {
        const handle = shapeHandle(g, cat, sub);
        out.push({ key: `shape/${handle}`, store: "shape", title: `${def.title} — ${title}`, handle, status: "active", kind: "product" });
      }
    }
  }
  return out;
}

/**
 * Frass Bridal wedding-marketplace labels that are bookable SERVICES (people,
 * venues, travel, food prepared for the day). Every other label in the
 * existing Bridal list is a physical product.
 */
export const BRIDAL_SERVICE_LABELS = new Set<string>([
  "Reception", "Catering",
  "Photography", "Videography", "Hair", "Makeup", "Wedding Planners", "Officiants",
  "DJs", "Bands", "Musicians", "Entertainment", "Transportation",
  "Honeymoon", "Hotels", "Destination Weddings", "Guest Accommodation", "Rentals",
]);

const slugify = (t: string) => t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Bridal labels a vendor may list either as a ready product or a custom-order service. */
export const BRIDAL_DUAL_LABELS = new Set<string>(["Cake"]);

/** Bridal: mirrors the existing Wedding Marketplace groups (no Shopify handles yet). */
function bridalNodes(): TaxonomyNode[] {
  return MARKETPLACE_GROUPS.flatMap((g) =>
    g.items.map((item) => ({
      key: `bridal/${slugify(g.group)}/${slugify(item)}`,
      store: "bridal" as const,
      title: `${g.group} — ${item}`,
      status: "provisional" as const,
      kind: BRIDAL_DUAL_LABELS.has(item)
        ? ("product-or-service" as const)
        : BRIDAL_SERVICE_LABELS.has(item)
          ? ("service" as const)
          : ("product" as const),
    })),
  );
}

/** Marketplace services: the already-built Services Marketplace categories. */
function marketplaceServiceNodes(): TaxonomyNode[] {
  return SERVICE_CATEGORIES.map((c) => ({
    key: `marketplace-services/${c.id}`,
    store: "marketplace" as const,
    title: c.label,
    status: "active" as const,
    kind: "service" as const,
  }));
}

export function buildTaxonomy(): TaxonomyNode[] {
  const standard = standardFashionNodes();
  return [...marketplaceNodes(), ...standard, ...kidsNodes(), ...plusNodes(standard),
    ...luxuryNodes(), ...shapeNodes(), ...bridalNodes(), ...marketplaceServiceNodes()];
}

export const TAXONOMY: readonly TaxonomyNode[] = buildTaxonomy();
const BY_KEY = new Map(TAXONOMY.map((n) => [n.key, n]));
export function getTaxonomyNode(key: string) {
  return BY_KEY.get(key);
}

// ---- Validation -------------------------------------------------------------
export interface ProductClassification {
  primaryStore: string;
  categoryKey: string;
  overlays?: string[];
  /** Founder/reviewer confirmed the safety gate for this node. */
  safetyGateCleared?: SafetyGate;
  /**
   * What this listing is. Defaults to "product". Must be stated explicitly
   * for "product-or-service" categories (e.g. Wedding Cakes).
   */
  listingKind?: "product" | "service";
}

const PRIMARY_IDS = new Set<string>(PRIMARY_STORES.map((s) => s.id));
const OVERLAY_IDS = new Set<string>(OVERLAYS.map((o) => o.id));

export function validateClassification(c: ProductClassification): string[] {
  const errors: string[] = [];
  if (OVERLAY_IDS.has(c.primaryStore)) errors.push("overlay_cannot_be_primary");
  else if (!PRIMARY_IDS.has(c.primaryStore)) errors.push("unknown_primary_store");
  const node = BY_KEY.get(c.categoryKey);
  if (!node) errors.push("unknown_category");
  else {
    if (node.store !== c.primaryStore) errors.push("category_not_in_primary_store");
    const listing = c.listingKind ?? "product";
    if (node.kind === "product-or-service") {
      if (!c.listingKind) errors.push("listing_kind_required");
    } else if (node.kind === "service" && listing === "product") {
      errors.push("service_category_not_for_products");
    } else if (node.kind === "product" && listing === "service") {
      errors.push("product_category_not_for_services");
    }
    if (node.status === "pending") errors.push("category_pending_founder_confirmation");
    if (node.safetyGate && c.safetyGateCleared !== node.safetyGate) errors.push("safety_gate_required");
  }
  const overlays = c.overlays ?? [];
  if (new Set(overlays).size !== overlays.length) errors.push("duplicate_overlay");
  for (const o of overlays) {
    if (PRIMARY_IDS.has(o)) errors.push("primary_store_used_as_overlay");
    else if (!OVERLAY_IDS.has(o)) errors.push("unknown_overlay");
  }
  return errors;
}

/** Registry integrity: no duplicate keys or handles across stores. */
export function registryIntegrityErrors(nodes: readonly TaxonomyNode[] = TAXONOMY): string[] {
  const errors: string[] = [];
  const keys = new Set<string>();
  const handles = new Set<string>();
  for (const n of nodes) {
    if (keys.has(n.key)) errors.push(`duplicate_key:${n.key}`);
    keys.add(n.key);
    if (n.handle) {
      if (handles.has(n.handle)) errors.push(`duplicate_handle:${n.handle}`);
      handles.add(n.handle);
    }
    if (!PRIMARY_IDS.has(n.store)) errors.push(`bad_store:${n.key}`);
  }
  return errors;
}
