// ─────────────────────────────────────────────────────────────────────────────
// MASTER MONEY MOVES LIBRARY — STEP 1: identity and catalogue only.
//
// This file is the ONE canonical list of permanent Money Moves. A Money Move is
// an economic outcome ("what earns"), never a step ("how you do it"). Steps stay
// where they already live: Vault moves (src/lib/business/vault-family.ts) and
// accelerator moves (src/lib/business/accelerator.ts) remain Fast Tracks and are
// not duplicated here.
//
// Deliberately OUT of this catalogue:
//   • Campaign Money Moves — time-bound live campaigns keep their own catalogue.
//   • Fast Tracks / supporting steps — including the trusted-tool affiliate
//     add-on, which belongs under a parent move, not beside it.
//
// This step gives every entry a stable identity so Frassy, Daily, Workshop and
// the specialist tools can later refer to the same move. It wires nothing:
//   • no routing, no personalization, no economics, no verification.
//   • `destination` is recorded ONLY where a real page exists in this project
//     today; otherwise it is null. Nothing here is invented.
// ─────────────────────────────────────────────────────────────────────────────

/** The ten canonical archetypes plus the reconciled additional groupings. */
export type MoneyMoveFamily =
  // canonical 10
  | "merch"
  | "music"
  | "fashion"
  | "film"
  | "books"
  | "culinary"
  | "wedding"
  | "manufacturing"
  | "trading"
  | "personal"
  // reconciled additional permanent groupings
  | "art"
  | "services"
  | "direct"
  | "knowledge"
  | "content"
  | "ecosystem";

export type MoneyMoveKind =
  /** One of the recovered canonical 40. */
  | "canonical"
  /** A legitimate additional permanent earning route found in current code. */
  | "additional";

/**
 * How much of this move the platform can actually carry today.
 *   executable — a real tool exists and a real economic action can start.
 *   partial    — a tool exists, but part of the chain is not wired yet.
 *   planned    — designed and reconciled, no executable tool yet.
 * Readiness describes CODE, never a promise of income.
 */
export type MoneyMoveReadiness = "executable" | "partial" | "planned";

export type MoneyMove = {
  /** Stable, permanent, human-readable. Never derived from title or position. */
  id: string;
  title: string;
  family: MoneyMoveFamily;
  kind: MoneyMoveKind;
  /** Plain English, for a Builder with limited English. What you actually do. */
  purpose: string;
  /** The economic outcome this move exists to produce. */
  outcome: string;
  /** A real page in this project, or null. Never invented. */
  destination: { label: string; path: string } | null;
  readiness: MoneyMoveReadiness;
  /** Other catalogue moves this one naturally hands on to (e.g. IP → merch). */
  relatedMoveIds?: string[];
  /**
   * Recovered specifics that are NOT verified in code (settlement times,
   * commission ranges, grant unlocks, margin or split claims). Listed as open
   * questions so nothing becomes an executable promise.
   */
  needsVerification?: string[];
};

