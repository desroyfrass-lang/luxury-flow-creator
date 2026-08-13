// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0516 — Frass Creator Manufacturing Network
//
// One shared platform service. Every Business Vault that ends in a physical
// product uses THIS pipeline — never its own manufacturing engine.
//
//   💡 Idea → ✏️ Concept → 📐 Design → 🧪 Prototype → 📦 Sample → ✅ Approval
//   → 🏭 Manufacturing → 🛍 Marketplace → 🚚 Shipping → 💰 First Sale → 📈 Growth
//
// Frass is not the manufacturer. Frass connects creators to approved partners,
// and every product stays one product: one catalog, one inventory, one truth
// across Marketplace, Frass Card, Financial Center and Frass Shipping.
// ─────────────────────────────────────────────────────────────────────────────

export type PipelineStageKey =
  | "idea"
  | "concept"
  | "design"
  | "prototype"
  | "sample"
  | "approval"
  | "manufacturing"
  | "marketplace"
  | "shipping"
  | "first-sale"
  | "growth";

export type PipelineStage = {
  key: PipelineStageKey;
  emoji: string;
  label: string;
  /** Plain English — a kindergartener could follow it. */
  plain: string;
  /** Where in Frass this actually happens today. */
  to?: string;
};

/** The Frass Product Pipeline — universal across every category. */
export const PRODUCT_PIPELINE: PipelineStage[] = [
  { key: "idea", emoji: "💡", label: "Idea", plain: "You have a thing you want to make.", to: "/business-builder" },
  { key: "concept", emoji: "✏️", label: "Concept", plain: "Sketches, mood boards, colours, materials.", to: "/workspace/composer" },
  { key: "design", emoji: "📐", label: "Design", plain: "Proper drawings, measurements and specs a factory can read.", to: "/vault" },
  { key: "prototype", emoji: "🧪", label: "Prototype", plain: "The production package goes to a partner who can build it." },
  { key: "sample", emoji: "📦", label: "Sample", plain: "One real item is made and shipped to you to hold." },
  { key: "approval", emoji: "✅", label: "Approval", plain: "You approve, change or reject. Nothing is produced without your yes." },
  { key: "manufacturing", emoji: "🏭", label: "Manufacturing", plain: "Made on demand when someone orders. You hold no stock." },
  { key: "marketplace", emoji: "🛍", label: "Marketplace", plain: "The product goes live where people can buy it.", to: "/marketplace" },
  { key: "shipping", emoji: "🚚", label: "Shipping", plain: "The partner packs it and ships straight to the customer." },
  { key: "first-sale", emoji: "💰", label: "First Sale", plain: "Money lands, and the Financial Center records it.", to: "/financial-center" },
  { key: "growth", emoji: "📈", label: "Growth", plain: "More sizes, more pieces, the next collection." },
];

export type CreatorCategoryKey =
  | "fashion"
  | "footwear"
  | "bags"
  | "jewelry"
  | "home"
  | "beauty"
  | "art"
  | "lifestyle"
  | "children";

export type CreatorCategory = {
  key: CreatorCategoryKey;
  emoji: string;
  label: string;
  items: string[];
  /** Where the finished work is shown to the world, if a showcase exists. */
  showcase?: { label: string; to: string };
  /** Which Business Vault builds the business behind it. */
  vaultKey?: string;
  /** Extra care required before production. */
  compliance?: string;
};

export const CREATOR_CATEGORIES: CreatorCategory[] = [
  {
    key: "fashion",
    emoji: "👗",
    label: "Fashion",
    items: ["Clothing", "Streetwear", "Luxury fashion", "Children's clothing", "Sportswear", "Uniforms"],
    showcase: { label: "Afro Designers", to: "/afro-designers" },
    vaultKey: "seamstress",
  },
  {
    key: "footwear",
    emoji: "👟",
    label: "Footwear",
    items: ["Sneakers", "Dress shoes", "Sandals", "Boots", "Athletic footwear"],
    showcase: { label: "Frass Kicks", to: "/frass-kicks" },
    vaultKey: "footwear",
  },
  {
    key: "bags",
    emoji: "👜",
    label: "Bags & Leather",
    items: ["Handbags", "Backpacks", "Wallets", "Travel bags", "Fashion accessories"],
    showcase: { label: "Marketplace", to: "/marketplace" },
    vaultKey: "bags",
  },
  {
    key: "jewelry",
    emoji: "💍",
    label: "Jewelry",
    items: ["Rings", "Necklaces", "Bracelets", "Earrings", "Watches", "Fashion jewelry"],
    showcase: { label: "Marketplace", to: "/marketplace" },
    vaultKey: "jewelry",
  },
  {
    key: "home",
    emoji: "🪑",
    label: "Home",
    items: ["Furniture", "Home décor", "Lighting", "Bedding", "Kitchen accessories"],
    showcase: { label: "Marketplace", to: "/marketplace" },
    vaultKey: "woodworking",
  },
  {
    key: "beauty",
    emoji: "🧴",
    label: "Beauty",
    items: ["Cosmetics", "Skincare", "Haircare", "Fragrances", "Beauty accessories"],
    showcase: { label: "Marketplace", to: "/marketplace" },
    vaultKey: "beauty",
    compliance: "Cosmetic ingredient and labelling rules are confirmed with the partner before any batch.",
  },
  {
    key: "art",
    emoji: "🖼️",
    label: "Art & Collectibles",
    items: ["Prints", "Sculptures", "Decorative objects", "Limited editions"],
    showcase: { label: "Frass Gallery", to: "/gallery" },
    vaultKey: "visual-creator",
  },
  {
    key: "lifestyle",
    emoji: "🎒",
    label: "Lifestyle Products",
    items: ["Drinkware", "Stationery", "Phone accessories", "Office products", "Gift items"],
    showcase: { label: "Marketplace", to: "/marketplace" },
  },
  {
    key: "children",
    emoji: "🧸",
    label: "Children's Products",
    items: ["Educational materials", "Toys", "Nursery décor"],
    showcase: { label: "Frass Kids", to: "/frass-kids" },
    compliance: "Children's safety standards must be confirmed by the partner before production. No exceptions.",
  },
];

