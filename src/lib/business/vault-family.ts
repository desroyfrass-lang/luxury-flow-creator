// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0503 — The Family of Business Vaults
//
// A Vault is not a feature. A Vault is a complete entrepreneurial pathway for
// one trade, craft or profession, and every Vault runs the same constitution:
//
//        Discover  →  Build  →  Monetize
//
// Rules (inherited, not re-invented):
//  · FRASS-0480 — every pathway ends at a real monetization outcome.
//  · FRASS-0469 — a Vault on the shelf produces no Daily tasks until activated.
//  · No duplicate commerce: selling always flows through the existing
//    Marketplace, Frass Card and Money Moves architecture.
//
// Plain English: pick the thing you already know how to do. Frass walks you
// from "I can do this" to "people can buy this from me."
// ─────────────────────────────────────────────────────────────────────────────

export type VaultStage = "discover" | "build" | "monetize";

export const STAGE_LABEL: Record<VaultStage, string> = {
  discover: "Discover",
  build: "Build",
  monetize: "Monetize",
};

export const STAGE_PLAIN: Record<VaultStage, string> = {
  discover: "Work out what you make, who it's for, and what to call it.",
  build: "Actually make the thing and get it ready to be seen.",
  monetize: "Put it somewhere people can pay you for it.",
};

export type VaultMove = {
  /** Short imperative title — this becomes a Money Move on activation. */
  title: string;
  stage: VaultStage;
  /** Roughly how long one sitting takes. Respect the member's real hours. */
  minutes: number;
  /** Where in Frass this actually happens today. No invented destinations. */
  to?: string;
};

export type BusinessVault = {
  key: string;
  emoji: string;
  label: string;
  /** One line a kindergartener could follow. */
  summary: string;
  /** Who this Vault is for. */
  forWho: string;
  /** The business models this trade can legitimately run. */
  paths: string[];
  /** The full Discover → Build → Monetize pathway. */
  moves: VaultMove[];
  /** The concrete FRASS-0480 outcome this pathway must end at. */
  monetizationOutcome: string;
  /** Optional craft-specific creative tooling notes. */
  designSupport?: string[];
  /**
   * FRASS-0510 — where the finished work is presented to the world.
   * The Vault builds the business; the showcase is where people discover,
   * follow and buy it. Same catalog, same inventory, one source of truth.
   */
  showcase?: { label: string; to: string; note: string };
  /**
   * FRASS-0516 — which Creator Manufacturing Network categories this Vault
   * can produce through. Omit for service-only Vaults.
   */
  manufacturing?: string[];
  /** FRASS-0511-A — the craft word Frassy uses when discovering skill level. */
  craft?: string;
};


const MARKETPLACE_CLOSE: VaultMove[] = [
  { title: "Price the work so it pays you properly", stage: "monetize", minutes: 20, to: "/money-moves" },
  { title: "List the first items in the Marketplace", stage: "monetize", minutes: 25, to: "/marketplace" },
  { title: "Put the business on your Frass Card", stage: "monetize", minutes: 15, to: "/workspace/card" },
  { title: "Prepare a week of content about the work", stage: "monetize", minutes: 20, to: "/fv-studios" },
];

