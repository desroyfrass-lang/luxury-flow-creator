// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0410 — Frass Brand Partnerships Network
// Creator Sponsorship & Campaign Marketplace.
//
// Constitutional principle: Frass does not simply connect creators with brands.
// Frass is the agency, the production studio, the campaign manager, the
// analytics platform AND the payment processor. When creators succeed and
// brands succeed, Frass succeeds.
// ─────────────────────────────────────────────────────────────────────────────

export const BP_PRINCIPLE =
  "Frass does not simply connect creators with brands. Frass becomes the trusted partnership platform that manages discovery, campaign execution, payments, analytics and reporting. When creators succeed, brands succeed, and Frass succeeds.";

/** Who the network serves. */
export const BP_AUDIENCES = [
  "Individual creators",
  "Musicians",
  "Filmmakers",
  "Podcasters",
  "Streamers",
  "Businesses",
  "Influencers",
  "Faceless creators",
  "Community organisations",
];

// ── Industries ───────────────────────────────────────────────────────────────
export type Industry =
  | "fashion"
  | "footwear"
  | "beauty"
  | "fitness"
  | "food"
  | "restaurants"
  | "hotels"
  | "airlines"
  | "technology"
  | "automotive"
  | "financial-services"
  | "education"
  | "gaming"
  | "tourism"
  | "government"
  | "charity";

export const INDUSTRIES: { key: Industry; label: string; icon: string }[] = [
  { key: "fashion", label: "Fashion", icon: "🧥" },
  { key: "footwear", label: "Footwear", icon: "👟" },
  { key: "beauty", label: "Beauty", icon: "💄" },
  { key: "fitness", label: "Fitness", icon: "🏋🏾" },
  { key: "food", label: "Food", icon: "🍲" },
  { key: "restaurants", label: "Restaurants", icon: "🍽" },
  { key: "hotels", label: "Hotels", icon: "🏨" },
  { key: "airlines", label: "Airlines", icon: "✈️" },
  { key: "technology", label: "Technology", icon: "💡" },
  { key: "automotive", label: "Automotive", icon: "🚗" },
  { key: "financial-services", label: "Financial Services", icon: "🏦" },
  { key: "education", label: "Education", icon: "📚" },
  { key: "gaming", label: "Gaming", icon: "🎮" },
  { key: "tourism", label: "Tourism", icon: "🏝" },
  { key: "government", label: "Government Initiatives", icon: "🏛" },
  { key: "charity", label: "Charity Campaigns", icon: "❤️" },
];

// ── Campaign types ───────────────────────────────────────────────────────────
export const CAMPAIGN_TYPES = [
  "TikTok videos",
  "Instagram Reels",
  "YouTube Shorts",
  "YouTube videos",
  "Podcasts",
  "Product photography",
  "Product reviews",
  "Commercials",
  "Documentaries",
  "Livestreams",
  "Voice-over campaigns",
  "Radio promotions",
  "Blog articles",
  "Email campaigns",
] as const;

export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

/** Content a creator can deliver without ever appearing on camera. */
export const FACELESS_FORMATS = [
  "AI-assisted videos",
  "Motion graphics",
  "Product showcases",
  "Screen recordings",
  "Educational content",
  "Animation",
  "Cinematic B-roll",
  "Storytelling",
  "Audio-only productions",
];

export const FACELESS_RULE =
  "Frass fully supports creators who never appear on camera. Brands can specifically request faceless creators, and a brief only requires a presenter when it says so explicitly.";

// ── Markets ──────────────────────────────────────────────────────────────────
export type MarketTier = "primary" | "secondary";