export const MONEY_MOVE_FAMILIES: {
  id: MoneyMoveFamily;
  label: string;
  emoji: string;
  canonical: boolean;
  blurb: string;
}[] = [
  { id: "merch", label: "Money Merch", emoji: "👕", canonical: true, blurb: "Wearable product you own and sell." },
  { id: "music", label: "Music", emoji: "🎵", canonical: true, blurb: "Recorded work, licensing and live." },
  { id: "fashion", label: "Fashion", emoji: "🧵", canonical: true, blurb: "Made and styled garments." },
  { id: "film", label: "Film & Video", emoji: "🎬", canonical: true, blurb: "Screen work and the rights around it." },
  { id: "books", label: "Books", emoji: "📚", canonical: true, blurb: "Written work in every format." },
  { id: "culinary", label: "Culinary", emoji: "🍲", canonical: true, blurb: "Food knowledge, food service, food product." },
  { id: "wedding", label: "Wedding", emoji: "💍", canonical: true, blurb: "The wedding economy end to end." },
  { id: "manufacturing", label: "Manufacturing", emoji: "🏭", canonical: true, blurb: "Making at volume, and the tools to make." },
  { id: "trading", label: "Trading & Investments", emoji: "📈", canonical: true, blurb: "Funding, reserves and participation." },
  { id: "personal", label: "Personal Life", emoji: "🏡", canonical: true, blurb: "Family, promise and legacy value." },
  { id: "art", label: "Visual Art", emoji: "🎨", canonical: false, blurb: "Original art, prints and commissions." },
  { id: "services", label: "Services & Skills", emoji: "🛠️", canonical: false, blurb: "Your time, skill and licence, booked." },
  { id: "direct", label: "Direct Sale & Resale", emoji: "⚡", canonical: false, blurb: "Sell something today, with no build phase." },
  { id: "knowledge", label: "Knowledge Product", emoji: "🧠", canonical: false, blurb: "What you know, packaged and priced." },
  { id: "content", label: "Content & Audience", emoji: "📱", canonical: false, blurb: "Reach turned into earning links." },
  { id: "ecosystem", label: "Frass Ecosystem", emoji: "🤝", canonical: false, blurb: "Earning from growing Frass itself." },
];

/* ── Destinations that genuinely exist in this project today ─────────────── */
const D = {
  wallet: { label: "Frass Card selling tool", path: "/workspace/wallet?section=sell" },
  firstVenture: { label: "First Venture", path: "/workspace/first-venture" },
  gallery: { label: "Gallery Studio", path: "/gallery/studio" },
  studios: { label: "FV Studios", path: "/studios" },
  merch: { label: "Merch workspace", path: "/workspace/merch" },
  manufacturing: { label: "Manufacturing", path: "/manufacturing" },
  link: { label: "Your Frass Link", path: "/workspace/link" },
  affiliate: { label: "Affiliate workspace", path: "/workspace/affiliate" },
  vaults: { label: "Business Vaults", path: "/business-vaults" },
  services: { label: "Frass Services", path: "/services" },
  brand: { label: "Brand Partnerships", path: "/brand-partnerships" },
  bridal: { label: "Bridal Vault", path: "/bridal/vault" },
  opportunity: { label: "Opportunity Center", path: "/opportunity" },
  vault: { label: "Your Vault", path: "/vaults" },
} as const;

/** Verification flags reused where recovered wording was not provable in code. */
const V = {
  commission: "Commission range is not settled in code — policy and guardrails disagree.",
  settlement: "No settlement or clearing time exists anywhere in code yet.",
  margin: "Margin floor is 20% in code; 30% appeared in recovery. One number, one place, still to decide.",
  grants: "Grant unlock conditions are not defined in code.",
  royalty: "Royalty participation has no ledger that is ever credited.",
  payout: "No verified payout rail exists yet — payment is currently seller-declared.",
};

/**
 * THE CANONICAL 40 — ten archetypes × four moves, preserved in meaning and
 * grouping exactly as reconciled. Wording is plain English; nothing promises a
 * number the platform cannot produce.
 */