export type ManufacturingPartner = {
  key: string;
  name: string;
  region: string;
  categories: CreatorCategoryKey[];
  specialties: string[];
  minimumOrder: string;
  sampleDays: number;
  notes: string;
};

/** Approved partner network. Frassy recommends; the member always chooses. */
export const MANUFACTURING_PARTNERS: ManufacturingPartner[] = [
  {
    key: "atelier-kingston",
    name: "Atelier Kingston",
    region: "Jamaica",
    categories: ["fashion"],
    specialties: ["Cut and sew", "Custom tailoring", "Small runs", "Cultural fashion"],
    minimumOrder: "1 piece (made to order)",
    sampleDays: 12,
    notes: "Best for first collections and made-to-order pieces close to home.",
  },
  {
    key: "accra-textile-house",
    name: "Accra Textile House",
    region: "Ghana",
    categories: ["fashion", "bags"],
    specialties: ["Woven and printed textiles", "Heritage prints", "Sustainable fabric"],
    minimumOrder: "25 pieces",
    sampleDays: 18,
    notes: "Strong on authentic West African textiles and dyeing.",
  },
  {
    key: "porto-sole",
    name: "Porto Sole Footwear",
    region: "Portugal",
    categories: ["footwear"],
    specialties: ["Sneakers", "Leather dress shoes", "Boots"],
    minimumOrder: "50 pairs",
    sampleDays: 25,
    notes: "Premium footwear construction with proper last development.",
  },
  {
    key: "leon-leather",
    name: "León Leather Works",
    region: "Mexico",
    categories: ["bags", "footwear"],
    specialties: ["Handbags", "Wallets", "Small leather goods"],
    minimumOrder: "20 pieces",
    sampleDays: 15,
    notes: "Hand-finished leather at accessible volumes.",
  },
  {
    key: "bangkok-fine-metals",
    name: "Bangkok Fine Metals",
    region: "Thailand",
    categories: ["jewelry"],
    specialties: ["Silver", "Gold plating", "Casting", "Stone setting"],
    minimumOrder: "10 pieces",
    sampleDays: 14,
    notes: "Good for first jewelry lines; CAD files accepted.",
  },
  {
    key: "north-mill-furniture",
    name: "North Mill Furniture",
    region: "Canada",
    categories: ["home"],
    specialties: ["Solid wood furniture", "Made-to-order", "Finishing"],
    minimumOrder: "1 piece",
    sampleDays: 21,
    notes: "Made-to-order furniture with deposit-based production.",
  },
  {
    key: "isle-formulations",
    name: "Isle Formulations",
    region: "Barbados",
    categories: ["beauty"],
    specialties: ["Skincare", "Haircare", "Natural formulations", "Private label"],
    minimumOrder: "250 units",
    sampleDays: 20,
    notes: "Handles compliant labelling and batch documentation.",
  },
  {
    key: "open-press",
    name: "Open Press On-Demand",
    region: "United States",
    categories: ["fashion", "art", "lifestyle", "children"],
    specialties: ["Print on demand", "Drinkware", "Prints", "No minimums"],
    minimumOrder: "1 unit",
    sampleDays: 7,
    notes: "Zero-inventory start. Ideal for a first product and a first sale.",
  },
];

export type PartnerFit = { partner: ManufacturingPartner; reason: string };

/**
 * Frassy's recommendation. Category first, then how small the member can start,
 * then how fast they can hold a sample. Never a single forced answer.
 */
export function recommendPartners(
  category: CreatorCategoryKey,
  opts: { startingSmall?: boolean } = {},
): PartnerFit[] {
  const matches = MANUFACTURING_PARTNERS.filter((p) => p.categories.includes(category));
  const scored = matches.map((p) => {
    const low = /^1 /.test(p.minimumOrder) || parseInt(p.minimumOrder, 10) <= 25;
    const reason = opts.startingSmall
      ? low
        ? `Lets you start at ${p.minimumOrder.toLowerCase()} — no inventory risk.`
        : `Better once you're selling steadily (${p.minimumOrder} minimum).`
      : `${p.specialties.slice(0, 2).join(", ")} · sample in about ${p.sampleDays} days.`;
    const score = (opts.startingSmall && low ? 100 : 0) - p.sampleDays;
    return { partner: p, reason, score };
  });
  return scored.sort((a, b) => b.score - a.score).map(({ partner, reason }) => ({ partner, reason }));
}

export function categoryByKey(key: string): CreatorCategory | undefined {
  return CREATOR_CATEGORIES.find((c) => c.key === key);
}

export function categoriesForVault(vaultKey: string): CreatorCategory[] {
  return CREATOR_CATEGORIES.filter((c) => c.vaultKey === vaultKey);
}

export const MANUFACTURING_PRINCIPLE = {
  headline:
    "Creativity should never be limited by manufacturing, inventory or logistics.",
  plain:
    "What this means in plain English: you draw it, Frass finds someone who can build it, they make one so you can check it, and after you say yes they only make more when somebody buys. You never buy stock and you never own a factory.",
  ip: "You own your designs. Frass helps you organise and document them — it never claims them.",
};