export const CAMPAIGN_MARKETS: {
  key: string;
  flag: string;
  label: string;
  currency: string;
  tier: MarketTier;
}[] = [
  { key: "CA", flag: "🇨🇦", label: "Canada", currency: "CAD", tier: "primary" },
  { key: "US", flag: "🇺🇸", label: "United States", currency: "USD", tier: "primary" },
  { key: "GB", flag: "🇬🇧", label: "United Kingdom", currency: "GBP", tier: "primary" },
  { key: "JM", flag: "🇯🇲", label: "Jamaica", currency: "JMD", tier: "secondary" },
  { key: "IN", flag: "🇮🇳", label: "India", currency: "INR", tier: "secondary" },
  { key: "JP", flag: "🇯🇵", label: "Japan", currency: "JPY", tier: "secondary" },
  { key: "AF", flag: "🌍", label: "Africa", currency: "Local", tier: "secondary" },
  { key: "EU", flag: "🇪🇺", label: "Europe", currency: "EUR", tier: "secondary" },
  { key: "AU", flag: "🇦🇺", label: "Australia", currency: "AUD", tier: "secondary" },
];

// ── Compensation ─────────────────────────────────────────────────────────────
export type CompensationModel = "fixed" | "performance" | "affiliate" | "revenue-share";

export const COMPENSATION_MODELS: { key: CompensationModel; label: string; plain: string }[] = [
  { key: "fixed", label: "Fixed fee", plain: "A set amount, paid on approved delivery." },
  { key: "performance", label: "Performance bonus", plain: "Extra on top when the work performs." },
  { key: "affiliate", label: "Affiliate commission", plain: "A cut of every sale your link brings in." },
  { key: "revenue-share", label: "Revenue share", plain: "An agreed share of what the campaign earns." },
];

/** Who produces the work. */
export type ProductionMode = "creator-produced" | "fv-produced";

export const PRODUCTION_MODES: { key: ProductionMode; label: string; plain: string }[] = [
  {
    key: "creator-produced",
    label: "Creator Produced",
    plain: "The creator handles production, using FV Studios if they want to.",
  },
  {
    key: "fv-produced",
    label: "FV Studios Produced",
    plain: "Frass Vision Studios produces the campaign professionally. A premium service for brands.",
  },
];

// ── Brands ───────────────────────────────────────────────────────────────────
export type Brand = {
  slug: string;
  name: string;
  industries: Industry[];
  about: string;
  countries: string[];
  verified: boolean;
  contact: string;
  activeCampaigns: number;
  pastCampaigns: number;
  creatorRating: number;
};

export const BRANDS: Brand[] = [
  {
    slug: "island-skin",
    name: "Island Skin",
    industries: ["beauty"],
    about: "Caribbean botanical skincare, made in small batches and shipped worldwide.",
    countries: ["CA", "US", "GB", "JM"],
    verified: true,
    contact: "partnerships@islandskin.example",
    activeCampaigns: 2,
    pastCampaigns: 11,
    creatorRating: 4.8,
  },
  {
    slug: "kingston-motors",
    name: "Kingston Motors",
    industries: ["automotive"],
    about: "Electric city vehicles built for island roads and North American commutes.",
    countries: ["CA", "US", "JM"],
    verified: true,
    contact: "brand@kingstonmotors.example",
    activeCampaigns: 1,
    pastCampaigns: 4,
    creatorRating: 4.6,
  },
  {
    slug: "yaad-kitchen",
    name: "Yaad Kitchen",
    industries: ["food", "restaurants"],
    about: "Spice boxes and meal kits built from family recipes.",
    countries: ["CA", "US", "GB"],
    verified: true,
    contact: "hello@yaadkitchen.example",
    activeCampaigns: 1,
    pastCampaigns: 7,
    creatorRating: 4.9,
  },
  {
    slug: "harbour-travel",
    name: "Harbour Travel",
    industries: ["tourism", "hotels"],
    about: "Boutique island stays and guided north-coast itineraries.",
    countries: ["GB", "US", "EU"],
    verified: false,
    contact: "media@harbourtravel.example",
    activeCampaigns: 1,
    pastCampaigns: 3,
    creatorRating: 4.4,
  },
  {
    slug: "study-hill",
    name: "Study Hill",
    industries: ["education", "technology"],
    about: "Online courses for first-generation builders and small business owners.",
    countries: ["CA", "US", "GB", "JM"],
    verified: true,
    contact: "growth@studyhill.example",
    activeCampaigns: 1,
    pastCampaigns: 9,
    creatorRating: 4.7,
  },
];