const CANONICAL: MoneyMove[] = [
  // 1 · Money Merch
  {
    id: "mm.merch.pod-fast-launch",
    title: "Fast-Track POD Launch",
    family: "merch",
    kind: "canonical",
    purpose: "Put your design on ready-made products so there is nothing to buy up front.",
    outcome: "A small product range on sale without holding stock.",
    destination: D.merch,
    readiness: "partial",
  },
  {
    id: "mm.merch.capsule-preorder",
    title: "Capsule Drop Pre-Order",
    family: "merch",
    kind: "canonical",
    purpose: "Take orders for a limited drop before you make it, so buyers fund the run.",
    outcome: "Paid pre-orders that cover production.",
    destination: D.merch,
    readiness: "partial",
    needsVerification: [V.payout],
  },
  {
    id: "mm.merch.signature-line",
    title: "Signature Brand Line",
    family: "merch",
    kind: "canonical",
    purpose: "Build your own named line that you keep selling, season after season.",
    outcome: "An owned product line with repeat sales.",
    destination: D.merch,
    readiness: "partial",
  },
  {
    id: "mm.merch.affiliate-program",
    title: "Affiliate Merch Program",
    family: "merch",
    kind: "canonical",
    purpose: "Let other people sell your merch and earn a share when they do.",
    outcome: "Sales made by other people on your behalf.",
    destination: D.affiliate,
    readiness: "planned",
    needsVerification: [V.commission, V.margin],
  },

  // 2 · Music
  {
    id: "mm.music.single-ep-release",
    title: "Single / EP Digital Release",
    family: "music",
    kind: "canonical",
    purpose: "Release your finished music so people can buy or stream it.",
    outcome: "A released title that can earn.",
    destination: D.studios,
    readiness: "partial",
  },
  {
    id: "mm.music.radio-sync-licensing",
    title: "Frass Radio Sync Licensing",
    family: "music",
    kind: "canonical",
    purpose: "Offer your music for use in Frass shows, radio and video.",
    outcome: "Licence use of work you already made.",
    destination: D.studios,
    readiness: "planned",
    needsVerification: [V.royalty],
  },
  {
    id: "mm.music.stems-producer-pack",
    title: "Stems & Producer Pack Sales",
    family: "music",
    kind: "canonical",
    purpose: "Sell the parts of your music other producers can build with.",
    outcome: "A digital product sold again and again.",
    destination: D.wallet,
    readiness: "partial",
  },
  {
    id: "mm.music.live-gifting",
    title: "Live Performance & Gifting Setup",
    family: "music",
    kind: "canonical",
    purpose: "Perform live and let your audience support you while you play.",
    outcome: "Live income and gifts from an audience.",
    destination: null,
    readiness: "partial",
    needsVerification: [V.payout],
  },

  // 3 · Fashion
  {
    id: "mm.fashion.custom-garment-presale",
    title: "Custom Garment / Pattern Presale",
    family: "fashion",
    kind: "canonical",
    purpose: "Take paid orders for pieces you make to measure.",
    outcome: "Paid made-to-order work.",
    destination: D.vaults,
    readiness: "partial",
  },
  {
    id: "mm.fashion.virtual-tryon-collection",
    title: "Virtual Try-On Collection",
    family: "fashion",
    kind: "canonical",
    purpose: "Let buyers see your pieces on themselves before they order.",
    outcome: "Higher conversion on the same collection.",
    destination: null,
    readiness: "partial",
  },
  {
    id: "mm.fashion.lookbook-drop",
    title: "Lookbook & Editorial Drop",
    family: "fashion",
    kind: "canonical",
    purpose: "Present a full collection as a story so people buy the look.",
    outcome: "A launched collection with buyers.",
    destination: null,
    readiness: "partial",
  },
  {
    id: "mm.fashion.boutique-wholesale",
    title: "Boutique Wholesale Portal",
    family: "fashion",
    kind: "canonical",
    purpose: "Sell in bulk to shops instead of one piece at a time.",
    outcome: "Larger repeat orders from businesses.",
    destination: null,
    readiness: "planned",
  },

  // 4 · Film & Video
  {
    id: "mm.film.fv-original-release",
    title: "FV Studios Original Release",
    family: "film",
    kind: "canonical",
    purpose: "Finish and release your own film or series through FV Studios.",
    outcome: "An owned title that can earn across platforms.",
    destination: D.studios,
    readiness: "partial",
    relatedMoveIds: ["mm.merch.signature-line", "mm.books.legacy-self-publishing"],
  },
  {
    id: "mm.film.brand-partnership-campaign",
    title: "Brand Partnership Campaign",
    family: "film",
    kind: "canonical",
    purpose: "Make paid video work for a brand.",
    outcome: "A paid commission from a brand.",
    destination: D.brand,
    readiness: "planned",
  },
  {
    id: "mm.film.ppv-rental-stream",
    title: "Pay-Per-View / Rental Stream",
    family: "film",
    kind: "canonical",
    purpose: "Charge for access to something you made.",
    outcome: "Direct viewer payments for one title.",
    destination: D.studios,
    readiness: "planned",
    needsVerification: [V.payout],
  },
  {
    id: "mm.film.stock-footage",
    title: "B-Roll & Stock Footage Ingestion",
    family: "film",
    kind: "canonical",
    purpose: "Sell the footage you already shot and never used.",
    outcome: "Income from material you already own.",
    destination: D.studios,
    readiness: "planned",
  },

  // 5 · Books
  {
    id: "mm.books.legacy-self-publishing",
    title: "Legacy Author Self-Publishing",
    family: "books",
    kind: "canonical",
    purpose: "Turn your story or knowledge into your own published book.",
    outcome: "A published book you own.",
    destination: null,
    readiness: "partial",
  },
  {
    id: "mm.books.ebook-audiobook",
    title: "Digital E-Book & Audiobook Release",
    family: "books",
    kind: "canonical",
    purpose: "Release the same book in digital and audio so more people can buy it.",
    outcome: "Extra formats of one book, sold digitally.",
    destination: null,
    readiness: "partial",
  },
  {
    id: "mm.books.pod-print-drop",
    title: "Physical POD Book Drop",
    family: "books",
    kind: "canonical",
    purpose: "Offer a printed copy that is only made when someone buys it.",
    outcome: "Printed sales with no stock to fund.",
    destination: null,
    readiness: "planned",
  },
  {
    id: "mm.books.chapter-subscription",
    title: "Chapter-by-Chapter Subscription / Vault Program",
    family: "books",
    kind: "canonical",
    purpose: "Release your book in parts to readers who pay as it grows.",
    outcome: "Recurring income while you write.",
    destination: null,
    readiness: "planned",
    needsVerification: [V.settlement],
  },

  // 6 · Culinary
  {
    id: "mm.culinary.recipe-spice-bundle",
    title: "Recipe Book & Spice Blend Bundle",
    family: "culinary",
    kind: "canonical",
    purpose: "Sell your recipes together with the blends they need.",
    outcome: "A product bundle with repeat buyers.",
    destination: D.wallet,
    readiness: "partial",
  },
  {
    id: "mm.culinary.popup-catering",
    title: "Pop-Up Dining & Catering Booking",
    family: "culinary",
    kind: "canonical",
    purpose: "Take bookings to cook for people at an event.",
    outcome: "Paid bookings with a deposit.",
    destination: null,
    readiness: "partial",
  },
  {
    id: "mm.culinary.masterclass-vault",
    title: "Kitchen Masterclass Vault Program",
    family: "culinary",
    kind: "canonical",
    purpose: "Teach what you cook, as a paid programme.",
    outcome: "Paid students on a repeatable course.",
    destination: null,
    readiness: "planned",
    relatedMoveIds: ["mm.knowledge.paid-guide-course"],
  },
  {
    id: "mm.culinary.local-produce-link",
    title: "Local Produce Marketplace Link",
    family: "culinary",
    kind: "canonical",
    purpose: "Sell what you grow or source to people near you.",
    outcome: "Regular local sales.",
    destination: D.services,
    readiness: "planned",
  },

  // 7 · Wedding
  {
    id: "mm.wedding.registry-wishlist",
    title: "Bridal Registry & Wishlist Engine",
    family: "wedding",
    kind: "canonical",
    purpose: "Run the couple's gift list so purchases happen in one place.",
    outcome: "Gift purchases through your registry.",
    destination: D.bridal,
    readiness: "partial",
  },
  {
    id: "mm.wedding.vendor-listing",
    title: "Vendor Marketplace Listing",
    family: "wedding",
    kind: "canonical",
    purpose: "List your wedding service where couples are already looking.",
    outcome: "Booked wedding work.",
    destination: D.bridal,
    readiness: "partial",
  },
  {
    id: "mm.wedding.gown-appointment",
    title: "Custom Bridal Gown Appointment",
    family: "wedding",
    kind: "canonical",
    purpose: "Take paid appointments for made-to-measure bridal wear.",
    outcome: "High-value commissioned garments.",
    destination: D.bridal,
    readiness: "partial",
  },
  {
    id: "mm.wedding.group-package",
    title: "Volume Economics Group Package",
    family: "wedding",
    kind: "canonical",
    purpose: "Price the whole party together instead of one person at a time.",
    outcome: "One larger order instead of several small ones.",
    destination: D.bridal,
    readiness: "planned",
  },

  // 8 · Manufacturing
  {
    id: "mm.manufacturing.tooling-run",
    title: "Production Line Tooling Run",
    family: "manufacturing",
    kind: "canonical",
    purpose: "Get your design properly made at volume by a production partner.",
    outcome: "Finished stock ready to sell.",
    destination: D.manufacturing,
    readiness: "partial",
  },
  {
    id: "mm.manufacturing.bulk-wholesale",
    title: "Bulk Inventory Wholesale Listing",
    family: "manufacturing",
    kind: "canonical",
    purpose: "Sell your stock in quantity to other sellers.",
    outcome: "Fast movement of inventory.",
    destination: D.manufacturing,
    readiness: "planned",
  },
  {
    id: "mm.manufacturing.equipment-sharing",
    title: "Equipment & Facility Sharing",
    family: "manufacturing",
    kind: "canonical",
    purpose: "Rent out the machines or space you already pay for.",
    outcome: "Income from equipment you already own.",
    destination: null,
    readiness: "planned",
  },
  {
    id: "mm.manufacturing.co-branded-license",
    title: "Co-Branded License Agreement",
    family: "manufacturing",
    kind: "canonical",
    purpose: "Let another brand make your product under agreement.",
    outcome: "Licence income without producing it yourself.",
    destination: null,
    readiness: "planned",
    needsVerification: [V.royalty],
  },

  // 9 · Trading & Investments
  {
    id: "mm.trading.community-project-fund",
    title: "Community Project Fund Grant",
    family: "trading",
    kind: "canonical",
    purpose: "Apply for funding for a project that helps more than just you.",
    outcome: "Funding you do not repay in sales.",
    destination: D.opportunity,
    readiness: "planned",
    needsVerification: [V.grants],
  },
  {
    id: "mm.trading.foundation-micro-grant",
    title: "Frass Hill Foundation Micro-Grant",
    family: "trading",
    kind: "canonical",
    purpose: "Ask the Foundation for a small amount to unblock a real step.",
    outcome: "A small grant that removes a blocker.",
    destination: D.opportunity,
    readiness: "planned",
    needsVerification: [V.grants],
  },
  {
    id: "mm.trading.vault-reserve-allocation",
    title: "Voluntary Vault Reserve Allocation",
    family: "trading",
    kind: "canonical",
    purpose: "Choose to hold part of what you earn back for your own future.",
    outcome: "A protected reserve you own.",
    destination: null,
    readiness: "planned",
    needsVerification: [V.settlement],
  },
  {
    id: "mm.trading.ecosystem-royalty",
    title: "Ecosystem Royalty Participation",
    family: "trading",
    kind: "canonical",
    purpose: "Share in the value of something you helped create.",
    outcome: "Ongoing participation income.",
    destination: null,
    readiness: "planned",
    needsVerification: [V.royalty],
  },

  // 10 · Personal Life
  {
    id: "mm.personal.promise-vault",
    title: "Promise Vault Commitment",
    family: "personal",
    kind: "canonical",
    purpose: "Record a promise you intend to keep, and the money behind it.",
    outcome: "A funded personal commitment.",
    destination: D.vault,
    readiness: "partial",
  },
  {
    id: "mm.personal.family-vision-map",
    title: "Family Vision Map",
    family: "personal",
    kind: "canonical",
    purpose: "Agree what the family is building and what it will cost.",
    outcome: "A shared plan money can be aimed at.",
    destination: D.vault,
    readiness: "partial",
  },
  {
    id: "mm.personal.generational-archive",
    title: "Generational Legacy Archive",
    family: "personal",
    kind: "canonical",
    purpose: "Keep what you know and own safely, for the people after you.",
    outcome: "Value that survives you.",
    destination: D.vault,
    readiness: "partial",
    relatedMoveIds: ["mm.books.legacy-self-publishing"],
  },
  {
    id: "mm.personal.heritage-contribution",
    title: "Community Heritage Contribution",
    family: "personal",
    kind: "canonical",
    purpose: "Contribute your history to the community record.",
    outcome: "Recognised contribution to shared heritage.",
    destination: null,
    readiness: "planned",
  },
];

