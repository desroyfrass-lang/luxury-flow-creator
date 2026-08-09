// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0408 §2 — Brand Partnership Marketplace.
//
// Brand partnerships are a permanent part of the Marketplace and the Affiliate
// ecosystem. Faceless creators are first-class: no campaign may require an
// on-camera appearance unless the brief explicitly asks for it.
// ─────────────────────────────────────────────────────────────────────────────

export type CampaignCategory =
  | "fashion"
  | "beauty"
  | "fitness"
  | "travel"
  | "technology"
  | "food"
  | "automotive"
  | "education";

export const CAMPAIGN_CATEGORIES: { key: CampaignCategory; label: string; icon: string }[] = [
  { key: "fashion", label: "Fashion", icon: "🧥" },
  { key: "beauty", label: "Beauty", icon: "💄" },
  { key: "fitness", label: "Fitness", icon: "🏋🏾" },
  { key: "travel", label: "Travel", icon: "✈️" },
  { key: "technology", label: "Technology", icon: "💡" },
  { key: "food", label: "Food", icon: "🍲" },
  { key: "automotive", label: "Automotive", icon: "🚗" },
  { key: "education", label: "Education", icon: "📚" },
];

/** Every way a creator can deliver a campaign without ever showing their face. */
export const FACELESS_FORMATS = [
  "AI-generated video",
  "Motion graphics",
  "Product demonstration",
  "Voice-over video",
  "Tutorial",
  "Animation",
  "Documentary-style edit",
  "Lifestyle B-roll",
  "Screen recording",
];

export type CompensationModel = "fixed" | "performance" | "affiliate" | "revenue-share";

export const COMPENSATION_MODELS: {
  key: CompensationModel;
  label: string;
  plain: string;
}[] = [
  { key: "fixed", label: "Fixed fee", plain: "A set amount, paid on approved delivery." },
  { key: "performance", label: "Performance bonus", plain: "Extra on top when the work performs." },
  { key: "affiliate", label: "Affiliate commission", plain: "A cut of every sale your link brings in." },
  { key: "revenue-share", label: "Revenue share", plain: "An agreed share of what the campaign earns." },
];

export type BrandCampaign = {
  key: string;
  brand: string;
  title: string;
  category: CampaignCategory;
  /** The one-paragraph brief. */
  brief: string;
  guidelines: string[];
  deliverables: string[];
  compensation: { model: CompensationModel; detail: string }[];
  deadlineDays: number;
  onCameraRequired: boolean;
  status: "open" | "reviewing" | "closed";
};