/** 👗 The flagship of the family — FRASS-0503A. */
export const SEAMSTRESS_VAULT: BusinessVault = {
  key: "seamstress",
  emoji: "👗",
  label: "Seamstress Vault",
  summary: "Turn sewing into a clothing brand people recognise — not just paid stitching.",
  forWho: "Anyone who makes or alters clothing, from a first hem to a full collection.",
  paths: [
    "Handmade garments",
    "Made-to-order clothing",
    "Alterations",
    "Custom tailoring",
    "Children's clothing",
    "Formal wear",
    "Streetwear",
    "Cultural fashion",
    "Sustainable fashion",
    "Print-on-demand partnerships",
  ],
  designSupport: [
    "Upload sketches",
    "Design digitally",
    "Build mood boards",
    "Organise fabric ideas",
    "Track patterns",
    "Plan seasonal collections",
  ],
  moves: [
    { title: "Find your fashion niche — what you make best", stage: "discover", minutes: 20 },
    { title: "Name the clothing brand", stage: "discover", minutes: 20, to: "/business-builder" },
    { title: "Design the logo and visual identity", stage: "discover", minutes: 30, to: "/workspace/composer" },
    { title: "Choose your production path (handmade, made-to-order, alterations…)", stage: "discover", minutes: 15 },
    { title: "Build the mood board and fabric list for collection one", stage: "build", minutes: 30, to: "/vault" },
    { title: "Sketch or upload the first five designs", stage: "build", minutes: 30, to: "/vault" },
    { title: "Sew the first piece of the collection", stage: "build", minutes: 60 },
    { title: "Photograph the garments properly", stage: "build", minutes: 30 },
    { title: "Write the product catalog — sizes, fabric, care", stage: "build", minutes: 30 },
    { title: "Prepare the production package for a manufacturing partner", stage: "build", minutes: 30, to: "/manufacturing" },
    ...MARKETPLACE_CLOSE,
    { title: "Publish the collection to your Afro Designers house", stage: "monetize", minutes: 20, to: "/afro-designers" },
    { title: "Plan the next collection", stage: "monetize", minutes: 20 },
  ],
  monetizationOutcome:
    "A live clothing collection listed in the Marketplace, promoted on your Frass Card, and published to your Afro Designers house.",
  showcase: {
    label: "Afro Designers",
    to: "/afro-designers",
    note: "Your finished work is published to your own designer house — same products, same inventory, no second catalog.",
  },
  manufacturing: ["fashion"],
  craft: "sewing",
};


