// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0483 — Frass Services Marketplace · "One Platform. Every Service."
//
// This is NOT a second marketplace and NOT a shipping feature. It is the
// configuration layer that lets the Marketplace that already exists carry
// services next to products:
//
//   Marketplace (Frass District / card listings) · Business Vaults ·
//   Money Moves · Business Builder · Frass Cards · Financial Center · Daily
//
// Hard rules:
//   · New categories and corridors are added HERE (configuration), never by
//     rewriting the Marketplace.
//   · Every service business routes into the existing Business Vault +
//     Money Moves engines — no parallel launch system.
//   · Every payment, receipt and wallet stays in the Financial Center.
//   · Frass owns the customer experience, never the trucks, ships or licences.
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICES_PRINCIPLE =
  "Frass doesn't just sell products — it connects people with trusted products, trusted services and trusted opportunities. Every legitimate skill deserves a place in the Frass economy, and every service needs a clear path from discovery to delivery to monetization.";

export const SERVICES_PLAIN_ENGLISH =
  "Here's how it works: the same shop that sells you a jacket can also send someone to pack your house, clean it after, ship the barrel and meet it at the other end. One place, one conversation, many trusted people doing the work — like a good hotel concierge who knows everybody on the island.";

export const SERVICES_RULE =
  "If a member needs a service, Frassy checks Frass first. A qualified Frass Partner is recommended before anyone outside — but never a weaker option just because it lives on Frass.";

// ── Categories (configuration, not code) ─────────────────────────────────────

