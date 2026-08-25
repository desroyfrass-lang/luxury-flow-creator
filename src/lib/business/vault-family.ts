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
// Here's the practical version: pick the thing you already know how to do. Frass walks you
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
    showcase: { label: "Frass Kicks", to: "/frass-district", note: "Your drop shown where the sneaker people already are." },
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
      { title: "Write the offer in simple terms", stage: "build", minutes: 20 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome: "A priced technical offer or product live in the Marketplace.",
  },

  // FRASS-0532 — the Tradesperson Vault. Built for skilled hands: builders,
  // contractors, masons, electricians, carpenters, plumbers and every other
  // trade — including the many excellent tradespeople who never got the paper.
  {
    key: "tradesperson",
    emoji: "🔨",
    label: "Tradesperson Vault",
    summary: "Turn a skilled trade into a real business — jobs, quotes, invoices and a reputation people can find.",
    forWho:
      "Builders, contractors, masons, electricians, carpenters, plumbers, HVAC technicians, roofers, painters, welders, drywall installers, tile setters, handymen and renovation specialists — certified or not.",
    paths: [
      "Local service jobs",
      "Emergency call-outs",
      "Renovation projects",
      "Maintenance contracts",
      "Subcontracting for larger builds",
      "Trusted referrals",
      "Consultations and site advice",
      "Guides, checklists and DIY courses",
      // FRASS-0532-C — Digital Legacy: the experience itself is the asset.
      "Templates, inspection forms and maintenance schedules",
      "Recorded voice lessons and short teaching videos",
      "Tool and materials recommendations",
      "A problem-solving library from decades of jobs",
    ],
    moves: [
      { title: "Name the trade and the jobs you take", stage: "discover", minutes: 15 },
      { title: "Set the area you cover and your call-out terms", stage: "discover", minutes: 15 },
      { title: "Show your experience honestly — years, jobs, any certification you hold", stage: "discover", minutes: 15 },
      { title: "Photograph one finished job, before and after", stage: "build", minutes: 20, to: "/vault" },
      { title: "Let Frassy write your service listing for you", stage: "build", minutes: 15, to: "/services" },
      { title: "Set your prices and a standard quote template", stage: "build", minutes: 25, to: "/money-moves" },
      { title: "Ask two past customers for a review", stage: "build", minutes: 15, to: "/workspace/card" },
      { title: "Turn on invoices so every job gets paid properly", stage: "build", minutes: 15, to: "/financial-center" },
      { title: "List the service so people can book you", stage: "monetize", minutes: 20, to: "/services" },
      { title: "Put the business on your Frass Card", stage: "monetize", minutes: 15, to: "/workspace/card" },
      { title: "Record one thing you know and turn it into a paid guide or course", stage: "monetize", minutes: 25, to: "/vault" },
      // FRASS-0532-C — Digital Legacy moves. Monetize the experience, not only the labour.
      { title: "Save one problem you solved and how you fixed it", stage: "build", minutes: 10, to: "/vault" },
      { title: "Record a two-minute voice lesson — Frassy turns it into a video and an article", stage: "build", minutes: 15, to: "/workspace/composer" },
      { title: "Publish the tools and materials you actually trust", stage: "monetize", minutes: 15, to: "/affiliate" },
      { title: "Turn your checklists and forms into a paid template pack", stage: "monetize", minutes: 25, to: "/vault" },
      { title: "Set up trusted referrals for the jobs you can't take", stage: "monetize", minutes: 15, to: "/services" },
    ],
    monetizationOutcome:
      "A bookable trade service in the Frass Services Marketplace with real job photos, reviews, quotes and invoices — plus a growing Digital Legacy of guides, lessons, templates and recommendations that keep earning when the tools are down.",
    showcase: {
      label: "Frass Services",
      to: "/services",
      note: "Your work is presented as a bookable service — one listing, one reputation, no second profile.",
    },
    craft: "your trade",
  },

  // FRASS-0533 — the Creative Series & IP Vault. A series is a media business:
  // characters, a world, a back catalog and licensing. Flagship: the Founder's
  // own animated series, "I Am Not My Hair".
  {
    key: "creative-series",
    emoji: "🎬",
    label: "Creative Series & IP Vault",
    summary: "Turn a story, a character or a series into a media brand that keeps earning — not just uploads.",
    forWho:
      "Anyone with a story worth telling weekly: animators, comedians, educators, storytellers, hairstylists, chefs, tradespeople — anybody whose real life is funnier and more useful than fiction.",
    paths: [
      "A monetized YouTube channel",
      "Shorts and clips",
      "Merchandise",
      "Educational content",
      "Digital products",
      "Children's books",
      "Animated specials",
      "Licensing opportunities",
      "Streaming opportunities",
      "Recurring characters and intellectual property",
    ],
    designSupport: [
      "Brainstorm episode ideas with Frassy",
      "Organise scripts and keep continuity between episodes",
      "Generate storyboards and animation in FV Studios",
      "Optimize titles, descriptions, thumbnails and keywords",
      "Track production and monetization progress",
    ],
    moves: [
      { title: "Name the series and the world it lives in", stage: "discover", minutes: 20 },
      { title: "Write the recurring characters people will come back for", stage: "discover", minutes: 25 },
      { title: "List ten real-life moments funny enough to become episodes", stage: "discover", minutes: 20 },
      { title: "Brainstorm this week's episode and pick the funniest concept", stage: "build", minutes: 20, to: "/workspace/composer" },
      { title: "Build the script and plan the scenes", stage: "build", minutes: 40, to: "/workspace/composer" },
      { title: "Generate the storyboards", stage: "build", minutes: 25, to: "/fv-studios" },
      { title: "Produce the animation", stage: "build", minutes: 60, to: "/fv-studios" },
      { title: "Prepare the upload — title, description, thumbnail, keywords", stage: "build", minutes: 25 },
      { title: "Publish the episode", stage: "monetize", minutes: 15 },
      { title: "Repurpose the episode into three Shorts", stage: "monetize", minutes: 20, to: "/fv-studios" },
      { title: "Track performance and monetization progress", stage: "monetize", minutes: 15 },
      { title: "Turn the characters into merch, a book or a licensing offer", stage: "monetize", minutes: 30, to: "/marketplace" },
    ],
    monetizationOutcome:
      "A published episode on a monetized channel, three Shorts cut from it, and at least one owned product — merch, a book or a licensing offer — built on the series' characters.",
    showcase: {
      label: "FV Studios",
      to: "/fv-studios",
      note: "Scripts, storyboards, animation and Shorts are produced in FV Studios — one studio, one catalog.",
    },
    craft: "storytelling",
  },

  // FRASS-0534 — the Author Vault. Every completed journey can become a book.
  // This Vault is the engine behind the Legacy Publication Engine: it walks a
  // member from "I finished something" to "people can buy my book." Flagship:
  // the Founder republishing "My Different Shades of Black" and Mother's first
  // book. Frassy is the editor, never the author.
  {
    key: "author",
    emoji: "✒️",
    label: "Author Vault",
    summary:
      "Turn a finished journey into a book — and the same knowledge into an audiobook, a course and more. Create once, earn for years.",
    forWho:
      "Anyone who has completed a Business Vault or a creative project, and anyone republishing work they already wrote. Writers, memoirists, teachers, founders reclaiming their own books.",
    paths: [
      "E-book",
      "Audiobook",
      "Printable workbook",
      "Online course",
      "Video course",
      "Podcast series",
      "Email course",
      "Blog series",
      "Downloadable guide",
      "Knowledge Hub",
    ],
    designSupport: [
      "Gather everything the journey already produced",
      "Propose a chapter outline from a completed Vault",
      "Frassy edits for clarity — you approve every draft",
      "Version control — nothing is ever lost",
      "Handwritten amendments become typed corrections",
      "Publish in multiple formats from one manuscript",
    ],
    moves: [
      { title: "Pick the journey to turn into a book", stage: "discover", minutes: 15 },
      { title: "Gather everything the journey produced — goals, lessons, photos, milestones", stage: "discover", minutes: 30 },
      { title: "Name the book and write the one-sentence promise", stage: "discover", minutes: 20 },
      { title: "Approve the chapter outline Frassy proposes", stage: "discover", minutes: 20 },
      { title: "Tell the story of chapter one (by voice or typing)", stage: "build", minutes: 40 },
      { title: "Review Frassy's edit of chapter one and approve it", stage: "build", minutes: 25 },
      { title: "Draft the remaining chapters", stage: "build", minutes: 60 },
      { title: "Add handwritten amendments and let Frassy apply them", stage: "build", minutes: 30 },
      { title: "Approve the full manuscript review", stage: "monetize", minutes: 30 },
      { title: "Pick the formats — e-book, audiobook, course, workbook", stage: "monetize", minutes: 20 },
      ...MARKETPLACE_CLOSE,
    ],
    monetizationOutcome:
      "An approved manuscript published as an e-book in the Marketplace, with at least one additional format (audiobook, course or workbook) prepared from the same knowledge.",
    showcase: {
      label: "Legacy Publications",
      to: "/workspace",
      note: "Manuscripts, chapters and amendments are managed in your Workspace; published formats sell through the Marketplace on your Frass Card.",
    },
    craft: "writing",
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
    "Let's break it down: whatever you already know how to do — sew, cook, cut hair, code, drive freight — there's a Vault for it, and every Vault ends the same way: something real that people can pay you for.",
};
