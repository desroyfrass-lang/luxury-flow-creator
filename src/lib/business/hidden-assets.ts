// ─────────────────────────────────────────────────────────────────────────────
// FRASS-P002-E — First Business Venture · Hidden Assets Monetization
//
// Founder Principle: before asking a member to create new wealth, help them
// discover the value they may already own. The best first business is often one
// that already exists.
//
// Platform-wide (any member, any category), with the coin collection as the
// first real venture. Rides on Money Moves (FRASS-0461), the Three-Layer
// Financial Engine (FRASS-0501) and Learn → Build → Monetize (FRASS-0480).
// No new subsystem: records live in `hidden_assets`, photos in the private
// `hidden-assets` bucket, income flows through the Wallet that already exists.
// ─────────────────────────────────────────────────────────────────────────────

import type { LayerId } from "@/lib/business/financial-layers";

export const HIDDEN_ASSETS_BUCKET = "hidden-assets";

export const HIDDEN_ASSETS_PRINCIPLE = {
  vision:
    "Many members already own valuable things without realising what they're worth.",
  rule:
    "Frassy begins with assets the member already owns before encouraging new investment, whenever that is practical.",
  goal: "Income with the lowest possible financial risk.",
  founder:
    "The best first business is often one that already exists. Frass helps members discover value in what they already own, organise it professionally, and guide it through to monetization one step at a time.",
  opening:
    "Let's see what hidden assets you already have before we start building something new.",
} as const;

/** Frassy never presents a research estimate as a promise. */
export const VALUATION_HONESTY = {
  never: "Frassy never guarantees a value or a sale price.",
  offers: "Research, organisation and comparison — then a professional appraisal when it's worth it.",
  label: "Research estimate — not a guarantee.",
} as const;

// ── Categories ──────────────────────────────────────────────────────────────

export type AssetCategoryId =
  | "coins"
  | "stamps"
  | "vintage"
  | "antiques"
  | "collectibles"
  | "jewelry"
  | "memorabilia"
  | "artwork"
  | "books"
  | "instruments"
  | "electronics"
  | "cameras"
  | "comics"
  | "business-assets"
  | "other";

export type AssetCategory = {
  id: AssetCategoryId;
  emoji: string;
  label: string;
  plain: string;
  /** The details worth recording for this kind of thing. */
  fields: string[];
};

export const ASSET_CATEGORIES: AssetCategory[] = [
  { id: "coins", emoji: "🪙", label: "Coin collection", plain: "Coins you've kept over the years.", fields: ["Country", "Year", "Denomination", "Markings", "Condition"] },
  { id: "stamps", emoji: "📮", label: "Stamp collection", plain: "Stamps, covers, albums.", fields: ["Country", "Year", "Denomination", "Perforation / markings", "Condition"] },
  { id: "vintage", emoji: "🧥", label: "Vintage items", plain: "Clothing and pieces from another era.", fields: ["Brand", "Era", "Size", "Labels / tags", "Condition"] },
  { id: "antiques", emoji: "🕯", label: "Antiques", plain: "Older household or decorative pieces.", fields: ["Maker", "Era", "Material", "Marks", "Condition"] },
  { id: "collectibles", emoji: "🧸", label: "Collectibles", plain: "Figures, toys, limited editions.", fields: ["Maker", "Year", "Edition", "Packaging", "Condition"] },
  { id: "jewelry", emoji: "💍", label: "Jewelry", plain: "Rings, chains, watches, heirlooms.", fields: ["Metal", "Stones", "Hallmarks", "Weight", "Condition"] },
  { id: "memorabilia", emoji: "🏆", label: "Sports memorabilia", plain: "Cards, signed items, match pieces.", fields: ["Player / team", "Year", "Signed?", "Certificate", "Condition"] },
  { id: "artwork", emoji: "🖼", label: "Artwork", plain: "Paintings, prints, sculpture.", fields: ["Artist", "Year", "Medium", "Signature", "Condition"] },
  { id: "books", emoji: "📚", label: "Books", plain: "First editions, rare or signed books.", fields: ["Author", "Edition", "Publisher", "Year", "Condition"] },
  { id: "instruments", emoji: "🎺", label: "Musical instruments", plain: "Anything you played or kept.", fields: ["Maker", "Model", "Serial", "Year", "Condition"] },
  { id: "electronics", emoji: "📻", label: "Electronics", plain: "Working or collectible equipment.", fields: ["Brand", "Model", "Year", "Working?", "Condition"] },
  { id: "cameras", emoji: "📷", label: "Camera equipment", plain: "Bodies, lenses, film gear.", fields: ["Brand", "Model", "Serial", "Working?", "Condition"] },
  { id: "comics", emoji: "🦸", label: "Comics", plain: "Issues, runs, boxes in storage.", fields: ["Title", "Issue", "Year", "Publisher", "Condition"] },
  { id: "business-assets", emoji: "🧰", label: "Unused business assets", plain: "Tools, stock or equipment not being used.", fields: ["Type", "Brand", "Age", "Working?", "Condition"] },
  { id: "other", emoji: "✨", label: "Something else valuable", plain: "Anything you think may be worth something.", fields: ["What it is", "Age", "Origin", "Markings", "Condition"] },
];