export type ServiceCategory = {
  /** Stable slug — used by listings, vaults and Money Moves. */
  id: string;
  emoji: string;
  label: string;
  /** What the customer is actually buying, in plain words. */
  promise: string;
  /** Typical work a provider in this category sells. */
  offerings: string[];
  /** Existing Business Builder journeys this maps onto. */
  businesses: string[];
  /** True when the category carries legal/professional responsibility. */
  licensed?: boolean;
  /** Optional geographic corridors (freight, moving, translation). */
  corridors?: string[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "freight-logistics",
    emoji: "🚢",
    label: "Freight Brokerage & Logistics",
    promise: "Get goods from one country to another without learning the industry.",
    offerings: [
      "Barrel and crate shipping",
      "Container consolidation",
      "Rate comparison across approved carriers",
      "Customs paperwork support",
      "Pickup and door delivery",
      "Shipment tracking updates",
    ],
    businesses: ["affiliate"],
    corridors: ["Canada → Jamaica", "USA → Jamaica", "Canada → Africa", "UK → Caribbean", "Domestic Canada"],
  },
  {
    id: "packing",
    emoji: "📦",
    label: "Packing Services",
    promise: "Someone packs it properly so nothing breaks in transit.",
    offerings: ["Full-home packing", "Fragile and specialty packing", "Barrel packing", "Labelling and inventory"],
    businesses: ["affiliate"],
  },
  {
    id: "moving",
    emoji: "🚚",
    label: "Moving Services",
    promise: "Bodies, trucks and a plan on moving day.",
    offerings: ["Local moves", "Long-distance moves", "Loading and unloading", "Furniture assembly"],
    businesses: ["affiliate"],
  },
  {
    id: "cleaning",
    emoji: "🧽",
    label: "Cleaning Services",
    promise: "The place is left the way it should be found.",
    offerings: ["Move-out cleaning", "Deep cleaning", "Recurring home cleaning", "Post-renovation cleaning"],
    businesses: ["affiliate"],
  },
  {
    id: "personal-shopping",
    emoji: "🛍",
    label: "Personal Shopping",
    promise: "Someone with taste buys on your behalf.",
    offerings: ["Wardrobe sourcing", "Gift sourcing", "Grocery and household runs", "Style edits"],
    businesses: ["coco-vintage", "affiliate"],
  },
  {
    id: "esthetics",
    emoji: "🧴",
    label: "Esthetics",
    promise: "Skin and beauty work from someone certified to do it.",
    offerings: ["Facials", "Skin consultations", "Treatment plans", "Product routines"],
    businesses: ["wellness"],
    licensed: true,
  },
  {
    id: "fitness",
    emoji: "🏋️",
    label: "Fitness Coaching",
    promise: "A plan and someone who holds you to it.",
    offerings: ["1:1 coaching", "Group sessions", "Programme design", "Accountability check-ins"],
    businesses: ["wellness", "podcast"],
  },
  {
    id: "wellness",
    emoji: "🌿",
    label: "Wellness Consulting",
    promise: "Guidance for living better, from someone who has done it.",
    offerings: ["Wellness plans", "Nutrition guidance", "Healthy-aging sessions", "Herbal knowledge"],
    businesses: ["wellness"],
  },
  {
    id: "photography",
    emoji: "📷",
    label: "Photography",
    promise: "Images good enough to sell with.",
    offerings: ["Product shoots", "Portraits", "Events", "Content days"],
    businesses: ["faceless", "coco-vintage"],
  },
  {
    id: "graphic-design",
    emoji: "🎨",
    label: "Graphic Design",
    promise: "A brand that looks like it means business.",
    offerings: ["Logos", "Brand kits", "Packaging", "Social templates"],
    businesses: ["faceless"],
  },
  {
    id: "podcast-production",
    emoji: "🎙",
    label: "Podcast Production",
    promise: "You talk; someone else makes it sound professional.",
    offerings: ["Editing", "Show art", "Clip cutting", "Distribution setup"],
    businesses: ["podcast", "faceless"],
  },
  {
    id: "web-design",
    emoji: "💻",
    label: "Web Design",
    promise: "A place online that actually converts.",
    offerings: ["Landing pages", "Storefront setup", "Booking pages", "Maintenance"],
    businesses: ["faceless", "affiliate"],
  },
  {
    id: "translation",
    emoji: "🗣",
    label: "Translation",
    promise: "Say it correctly in the other language.",
    offerings: ["Document translation", "Live interpretation", "Subtitling", "Localisation"],
    businesses: ["faceless"],
    corridors: ["English ↔ Spanish", "English ↔ French", "English ↔ Patois", "English ↔ Portuguese"],
  },
  {
    id: "legal",
    emoji: "⚖️",
    label: "Legal Services",
    promise: "Qualified legal help, clearly scoped.",
    offerings: ["Contracts", "Business formation", "Immigration paperwork", "Consultations"],
    businesses: [],
    licensed: true,
  },
  {
    id: "accounting",
    emoji: "📊",
    label: "Accounting",
    promise: "Numbers filed correctly, on time.",
    offerings: ["Tax filing", "Financial statements", "Advisory", "Payroll"],
    businesses: [],
    licensed: true,
  },
  {
    id: "bookkeeping",
    emoji: "🧾",
    label: "Bookkeeping",
    promise: "Records kept clean all year, not in a panic.",
    offerings: ["Monthly books", "Receipt organisation", "Invoicing", "Reconciliation"],
    businesses: ["affiliate"],
  },
  {
    id: "tutoring",
    emoji: "📚",
    label: "Tutoring",
    promise: "One person explaining until it clicks.",
    offerings: ["Exam prep", "Homework help", "Adult learning", "Language practice"],
    businesses: ["podcast", "faceless"],
  },
  {
    id: "music-lessons",
    emoji: "🎵",
    label: "Music Lessons",
    promise: "Learn the instrument from someone who plays it.",
    offerings: ["Instrument lessons", "Voice coaching", "Theory", "Recording basics"],
    businesses: ["podcast"],
  },
  {
    id: "event-planning",
    emoji: "🎉",
    label: "Event Planning",
    promise: "The day runs without you carrying it.",
    offerings: ["Weddings", "Milestones", "Corporate events", "Vendor coordination"],
    businesses: ["affiliate"],
  },
  {
    id: "virtual-assistance",
    emoji: "🗂",
    label: "Virtual Assistance",
    promise: "Hours back in the week.",
    offerings: ["Inbox and calendar", "Customer replies", "Listings and admin", "Research"],
    businesses: ["affiliate", "faceless"],
  },
];

export function categoryById(id: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((c) => c.id === id);
}

/** Plain-language matching used by Frassy and the directory search. */
export function matchCategories(text: string): ServiceCategory[] {
  const q = text.toLowerCase().trim();
  if (!q) return [];
  return SERVICE_CATEGORIES.filter((c) =>
    [c.label, c.promise, ...c.offerings, ...(c.corridors ?? [])].some((s) => {
      const hay = s.toLowerCase();
      return hay.includes(q) || q.includes(c.label.toLowerCase().split(" ")[0]!);
    }),
  );
}

// ── Service Orchestration ────────────────────────────────────────────────────
// Some jobs need several providers. The member experiences ONE journey.