/** The rest of the family. Same constitution, different craft. */
export const BUSINESS_VAULTS: BusinessVault[] = [
  SEAMSTRESS_VAULT,
  {
    key: "visual-creator",
    emoji: "🎨",
    label: "Visual Creator Vault",
    summary: "Painting, illustration and digital art turned into work people buy.",
    forWho: "Painters, illustrators and digital artists.",
    paths: ["Originals", "Prints", "Commissions", "Merch designs", "Digital editions", "Licensing"],
    designSupport: ["Gallery Studio paint engine", "Story Wall for the work behind the work"],
    moves: [
      { title: "Decide what kind of artist you are", stage: "discover", minutes: 20, to: "/gallery" },
      { title: "Name the studio and set the look", stage: "discover", minutes: 20 },
      { title: "Finish three pieces for the first show", stage: "build", minutes: 60, to: "/gallery/studio" },
      { title: "Photograph or export at sale quality", stage: "build", minutes: 25 },
      { title: "Write the story behind each piece", stage: "build", minutes: 20 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "A gallery collection for sale plus at least one merch or print product.",
    showcase: { label: "Frass Gallery", to: "/gallery", note: "Your work hangs in the Gallery — same pieces, one catalog." },
    manufacturing: ["art", "lifestyle"],
    craft: "art",
  },
  {
    key: "music-creator",
    emoji: "🎵",
    label: "Music Creator Vault",
    summary: "Records, releases and rotation — music that earns instead of sitting on a drive.",
    forWho: "Artists, producers, engineers and songwriters.",
    paths: ["Releases", "Beat sales", "Session work", "Sync and licensing", "Live shows", "Radio rotation"],
    moves: [
      { title: "Define the sound and the artist name", stage: "discover", minutes: 20 },
      { title: "Pick the first release and its date", stage: "discover", minutes: 15 },
      { title: "Finish and master the first track", stage: "build", minutes: 60, to: "/fv-studios" },
      { title: "Make the cover art", stage: "build", minutes: 25, to: "/workspace/composer" },
      { title: "Submit to Frass Radio rotation", stage: "monetize", minutes: 15, to: "/frass-radio" },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "A released track in Frass Radio rotation with a paid offer attached.",
  },
  {
    key: "freight",
    emoji: "🚛",
    label: "Freight Brokerage Vault",
    summary: "Coordinate freight and own the customer relationship — not the trucks.",
    forWho: "Anyone with logistics, dispatch or supply-chain experience.",
    paths: ["Brokerage", "Dispatch service", "Last-mile coordination", "Customs support", "Warehousing referrals"],
    moves: [
      { title: "Name the lanes and services you'll cover", stage: "discover", minutes: 20 },
      { title: "Name and brand the company", stage: "discover", minutes: 20, to: "/business-builder" },
      { title: "Write the standard operating procedure", stage: "build", minutes: 45 },
      { title: "Build the carrier and client list", stage: "build", minutes: 30 },
      { title: "Set the rate structure", stage: "monetize", minutes: 25 },
      { title: "List the service in the Marketplace", stage: "monetize", minutes: 20, to: "/services" },
      { title: "Put the business on your Frass Card", stage: "monetize", minutes: 15, to: "/workspace/card" },
    ],
    monetizationOutcome: "A bookable freight service listed in the Frass Services Marketplace.",
  },
  {
    key: "wellness",
    emoji: "🌿",
    label: "Wellness Vault",
    summary: "Care, coaching and remedies made into an honest, bookable practice.",
    forWho: "Healers, coaches, herbalists, trainers and care workers.",
    paths: ["1:1 sessions", "Group programs", "Products and remedies", "Retreats", "Memberships"],
    moves: [
      { title: "Name who you help and how", stage: "discover", minutes: 20 },
      { title: "Design the signature offer", stage: "discover", minutes: 25 },
      { title: "Write the session or program outline", stage: "build", minutes: 30 },
      { title: "Prepare the intake and consent notes", stage: "build", minutes: 25 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "A bookable wellness offer with a clear price, live in the Marketplace.",
  },
  {
    key: "culinary",
    emoji: "🍽️",
    label: "Culinary Vault",
    summary: "Cooking turned into orders — trays, sauces, catering or a menu.",
    forWho: "Cooks, bakers, caterers and food makers.",
    paths: ["Meal prep", "Catering", "Baked goods", "Sauces and preserves", "Pop-ups", "Recipe products"],
    moves: [
      { title: "Choose the dishes you're known for", stage: "discover", minutes: 20 },
      { title: "Name the kitchen and its story", stage: "discover", minutes: 20 },
      { title: "Cost every dish honestly", stage: "build", minutes: 30 },
      { title: "Photograph the menu items", stage: "build", minutes: 30 },
      { title: "Write the order and pickup terms", stage: "build", minutes: 20 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "An orderable menu in the Marketplace with pickup or delivery terms.",
  },
  {
    key: "photography",
    emoji: "📸",
    label: "Photography Vault",
    summary: "A camera and an eye, turned into booked work and sellable images.",
    forWho: "Photographers and videographers at any level.",
    paths: ["Portraits", "Events", "Product photography", "Prints", "Stock licensing", "Content packages"],
    moves: [
      { title: "Pick the two shoots you want to be booked for", stage: "discover", minutes: 20 },
      { title: "Build the portfolio set", stage: "build", minutes: 45, to: "/vault" },
      { title: "Package three shoot tiers", stage: "build", minutes: 25 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "Bookable shoot packages plus a print or licensing listing.",
  },
  {
    key: "beauty",
    emoji: "💄",
    label: "Beauty Vault",
    summary: "Hair, nails, makeup and skin — a chair that stays full.",
    forWho: "Stylists, braiders, nail techs, barbers and makeup artists.",
    paths: ["Appointments", "Home service", "Products", "Courses", "Content and brand deals"],
    moves: [
      { title: "Name your signature service", stage: "discover", minutes: 15 },
      { title: "Build the before/after portfolio", stage: "build", minutes: 30 },
      { title: "Set the service menu and timing", stage: "build", minutes: 25 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "A bookable service menu with prices, live on your Frass Card.",
    manufacturing: ["beauty"],
    craft: "beauty work",
  },
  {
    key: "woodworking",
    emoji: "🪚",
    label: "Woodworking Vault",
    summary: "Furniture and finish work sold as made-to-order pieces.",
    forWho: "Carpenters, joiners, furniture makers and hobby builders.",
    paths: ["Made-to-order furniture", "Small goods", "Restoration", "Fit-outs", "Plans and patterns"],
    moves: [
      { title: "Choose the pieces you build best", stage: "discover", minutes: 20 },
      { title: "Cost materials and hours per piece", stage: "build", minutes: 30 },
      { title: "Photograph finished work in good light", stage: "build", minutes: 30 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "Made-to-order pieces listed with lead times and deposits.",
    manufacturing: ["home"],
    craft: "woodworking",
  },
  {
    key: "footwear",
    emoji: "👟",
    label: "Footwear Vault",
    summary: "Design shoes and have them properly made — without owning a factory.",
    forWho: "Anyone with a shoe idea, from a first sketch to a full line.",
    paths: ["Sneakers", "Dress shoes", "Sandals", "Boots", "Athletic footwear", "Limited drops"],
    moves: [
      { title: "Decide the one silhouette you want to be known for", stage: "discover", minutes: 20 },
      { title: "Name the label and set the look", stage: "discover", minutes: 20, to: "/business-builder" },
      { title: "Draw the design and colourways", stage: "build", minutes: 40, to: "/workspace/composer" },
      { title: "Prepare the production package and choose a partner", stage: "build", minutes: 30, to: "/manufacturing" },
      { title: "Approve the sample before anything is produced", stage: "build", minutes: 20, to: "/manufacturing" },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "An approved footwear sample in production and listed for sale.",
    showcase: { label: "Frass Kicks", to: "/frass-kicks", note: "Your drop shown where the sneaker people already are." },
    manufacturing: ["footwear"],
    craft: "footwear design",
  },
  {
    key: "bags",
    emoji: "👜",
    label: "Bags & Leather Vault",
    summary: "Bags, wallets and leather goods made to order and sold as a line.",
    forWho: "Leather workers, bag makers and accessory designers.",
    paths: ["Handbags", "Backpacks", "Wallets", "Travel bags", "Accessories"],
    moves: [
      { title: "Pick the three pieces that make the line", stage: "discover", minutes: 20 },
      { title: "Choose materials and hardware", stage: "build", minutes: 25 },
      { title: "Prepare the production package and choose a partner", stage: "build", minutes: 30, to: "/manufacturing" },
      { title: "Approve the sample", stage: "build", minutes: 20, to: "/manufacturing" },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "A leather goods line listed with lead times and prices that pay you.",
    manufacturing: ["bags"],
    craft: "leather work",
  },
  {
    key: "jewelry",
    emoji: "💍",
    label: "Jewelry Vault",
    summary: "Turn pieces you design into a jewelry line people can buy.",
    forWho: "Jewellers, beaders, metalworkers and accessory designers.",
    paths: ["Fine jewelry", "Fashion jewelry", "Custom commissions", "Limited editions"],
    moves: [
      { title: "Decide the material and the story", stage: "discover", minutes: 20 },
      { title: "Design the first five pieces", stage: "build", minutes: 40, to: "/workspace/composer" },
      { title: "Prepare the production package and choose a partner", stage: "build", minutes: 30, to: "/manufacturing" },
      { title: "Approve the sample", stage: "build", minutes: 20, to: "/manufacturing" },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "A jewelry collection in production and live in the Marketplace.",
    manufacturing: ["jewelry"],
    craft: "jewelry making",
  },

  {
    key: "software",
    emoji: "💻",
    label: "Software & Technology Vault",
    summary: "Build the tool, then sell the tool — or the time that makes it.",
    forWho: "Developers, IT technicians and technical builders.",
    paths: ["Client builds", "Products and SaaS", "Automation services", "Support retainers", "Teaching"],
    moves: [
      { title: "Pick the problem you solve fastest", stage: "discover", minutes: 20 },
      { title: "Scope a first paid deliverable", stage: "discover", minutes: 25 },
      { title: "Ship the first working version", stage: "build", minutes: 60 },
      { title: "Write the offer in plain English", stage: "build", minutes: 20 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "A priced technical offer or product live in the Marketplace.",
  },
];

export function vaultByKey(key: string): BusinessVault | undefined {
  return BUSINESS_VAULTS.find((v) => v.key === key);
}

export function movesByStage(vault: BusinessVault, stage: VaultStage): VaultMove[] {
  return vault.moves.filter((m) => m.stage === stage);
}

/** Total honest time the whole pathway asks for, in minutes. */
export function pathwayMinutes(vault: BusinessVault): number {
  return vault.moves.reduce((sum, m) => sum + m.minutes, 0);
}

export const FAMILY_PRINCIPLE = {
  headline: "Every skilled craft deserves the opportunity to become a business.",
  plain:
    "What this means in plain English: whatever you already know how to do — sew, cook, cut hair, code, drive freight — there's a Vault for it, and every Vault ends the same way: something real that people can pay you for.",
};