/**
 * ADDITIONAL PERMANENT ROUTES — reconciled from current code, not part of the
 * canonical 40, and deliberately grouped rather than promoted to new archetypes.
 */
const ADDITIONAL: MoneyMove[] = [
  // Direct sale & resale — the fastest real-money routes, no build phase.
  {
    id: "mm.direct.frass-card-sale",
    title: "Put one thing up for sale on your Frass Card",
    family: "direct",
    kind: "additional",
    purpose:
      "Add a photo, a price and how many you have. It goes live on your card straight away, and anyone with your link can buy it.",
    outcome: "One real item on sale, with a real buyer able to act today.",
    destination: D.wallet,
    readiness: "executable",
    needsVerification: [V.payout],
  },
  {
    id: "mm.direct.hidden-assets-resale",
    title: "Hidden Assets — sell what you already own",
    family: "direct",
    kind: "additional",
    purpose: "Find something valuable you already have, price it honestly and sell it.",
    outcome: "Cash from things you already own, with nothing to build first.",
    destination: D.firstVenture,
    readiness: "partial",
    relatedMoveIds: ["mm.direct.frass-card-sale"],
  },

  // Visual art
  {
    id: "mm.art.originals-prints-commissions",
    title: "Original Art, Prints & Commissions",
    family: "art",
    kind: "additional",
    purpose: "Sell your original work, sell prints of it, and take paid commissions.",
    outcome: "Three income lines from one body of work.",
    destination: D.gallery,
    readiness: "partial",
  },

  // Services & skills — each has its own economics, so each is its own move.
  {
    id: "mm.services.wellness-practice",
    title: "Wellness Practice Sessions",
    family: "services",
    kind: "additional",
    purpose: "Offer your wellness sessions and let people book and pay for them.",
    outcome: "Booked repeat sessions.",
    destination: D.vaults,
    readiness: "partial",
  },
  {
    id: "mm.services.beauty-appointments",
    title: "Beauty Appointments",
    family: "services",
    kind: "additional",
    purpose: "Fill your chair with booked appointments instead of walk-ins.",
    outcome: "Paid appointments on a schedule you control.",
    destination: D.vaults,
    readiness: "partial",
  },
  {
    id: "mm.services.photography-bookings",
    title: "Photography Bookings & Licensing",
    family: "services",
    kind: "additional",
    purpose: "Take paid shoots, then licence or print the images afterwards.",
    outcome: "Booking income plus a licensing tail.",
    destination: D.vaults,
    readiness: "partial",
    relatedMoveIds: ["mm.film.stock-footage"],
  },
  {
    id: "mm.services.freight-brokerage",
    title: "Freight & Logistics Brokerage",
    family: "services",
    kind: "additional",
    purpose: "Match loads to carriers and earn on the margin per lane.",
    outcome: "Margin on movements you arrange.",
    destination: D.services,
    readiness: "partial",
  },
  {
    id: "mm.services.software-builds",
    title: "Software & Technology Builds",
    family: "services",
    kind: "additional",
    purpose: "Sell a priced technical deliverable, not open-ended hours.",
    outcome: "Fixed-price work delivered and paid.",
    destination: D.services,
    readiness: "partial",
  },
  {
    id: "mm.services.trade-jobs",
    title: "Trade Jobs, Quotes & Invoices",
    family: "services",
    kind: "additional",
    purpose: "Quote a job properly, do it, invoice it, and keep the proof.",
    outcome: "Paid trade work with a record behind it.",
    destination: D.vaults,
    readiness: "partial",
  },

  // Maker / manufacturing relationship
  {
    id: "mm.manufacturing.made-to-order-craft",
    title: "Made-to-Order Craft & Woodworking",
    family: "manufacturing",
    kind: "additional",
    purpose: "Take a deposit, make the piece to order, deliver on an agreed lead time.",
    outcome: "Deposit-funded commissioned pieces.",
    destination: D.vaults,
    readiness: "partial",
    relatedMoveIds: ["mm.manufacturing.tooling-run"],
  },

  // Knowledge product
  {
    id: "mm.knowledge.paid-guide-course",
    title: "Paid Guide, Course or Template Pack",
    family: "knowledge",
    kind: "additional",
    purpose: "Take one thing you already know and sell it as a guide, course or template pack.",
    outcome: "A digital product sold many times from work done once.",
    destination: null,
    readiness: "planned",
  },

  // Content & audience
  {
    id: "mm.content.faceless-content",
    title: "Faceless Content",
    family: "content",
    kind: "additional",
    purpose: "Publish content that earns without ever showing your face.",
    outcome: "Reach turned into earning links.",
    destination: D.studios,
    readiness: "partial",
  },

  // Frass ecosystem
  {
    id: "mm.ecosystem.referral-income",
    title: "Referral Income",
    family: "ecosystem",
    kind: "additional",
    purpose: "Bring people you trust onto Frass using your own Frass Link.",
    outcome: "A one-time bonus per genuine new Builder.",
    destination: D.link,
    readiness: "partial",
    needsVerification: [
      "Referral bonuses are recorded today but never approved or paid — no payout rail exists.",
    ],
  },
];