export type Orchestration = {
  id: string;
  emoji: string;
  label: string;
  /** The member's own words for the job. */
  need: string;
  /** Ordered categories Frassy coordinates, each performed by a partner. */
  steps: { categoryId: string; role: string }[];
};

export const ORCHESTRATIONS: Orchestration[] = [
  {
    id: "relocation",
    emoji: "🌍",
    label: "Relocating to another country",
    need: "I'm moving my life overseas and I don't know where to start.",
    steps: [
      { categoryId: "packing", role: "Pack the home properly and inventory every box" },
      { categoryId: "cleaning", role: "Leave the property in move-out condition" },
      { categoryId: "freight-logistics", role: "Book the freight and compare carrier rates" },
      { categoryId: "freight-logistics", role: "Prepare customs paperwork and insurance" },
      { categoryId: "moving", role: "Deliver at the destination address" },
    ],
  },
  {
    id: "barrel-home",
    emoji: "🛢",
    label: "Sending a barrel home",
    need: "I want to send goods to family without being overcharged.",
    steps: [
      { categoryId: "packing", role: "Pack and label the barrel so nothing breaks" },
      { categoryId: "freight-logistics", role: "Compare approved carriers on the corridor" },
      { categoryId: "freight-logistics", role: "Track milestones and keep the family informed" },
    ],
  },
  {
    id: "launch-a-brand",
    emoji: "🚀",
    label: "Launching a small brand",
    need: "I have a product but nothing around it looks professional yet.",
    steps: [
      { categoryId: "graphic-design", role: "Brand kit and packaging" },
      { categoryId: "photography", role: "Product images good enough to sell with" },
      { categoryId: "web-design", role: "Storefront and booking page" },
      { categoryId: "virtual-assistance", role: "Keep listings and replies moving" },
    ],
  },
];

// ── Money Moves integration ──────────────────────────────────────────────────
// Every service business gets a Business Vault and a launch roadmap generated
// by the existing engines. This is the roadmap shape, not a second engine.

export const SERVICE_LAUNCH_ROADMAP: { id: string; label: string; why: string }[] = [
  { id: "register", label: "Register the business", why: "A real name makes you bookable and payable." },
  { id: "brand", label: "Name, mark and one clean photo", why: "People buy services from someone who looks reliable." },
  { id: "pricing", label: "Set pricing you can defend", why: "Undercharging kills a service business faster than no customers." },
  { id: "packages", label: "Build two or three service packages", why: "Choices close faster than custom quotes." },
  { id: "card", label: "Turn on your service-enabled Frass Card", why: "That card is your storefront, quote form and booking page." },
  { id: "availability", label: "Publish your booking availability", why: "A customer who has to ask 'when are you free?' often doesn't." },
  { id: "onboarding", label: "Write your customer onboarding steps", why: "The first ten minutes decide the review." },
  { id: "marketing", label: "Tell the people who already trust you", why: "Your first customers are already in your phone." },
  { id: "reviews", label: "Collect your first three reviews", why: "Reviews are the only proof a new service has." },
  { id: "launch", label: "Go live in the Services Marketplace", why: "Listed and bookable is the monetization outcome." },
];

/** The vault a service category becomes, using the existing vault shape. */
export function vaultSeedFor(category: ServiceCategory) {
  return {
    key: `service-${category.id}`,
    emoji: category.emoji,
    label: category.label,
    summary: category.promise,
    rationale: `A service business in ${category.label} — listed in the Frass Services Marketplace, paid through the Financial Center.`,
    roadmap: SERVICE_LAUNCH_ROADMAP.map((s) => s.label),
  };
}

// ── Frassy context ───────────────────────────────────────────────────────────

export function servicesContext(): string {
  const cats = SERVICE_CATEGORIES.map((c) => `${c.label}`).join(", ");
  return [
    "FRASS SERVICES MARKETPLACE (FRASS-0483)",
    "You are the Marketplace Coordinator. Products and services live in ONE marketplace.",
    `Service categories: ${cats}.`,
    "Freight Brokerage & Logistics is one category, never the frame. Frass owns the customer experience, not trucks, ships, warehouses or containers.",
    "For a service need: match the best Frass Partner first, explain the options plainly, coordinate multi-step jobs (packing → cleaning → freight → customs → delivery) as ONE journey, monitor progress and surface anything needing attention in the Daily.",
    "Never replace a licensed professional where expertise or legal responsibility is required — coordinate them instead.",
    "All money moves through the Financial Center: no second payment system, no second receipt, no second wallet.",
  ].join("\n");
}