export const CATEGORY_BY_ID: Record<string, AssetCategory> = Object.fromEntries(
  ASSET_CATEGORIES.map((c) => [c.id, c]),
);

export function categoryFields(category: string): string[] {
  return CATEGORY_BY_ID[category]?.fields ?? CATEGORY_BY_ID["other"]!.fields;
}

// ── The four phases ─────────────────────────────────────────────────────────

export type PhaseId = "documentation" | "identification" | "valuation" | "monetization";

export type VenturePhase = {
  id: PhaseId;
  number: number;
  emoji: string;
  label: string;
  plain: string;
  steps: string[];
};

export const VENTURE_PHASES: VenturePhase[] = [
  {
    id: "documentation",
    number: 1,
    emoji: "📸",
    label: "Documentation",
    plain: "Take the pictures. That's all this phase is.",
    steps: [
      "Photograph the front",
      "Photograph the back",
      "Get the picture clear and close",
      "Say anything you already know about it",
      "I organise it for you",
    ],
  },
  {
    id: "identification",
    number: 2,
    emoji: "🔍",
    label: "Identification",
    plain: "We work out exactly what each piece is.",
    steps: [
      "Country of origin",
      "Year",
      "Denomination",
      "Visible markings",
      "Condition notes",
      "Collection category",
    ],
  },
  {
    id: "valuation",
    number: 3,
    emoji: "💵",
    label: "Valuation",
    plain: "We find out what people are actually paying.",
    steps: [
      "Organised research",
      "Comparable listings",
      "Auction results",
      "A professional appraisal where it's worth it",
    ],
  },
  {
    id: "monetization",
    number: 4,
    emoji: "🏷",
    label: "Monetization",
    plain: "Only if you decide to sell.",
    steps: [
      "Professional photographs",
      "Listing description",
      "Organised inventory",
      "Selling strategy",
      "Shipping preparation",
      "Buyer message templates",
    ],
  },
];

export const PHASE_BY_ID: Record<PhaseId, VenturePhase> = Object.fromEntries(
  VENTURE_PHASES.map((p) => [p.id, p]),
) as Record<PhaseId, VenturePhase>;

// ── Asset status ────────────────────────────────────────────────────────────

export type AssetStatus = "documented" | "identified" | "valued" | "listed" | "sold" | "kept";

export const STATUS_LABEL: Record<AssetStatus, string> = {
  documented: "Photographed",
  identified: "Identified",
  valued: "Researched",
  listed: "Listed for sale",
  sold: "Sold",
  kept: "Keeping it",
};

export type HiddenAsset = {
  id: string;
  venture: string;
  category: AssetCategoryId | string;
  name: string;
  notes: string | null;
  country: string | null;
  year_text: string | null;
  denomination: string | null;
  markings: string | null;
  condition_note: string | null;
  front_path: string | null;
  back_path: string | null;
  research_notes: string | null;
  estimated_low: number | null;
  estimated_high: number | null;
  appraisal_recommended: boolean;
  status: AssetStatus;
  listing_title: string | null;
  listing_description: string | null;
  listing_price: number | null;
  sold_amount: number | null;
  sold_at: string | null;
  created_at: string;
};

/** Which phase an individual piece is sitting in right now. */
export function phaseOf(asset: Pick<HiddenAsset, "front_path" | "back_path" | "country" | "year_text" | "estimated_low" | "status">): PhaseId {
  if (asset.status === "listed" || asset.status === "sold") return "monetization";
  if (asset.estimated_low != null || asset.status === "valued") return "valuation";
  const identified = Boolean(asset.country || asset.year_text) || asset.status === "identified";
  if (identified) return "identification";
  return "documentation";
}

export function isFullyPhotographed(asset: Pick<HiddenAsset, "front_path" | "back_path">): boolean {
  return Boolean(asset.front_path && asset.back_path);
}

// ── Venture progress ────────────────────────────────────────────────────────

export type VentureProgress = {
  total: number;
  photographed: number;
  identified: number;
  valued: number;
  listed: number;
  sold: number;
  earned: number;
  /** The phase the venture as a whole is in. */
  phase: PhaseId;
  firstDollarEarned: boolean;
  headline: string;
};