export function brandBySlug(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

// ── Campaigns ────────────────────────────────────────────────────────────────
export type CampaignStatus = "open" | "reviewing" | "in-production" | "closed";

export type BrandCampaign = {
  key: string;
  brandSlug: string;
  title: string;
  industry: Industry;
  type: CampaignType;
  brief: string;
  objectives: string[];
  guidelines: string[];
  deliverables: string[];
  brandAssets: string[];
  compensation: { model: CompensationModel; detail: string }[];
  budgetUsd: number;
  deadlineDays: number;
  revisionsIncluded: number;
  onCameraRequired: boolean;
  facelessWelcome: boolean;
  production: ProductionMode;
  markets: string[];
  languages: string[];
  status: CampaignStatus;
};

export const BRAND_CAMPAIGNS: BrandCampaign[] = [
  {
    key: "island-skin-serum",
    brandSlug: "island-skin",
    title: "Morning ritual — 30 second faceless edit",
    industry: "beauty",
    type: "Instagram Reels",
    brief:
      "A calm, tactile 30-second piece about a morning skincare ritual. Product-first, hands only, warm island light.",
    objectives: ["Introduce the new serum", "Drive first purchases", "Build the ritual association"],
    guidelines: [
      "Product visible for at least 8 seconds.",
      "No competitor products in frame.",
      "Soft natural light — no harsh ring light.",
      "Voice-over optional; text-on-screen accepted.",
    ],
    deliverables: ["1× 30s vertical video", "3× stills", "Raw B-roll folder"],
    brandAssets: ["Logo pack", "Product renders", "Brand colour and type sheet"],
    compensation: [
      { model: "fixed", detail: "US$250 on approved delivery" },
      { model: "affiliate", detail: "12% on attributed sales for 60 days" },
    ],
    budgetUsd: 250,
    deadlineDays: 14,
    revisionsIncluded: 2,
    onCameraRequired: false,
    facelessWelcome: true,
    production: "creator-produced",
    markets: ["CA", "US", "GB"],
    languages: ["English"],
    status: "open",
  },
  {
    key: "kingston-motors-reveal",
    brandSlug: "kingston-motors",
    title: "Launch teaser — motion graphics only",
    industry: "automotive",
    type: "Commercials",
    brief:
      "A 15-second cinematic teaser built entirely from supplied renders and motion graphics. No presenter, no dialogue.",
    objectives: ["Announce the launch date", "Position the vehicle as premium"],
    guidelines: [
      "Use the supplied brand type and palette.",
      "Sound design required; licensed music only.",
      "End card holds the logo for 2 seconds.",
    ],
    deliverables: ["1× 15s 16:9", "1× 15s 9:16"],
    brandAssets: ["3D renders", "Brand type", "Approved music library"],
    compensation: [
      { model: "fixed", detail: "US$600 on approved delivery" },
      { model: "performance", detail: "US$200 bonus at 250k verified views" },
    ],
    budgetUsd: 800,
    deadlineDays: 21,
    revisionsIncluded: 2,
    onCameraRequired: false,
    facelessWelcome: true,
    production: "fv-produced",
    markets: ["CA", "US"],
    languages: ["English", "French"],
    status: "open",
  },
  {
    key: "yaad-kitchen-series",
    brandSlug: "yaad-kitchen",
    title: "Five-part recipe series",
    industry: "food",
    type: "TikTok videos",
    brief: "Five short recipe films shot overhead. Hands and food only — the dish is the star.",
    objectives: ["Grow the spice-box subscriber base", "Show how easy the kits are"],
    guidelines: [
      "Overhead framing for cooking steps.",
      "Ingredients listed on screen.",
      "Caribbean seasoning line must appear in every episode.",
    ],
    deliverables: ["5× 45s vertical videos", "1× series trailer"],
    brandAssets: ["Product photography", "Recipe cards", "Logo pack"],
    compensation: [
      { model: "fixed", detail: "US$900 for the series" },
      { model: "revenue-share", detail: "8% of attributed spice-box sales" },
    ],
    budgetUsd: 900,
    deadlineDays: 30,
    revisionsIncluded: 1,
    onCameraRequired: false,
    facelessWelcome: true,
    production: "creator-produced",
    markets: ["CA", "US", "GB"],
    languages: ["English", "Patois"],
    status: "in-production",
  },
  {
    key: "hilltop-fitness-coach",
    brandSlug: "study-hill",
    title: "Coach-led programme walkthrough",
    industry: "fitness",
    type: "YouTube videos",
    brief: "A presenter-led walkthrough of the 8-week programme. This brief does require on-camera work.",
    objectives: ["Explain the programme", "Convert trial sign-ups"],
    guidelines: ["Presenter on camera", "Gym or outdoor setting", "No medical claims"],
    deliverables: ["1× 90s landscape video", "2× 20s cutdowns"],
    brandAssets: ["Programme outline", "Logo pack"],
    compensation: [{ model: "fixed", detail: "US$450 on approved delivery" }],
    budgetUsd: 450,
    deadlineDays: 18,
    revisionsIncluded: 2,
    onCameraRequired: true,
    facelessWelcome: false,
    production: "creator-produced",
    markets: ["CA", "US"],
    languages: ["English"],
    status: "open",
  },
  {
    key: "study-hill-course",
    brandSlug: "study-hill",
    title: "Screen-recorded course explainer",
    industry: "education",
    type: "YouTube Shorts",
    brief: "A screen recording explaining how the course platform works, narrated by voice-over.",
    objectives: ["Reduce support questions", "Increase course completion"],
    guidelines: ["1080p minimum screen capture", "Captions required", "No student data on screen"],
    deliverables: ["1× 2 minute explainer", "1× 30s cutdown"],
    brandAssets: ["Demo account", "Brand fonts"],
    compensation: [
      { model: "fixed", detail: "US$300" },
      { model: "affiliate", detail: "20% first-month course commission" },
    ],
    budgetUsd: 300,
    deadlineDays: 12,
    revisionsIncluded: 1,
    onCameraRequired: false,
    facelessWelcome: true,
    production: "creator-produced",
    markets: ["CA", "US", "GB", "JM"],
    languages: ["English"],
    status: "open",
  },
  {
    key: "harbour-travel",
    brandSlug: "harbour-travel",
    title: "Destination B-roll package",
    industry: "tourism",
    type: "Product photography",
    brief: "A lifestyle B-roll package of the north coast — no people identifiable, no narration.",
    objectives: ["Refresh the seasonal campaign library"],
    guidelines: ["Golden hour footage", "Minimum 4K", "Stabilised shots only"],
    deliverables: ["40× clips", "1× 60s edited montage"],
    brandAssets: ["Shot list", "Location permissions"],
    compensation: [{ model: "fixed", detail: "US$700 for the package" }],
    budgetUsd: 700,
    deadlineDays: 25,
    revisionsIncluded: 1,
    onCameraRequired: false,
    facelessWelcome: true,
    production: "creator-produced",
    markets: ["GB", "US", "EU"],
    languages: ["English"],
    status: "reviewing",
  },
];

export function campaignByKey(key: string): BrandCampaign | undefined {
  return BRAND_CAMPAIGNS.find((c) => c.key === key);
}

export function campaignsForBrand(slug: string): BrandCampaign[] {
  return BRAND_CAMPAIGNS.filter((c) => c.brandSlug === slug);
}

export function filterCampaigns(opts: {
  industry?: Industry | "all";
  facelessOnly?: boolean;
  market?: string | "all";
  production?: ProductionMode | "all";
}): BrandCampaign[] {
  return BRAND_CAMPAIGNS.filter((c) => {
    if (opts.industry && opts.industry !== "all" && c.industry !== opts.industry) return false;
    if (opts.facelessOnly && c.onCameraRequired) return false;
    if (opts.market && opts.market !== "all" && !c.markets.includes(opts.market)) return false;
    if (opts.production && opts.production !== "all" && c.production !== opts.production) return false;
    return true;
  });
}

// ── Creator media kits ───────────────────────────────────────────────────────
export type CreatorProfile = {
  slug: string;
  name: string;
  headline: string;
  faceless: boolean;
  categories: string[];
  skills: string[];
  languages: string[];
  countriesServed: string[];
  audience: { platform: string; followers: number; topCountry: string; engagementPct: number }[];
  completedCampaigns: number;
  onTimePct: number;
  brandSafetyScore: number;
  reliabilityScore: number;
  rating: number;
  rateFromUsd: number | null;
  certified: boolean;
  reviews: { brand: string; stars: number; quote: string }[];
  portfolio: { title: string; type: CampaignType }[];
  available: boolean;
};

export const CREATORS: CreatorProfile[] = [
  {
    slug: "quiet-frames",
    name: "Quiet Frames",
    headline: "Faceless product films and motion graphics.",
    faceless: true,
    categories: ["Beauty", "Fashion", "Technology"],
    skills: ["Motion graphics", "Product cinematography", "Sound design"],
    languages: ["English"],
    countriesServed: ["CA", "US", "GB"],
    audience: [
      { platform: "TikTok", followers: 48200, topCountry: "US", engagementPct: 6.4 },
      { platform: "Instagram", followers: 21400, topCountry: "CA", engagementPct: 4.1 },
    ],
    completedCampaigns: 34,
    onTimePct: 100,
    brandSafetyScore: 98,
    reliabilityScore: 97,
    rating: 4.9,
    rateFromUsd: 350,
    certified: true,
    reviews: [
      { brand: "Island Skin", stars: 5, quote: "Delivered early and the grade was flawless." },
      { brand: "Study Hill", stars: 5, quote: "Understood the brief without a single revision." },
    ],
    portfolio: [
      { title: "Serum ritual — 30s", type: "Instagram Reels" },
      { title: "Handset launch loop", type: "Commercials" },
    ],
    available: true,
  },
  {
    slug: "marlon-b",
    name: "Marlon B.",
    headline: "Documentary storytelling from Kingston to Toronto.",
    faceless: false,
    categories: ["Tourism", "Food", "Community"],
    skills: ["Documentary", "Interviewing", "Colour grading"],
    languages: ["English", "Patois"],
    countriesServed: ["JM", "CA", "US"],
    audience: [
      { platform: "YouTube", followers: 112000, topCountry: "JM", engagementPct: 8.2 },
      { platform: "Instagram", followers: 39000, topCountry: "CA", engagementPct: 5.0 },
    ],
    completedCampaigns: 21,
    onTimePct: 95,
    brandSafetyScore: 94,
    reliabilityScore: 92,
    rating: 4.7,
    rateFromUsd: 800,
    certified: true,
    reviews: [{ brand: "Harbour Travel", stars: 5, quote: "Made the island feel like home." }],
    portfolio: [
      { title: "North coast, five mornings", type: "Documentaries" },
      { title: "Family kitchen series", type: "YouTube videos" },
    ],
    available: true,
  },
  {
    slug: "studio-ayanna",
    name: "Studio Ayanna",
    headline: "Voice-over, radio spots and audio-only campaigns.",
    faceless: true,
    categories: ["Audio", "Education", "Charity"],
    skills: ["Voice-over", "Audio mastering", "Scriptwriting"],
    languages: ["English", "French"],
    countriesServed: ["CA", "GB", "EU"],
    audience: [{ platform: "Frass Radio", followers: 15300, topCountry: "CA", engagementPct: 11.5 }],
    completedCampaigns: 47,
    onTimePct: 99,
    brandSafetyScore: 99,
    reliabilityScore: 98,
    rating: 5,
    rateFromUsd: 180,
    certified: true,
    reviews: [{ brand: "Yaad Kitchen", stars: 5, quote: "The warmest read we have ever had." }],
    portfolio: [
      { title: "Spice box radio spot", type: "Radio promotions" },
      { title: "Course narration pack", type: "Voice-over campaigns" },
    ],
    available: false,
  },
  {
    slug: "pixel-yard",
    name: "Pixel Yard",
    headline: "Animation and explainer studio for technology brands.",
    faceless: true,
    categories: ["Technology", "Gaming", "Financial Services"],
    skills: ["2D animation", "Screen recording", "Subtitling"],
    languages: ["English", "Spanish"],
    countriesServed: ["US", "GB", "EU"],
    audience: [{ platform: "YouTube", followers: 63000, topCountry: "US", engagementPct: 5.6 }],
    completedCampaigns: 12,
    onTimePct: 92,
    brandSafetyScore: 96,
    reliabilityScore: 90,
    rating: 4.5,
    rateFromUsd: 420,
    certified: false,
    reviews: [{ brand: "Kingston Motors", stars: 4, quote: "Strong work, one extra revision needed." }],
    portfolio: [{ title: "Wallet onboarding explainer", type: "YouTube Shorts" }],
    available: true,
  },
];

export function creatorBySlug(slug: string): CreatorProfile | undefined {
  return CREATORS.find((c) => c.slug === slug);
}

// ── FV Certified Creator ─────────────────────────────────────────────────────
export const CERTIFIED_BADGE = "FV Certified Creator";

export const CERTIFIED_CRITERIA = [
  { label: "Completed campaigns", threshold: "15 or more approved campaigns" },
  { label: "On-time delivery", threshold: "95% or better" },
  { label: "Client rating", threshold: "4.7 stars or better" },
  { label: "Brand safety score", threshold: "90 or better" },
  { label: "Standing", threshold: "No unresolved disputes in the last 12 months" },
];

export function meetsCertification(c: CreatorProfile): boolean {
  return (
    c.completedCampaigns >= 15 && c.onTimePct >= 95 && c.rating >= 4.7 && c.brandSafetyScore >= 90
  );
}

// ── Smart matching ───────────────────────────────────────────────────────────
export const MATCH_SIGNALS = [
  "Creator niche",
  "Skills",
  "Audience",
  "Previous work",
  "Languages",
  "Country",
  "Performance",
  "Availability",
];

/** Transparent, explainable score — Frassy always shows why a match was made. */
export function matchScore(
  creator: CreatorProfile,
  campaign: BrandCampaign,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const industryLabel = INDUSTRIES.find((i) => i.key === campaign.industry)?.label ?? "";
  if (creator.categories.some((c) => c.toLowerCase() === industryLabel.toLowerCase())) {
    score += 30;
    reasons.push(`Works in ${industryLabel}`);
  }
  if (campaign.markets.some((m) => creator.countriesServed.includes(m))) {
    score += 20;
    reasons.push("Serves this campaign's market");
  }
  if (campaign.languages.some((l) => creator.languages.includes(l))) {
    score += 15;
    reasons.push("Speaks the campaign language");
  }
  if (!campaign.onCameraRequired && creator.faceless) {
    score += 15;
    reasons.push("Faceless brief suits this creator");
  }
  if (campaign.onCameraRequired && !creator.faceless) {
    score += 15;
    reasons.push("Comfortable on camera");
  }
  if (creator.available) {
    score += 10;
    reasons.push("Available now");
  }
  if (meetsCertification(creator)) {
    score += 10;
    reasons.push(CERTIFIED_BADGE);
  }
  return { score: Math.min(score, 100), reasons };
}

export function recommendedCreators(campaign: BrandCampaign) {
  return CREATORS.map((c) => ({ creator: c, ...matchScore(c, campaign) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function recommendedCampaigns(creator: CreatorProfile) {
  return BRAND_CAMPAIGNS.map((c) => ({ campaign: c, ...matchScore(creator, c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ── Escrow-style financial flow ──────────────────────────────────────────────
export const ESCROW_FLOW = [
  { step: 1, title: "Brand funds the campaign", plain: "The money is paid up front and held safely by Frass." },
  { step: 2, title: "Held securely", plain: "Nobody can spend it while the work is being made." },
  { step: 3, title: "Creator completes the work", plain: "Produced in FV Studios or wherever the creator prefers." },
  { step: 4, title: "Brand approves the deliverables", plain: "Revisions happen here, inside the campaign dashboard." },
  { step: 5, title: "Funds are released", plain: "Approval is what unlocks the money — not a promise." },
  { step: 6, title: "Platform service fee deducted", plain: "One published percentage, shown on the receipt." },
  { step: 7, title: "Creator paid to the Frass Wallet", plain: "The balance lands in your wallet with the full line-by-line breakdown." },
];

export const PLATFORM_SERVICE_FEE_PCT = 12;

/** Deterministic settlement preview — the same shape the receipt uses. */
export function settlementPreview(budgetUsd: number) {
  const fee = Math.round(budgetUsd * (PLATFORM_SERVICE_FEE_PCT / 100) * 100) / 100;
  return {
    gross: budgetUsd,
    feePct: PLATFORM_SERVICE_FEE_PCT,
    fee,
    creatorNet: Math.round((budgetUsd - fee) * 100) / 100,
  };
}

// ── Relationships ────────────────────────────────────────────────────────────
export const RELATIONSHIP_TIERS = [
  { key: "ambassador", label: "Brand Ambassador", plain: "An ongoing face or voice of the brand." },
  { key: "long-term", label: "Long-term Partner", plain: "A rolling agreement across many campaigns." },
  { key: "seasonal", label: "Seasonal Creator", plain: "Booked for specific seasons or launches." },
  { key: "team", label: "Campaign Team", plain: "Several creators working one campaign together." },
  { key: "exclusive", label: "Exclusive Collaborator", plain: "Category exclusivity, agreed and paid for." },
];

// ── Academy feedback ─────────────────────────────────────────────────────────
export const FEEDBACK_DIMENSIONS = [
  "Storytelling",
  "Editing",
  "Audio",
  "Lighting",
  "Engagement",
  "Brand alignment",
];

export const FEEDBACK_RULE =
  "After every completed campaign Frassy gives constructive feedback across these six areas, in plain language, so each campaign makes the next one better.";

// ── Platform revenue ─────────────────────────────────────────────────────────
export const BP_REVENUE_SOURCES = [
  { key: "service-fee", label: "Platform service fees", plain: "A published percentage of completed campaigns." },
  { key: "brand-subscription", label: "Premium brand subscriptions", plain: "Brands paying for ongoing access and tools." },
  { key: "creator-membership", label: "Premium creator memberships", plain: "Optional. Never required to get hired." },
  { key: "fv-production", label: "FV Studios production services", plain: "When Frass produces the campaign itself." },
  { key: "ai-credits", label: "AI Credits used in production", plain: "The same credit economy as everywhere else." },
  { key: "analytics", label: "Brand analytics packages", plain: "Deeper reporting for brands that want it." },
  { key: "featured", label: "Featured campaign placement", plain: "Paid visibility, always labelled as paid." },
  { key: "verification", label: "Verified brand services", plain: "Checks that make a brand safe to work with." },
];

export const BP_REVENUE_RULE =
  "Every revenue source is disclosed to both creators and brands. Nothing is deducted that is not printed on the receipt.";

// ── Where the platform appears ───────────────────────────────────────────────
export const BP_PLACEMENTS = [
  { label: "Marketplace", to: "/brand-partnerships" },
  { label: "Affiliate Center", to: "/workspace/affiliate" },
  { label: "Creator Dashboard", to: "/workspace" },
  { label: "Financial Center", to: "/financial-center" },
  { label: "FV Studios", to: "/studio" },
  { label: "For Us", to: "/for-us" },
];

// ── Campaign lifecycle (dashboard states) ────────────────────────────────────
export const CAMPAIGN_LIFECYCLE = [
  { step: 1, title: "Brand posts a campaign", plain: "A business says what it needs made and what it pays." },
  { step: 2, title: "Creators apply or are matched", plain: "Frassy suggests creators; brands can also invite directly." },
  { step: 3, title: "Brand accepts and funds", plain: "The brief becomes the contract and the money goes into escrow." },
  { step: 4, title: "Production", plain: "Creator-produced, or produced by Frass Vision Studios." },
  { step: 5, title: "Review and revisions", plain: "Notes happen inside the dashboard, with the included revision count." },
  { step: 6, title: "Approval and release", plain: "Approval releases the funds automatically." },
  { step: 7, title: "Report and feedback", plain: "The brand gets the analytics report; the creator gets Frassy's coaching notes." },
];