/** The one canonical Master Money Moves Library. */
export const MONEY_MOVE_CATALOGUE: MoneyMove[] = [...CANONICAL, ...ADDITIONAL];

/**
 * Stays a Fast Track / add-on under a parent move — never a permanent entry.
 * Recorded here so it is not "lost", and not re-promoted by mistake later.
 */
export const NOT_PERMANENT_MOVES = [
  {
    what: "Trusted-tool affiliate links",
    belongsUnder: "Any parent move where the Builder already recommends tools",
    why: "It is an add-on to a move that already exists, not an economic outcome of its own.",
  },
  {
    what: "Campaign Money Moves",
    belongsUnder: "The separate Campaign catalogue",
    why: "Campaigns are time-bound participation, not permanent Library entries.",
  },
] as const;

/* ── Lookups ─────────────────────────────────────────────────────────────── */

export function moveById(id: string): MoneyMove | undefined {
  return MONEY_MOVE_CATALOGUE.find((m) => m.id === id);
}

export function movesByFamily(family: MoneyMoveFamily): MoneyMove[] {
  return MONEY_MOVE_CATALOGUE.filter((m) => m.family === family);
}

export function familyLabel(family: MoneyMoveFamily): string {
  return MONEY_MOVE_FAMILIES.find((f) => f.id === family)?.label ?? family;
}

/** Families in display order, each with its moves. Empty families are dropped. */
export function catalogueByFamily() {
  return MONEY_MOVE_FAMILIES.map((f) => ({ ...f, moves: movesByFamily(f.id) })).filter(
    (f) => f.moves.length > 0,
  );
}

export const READINESS_LABEL: Record<MoneyMoveReadiness, string> = {
  executable: "You can start this now",
  partial: "Partly built — some steps still by hand",
  planned: "Planned — the tool is not ready yet",
};