export function ventureProgress(assets: HiddenAsset[]): VentureProgress {
  const total = assets.length;
  const photographed = assets.filter(isFullyPhotographed).length;
  const identified = assets.filter((a) => phaseOf(a) !== "documentation").length;
  const valued = assets.filter((a) => a.estimated_low != null || a.status === "valued" || a.status === "listed" || a.status === "sold").length;
  const listed = assets.filter((a) => a.status === "listed" || a.status === "sold").length;
  const sold = assets.filter((a) => a.status === "sold").length;
  const earned = assets.reduce((sum, a) => sum + (a.status === "sold" ? Number(a.sold_amount ?? 0) : 0), 0);

  let phase: PhaseId = "documentation";
  if (listed > 0) phase = "monetization";
  else if (valued > 0) phase = "valuation";
  else if (identified > 0) phase = "identification";

  const firstDollarEarned = earned > 0;
  const headline = firstDollarEarned
    ? `You've earned your first ${money(earned)} from something you already owned.`
    : total === 0
      ? "Nothing photographed yet. One picture is the whole first step."
      : `${photographed} of ${total} photographed. ${PHASE_BY_ID[phase].label} is where we are.`;

  return { total, photographed, identified, valued, listed, sold, earned, phase, firstDollarEarned, headline };
}

export function money(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export function estimateRange(asset: Pick<HiddenAsset, "estimated_low" | "estimated_high">): string | null {
  if (asset.estimated_low == null && asset.estimated_high == null) return null;
  const low = asset.estimated_low ?? asset.estimated_high ?? 0;
  const high = asset.estimated_high ?? asset.estimated_low ?? 0;
  return low === high ? money(low) : `${money(low)} – ${money(high)}`;
}

/** What the collection might be worth, always labelled as research. */
export function collectionEstimate(assets: HiddenAsset[]): { low: number; high: number; counted: number } {
  let low = 0;
  let high = 0;
  let counted = 0;
  for (const a of assets) {
    if (a.estimated_low == null && a.estimated_high == null) continue;
    low += Number(a.estimated_low ?? a.estimated_high ?? 0);
    high += Number(a.estimated_high ?? a.estimated_low ?? 0);
    counted += 1;
  }
  return { low, high, counted };
}

// ── First Dollar Earned ─────────────────────────────────────────────────────

export const FIRST_DOLLAR = {
  id: "first-dollar-earned",
  emoji: "⭐",
  label: "First Dollar Earned",
  before: "The goal isn't to sell everything. It's to earn your first dollar through Frass — proof that this works.",
  after:
    "Congratulations. You've successfully completed your first Frass business. Now let's build the next one.",
} as const;

// ── Today's Money Move ──────────────────────────────────────────────────────

export type HiddenAssetMove = {
  id: string;
  label: string;
  why: string;
  impact: string;
  minutes: number;
  href: string;
  layer: LayerId;
  phase: PhaseId;
};

/**
 * One winnable step, chosen from where the venture actually stands.
 * Small, achievable, 15–20 minutes. Never a backlog.
 */
export function todaysAssetMove(assets: HiddenAsset[], categoryLabel = "coin"): HiddenAssetMove {
  const p = ventureProgress(assets);
  const href = "/workspace/first-venture";

  if (p.total === 0) {
    return {
      id: "photograph-first",
      label: `Photograph three ${categoryLabel}s from your collection`,
      why: "I'll organise them and prepare them for identification. You just take the pictures.",
      impact: "Starts your first business",
      minutes: 15,
      href,
      layer: "immediate-income",
      phase: "documentation",
    };
  }
  if (p.photographed < p.total || p.total < 5) {
    return {
      id: "photograph-more",
      label: `Photograph five more ${categoryLabel}s`,
      why: "Front and back. Nothing else needed today.",
      impact: "Builds your inventory",
      minutes: 20,
      href,
      layer: "immediate-income",
      phase: "documentation",
    };
  }
  if (p.identified < p.photographed) {
    return {
      id: "review-identification",
      label: "Review what I identified",
      why: "I've filled in the country, year and denomination. Correct anything I got wrong.",
      impact: "Makes them sellable",
      minutes: 15,
      href,
      layer: "business-builder",
      phase: "identification",
    };
  }
  if (p.valued < p.identified) {
    return {
      id: "research-value",
      label: "Look at the research on your three best pieces",
      why: "What people are actually paying — and whether an appraisal is worth it.",
      impact: "Tells you what you own",
      minutes: 20,
      href,
      layer: "business-builder",
      phase: "valuation",
    };
  }
  if (!p.firstDollarEarned) {
    return {
      id: "prepare-listing",
      label: "Prepare your highest-value piece for listing",
      why: "I write the description and set out the photos. You approve it.",
      impact: "Your first dollar",
      minutes: 20,
      href,
      layer: "immediate-income",
      phase: "monetization",
    };
  }
  return {
    id: "list-next",
    label: "List the next piece",
    why: "The first one sold. The second is easier — you already know how.",
    impact: "Repeats what worked",
    minutes: 20,
    href,
    layer: "immediate-income",
    phase: "monetization",
  };
}

/** What she learns by doing it, without being taught. */
export const LEARNING_BY_DOING = [
  "Documentation",
  "Research",
  "Pricing",
  "Listing",
  "Selling",
  "Shipping",
  "Customer communication",
] as const;