/** Launch catalogue — the shape every brand brief must follow. */
export const BRAND_CAMPAIGNS: BrandCampaign[] = [
  {
    key: "island-skin-serum",
    brand: "Island Skin",
    title: "Morning ritual — 30 second faceless edit",
    category: "beauty",
    brief:
      "A calm, tactile 30-second piece about a morning skincare ritual. Product-first, hands only, warm island light.",
    guidelines: [
      "Product visible for at least 8 seconds.",
      "No competitor products in frame.",
      "Soft natural light — no harsh ring light.",
      "Voice-over optional; text-on-screen accepted.",
    ],
    deliverables: ["1× 30s vertical video", "3× stills", "Raw B-roll folder"],
    compensation: [
      { model: "fixed", detail: "US$250 on approved delivery" },
      { model: "affiliate", detail: "12% on attributed sales for 60 days" },
    ],
    deadlineDays: 14,
    onCameraRequired: false,
    status: "open",
  },
  {
    key: "kingston-motors-reveal",
    brand: "Kingston Motors",
    title: "Launch teaser — motion graphics only",
    category: "automotive",
    brief:
      "A 15-second cinematic teaser built entirely from supplied renders and motion graphics. No presenter, no dialogue.",
    guidelines: [
      "Use the supplied brand type and palette.",
      "Sound design required; licensed music only.",
      "End card holds the logo for 2 seconds.",
    ],
    deliverables: ["1× 15s 16:9", "1× 15s 9:16"],
    compensation: [
      { model: "fixed", detail: "US$600 on approved delivery" },
      { model: "performance", detail: "US$200 bonus at 250k verified views" },
    ],
    deadlineDays: 21,
    onCameraRequired: false,
    status: "open",
  },
  {
    key: "yaad-kitchen-series",
    brand: "Yaad Kitchen",
    title: "Five-part recipe series",
    category: "food",
    brief:
      "Five short recipe films shot overhead. Hands and food only — the dish is the star.",
    guidelines: [
      "Overhead framing for cooking steps.",
      "Ingredients listed on screen.",
      "Caribbean seasoning line must appear in every episode.",
    ],
    deliverables: ["5× 45s vertical videos", "1× series trailer"],
    compensation: [
      { model: "fixed", detail: "US$900 for the series" },
      { model: "revenue-share", detail: "8% of attributed spice-box sales" },
    ],
    deadlineDays: 30,
    onCameraRequired: false,
    status: "open",
  },
  {
    key: "hilltop-fitness-coach",
    brand: "Hilltop Fitness",
    title: "Coach-led programme walkthrough",
    category: "fitness",
    brief: "A presenter-led walkthrough of the 8-week programme. This brief does require on-camera work.",
    guidelines: ["Presenter on camera", "Gym or outdoor setting", "No medical claims"],
    deliverables: ["1× 90s landscape video", "2× 20s cutdowns"],
    compensation: [{ model: "fixed", detail: "US$450 on approved delivery" }],
    deadlineDays: 18,
    onCameraRequired: true,
    status: "open",
  },
  {
    key: "study-hill-course",
    brand: "Study Hill",
    title: "Screen-recorded course explainer",
    category: "education",
    brief: "A screen recording explaining how the course platform works, narrated by voice-over.",
    guidelines: ["1080p minimum screen capture", "Captions required", "No student data on screen"],
    deliverables: ["1× 2 minute explainer", "1× 30s cutdown"],
    compensation: [
      { model: "fixed", detail: "US$300" },
      { model: "affiliate", detail: "20% first-month course commission" },
    ],
    deadlineDays: 12,
    onCameraRequired: false,
    status: "open",
  },
  {
    key: "harbour-travel",
    brand: "Harbour Travel",
    title: "Destination B-roll package",
    category: "travel",
    brief: "A lifestyle B-roll package of the north coast — no people identifiable, no narration.",
    guidelines: ["Golden hour footage", "Minimum 4K", "Stabilised shots only"],
    deliverables: ["40× clips", "1× 60s edited montage"],
    compensation: [{ model: "fixed", detail: "US$700 for the package" }],
    deadlineDays: 25,
    onCameraRequired: false,
    status: "reviewing",
  },
];

/** How a campaign moves from brief to payout. */
export const CAMPAIGN_LIFECYCLE = [
  { step: 1, title: "Brand posts a campaign", plain: "A business says what it needs made and what it pays." },
  { step: 2, title: "Creator applies", plain: "You send your portfolio and your idea for the brief." },
  { step: 3, title: "Brand accepts", plain: "The brief, guidelines, deliverables and deadline become your contract." },
  { step: 4, title: "You create in FV Studios", plain: "Everything is built in the studio you already have." },
  { step: 5, title: "Brand approves", plain: "One round of notes is standard, then approval." },
  { step: 6, title: "Payment enters your Frass Wallet", plain: "Costs, platform participation and your earnings are itemised." },
];

/**
 * Brand partnership income is not a new money system. It runs through the same
 * commerce rules, the same platform participation and the same wallet.
 */
export const CAMPAIGN_MONEY_RULES = [
  "Campaign payments settle through the existing payment pipeline — no separate money system.",
  "Platform participation is the standard published commerce rate; nothing hidden.",
  "Affiliate components are attributed by the existing Affiliate Intelligence Engine.",
  "Every payment appears as its own line in the Financial Center with a full receipt.",
];

export const CAMPAIGN_PLACEMENTS = [
  { label: "Marketplace", to: "/brand-partnerships" },
  { label: "Affiliate Center", to: "/workspace/affiliate" },
  { label: "Creator Dashboard", to: "/workspace" },
  { label: "Financial Center", to: "/financial-center" },
];

export function campaignsByCategory(cat: CampaignCategory | "all"): BrandCampaign[] {
  return cat === "all" ? BRAND_CAMPAIGNS : BRAND_CAMPAIGNS.filter((c) => c.category === cat);
}
