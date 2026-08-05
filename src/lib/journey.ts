// The Intelligent Builder Journey — the first experience inside Frass OS.
// Client-safe stage definitions shared by the UI and the server functions.

export type JourneyStageId = string;

export type JourneyTrack = "builder" | "owner";

export type JourneyStage = {
  id: JourneyStageId;
  track: JourneyTrack;

  title: string;
  chapter: string;
  purpose: string;
  /** What Frassy is trying to understand and record in this stage. */
  objectives: string[];
  /** Memory category everything learned here is filed under. */
  category: string;
  /** Typical time, in minutes, across the full 8–10 hour journey. */
  minutes: number;
};

const BUILDER_STAGES_RAW: Omit<JourneyStage, "track">[] = [
  {
    id: "mission",
    title: "Discover your mission",
    chapter: "Foundation",
    purpose:
      "Understand who the Builder is and the deeper work they are here to do.",
    objectives: [
      "What the Builder is building, and why it matters to them",
      "The people they serve or want to serve",
      "The change they want to leave behind",
      "A mission statement written in the Builder's own words",
    ],
    category: "mission",
    minutes: 45,
  },
  {
    id: "goals",
    title: "Define your goals",
    chapter: "Foundation",
    purpose:
      "Translate the mission into horizons the operating system can support.",
    objectives: [
      "90-day goals",
      "One-year goals",
      "Long-horizon ambitions",
      "What success feels like, not just what it measures",
    ],
    category: "goals",
    minutes: 45,
  },
  {
    id: "identity",
    title: "Create your Builder Identity",
    chapter: "Identity",
    purpose:
      "Establish the lifelong root identity every district will recognize.",
    objectives: [
      "Builder name and handle",
      "How they want to be introduced",
      "Their craft, discipline, and current stage",
      "Voice and personality of their work",
    ],
    category: "identity",
    minutes: 40,
  },
  {
    id: "passport",
    title: "Build your Builder Passport",
    chapter: "Identity",
    purpose:
      "Record the history, skills, and proof a Builder carries across districts.",
    objectives: [
      "Skills and strengths",
      "Experience and past work worth carrying forward",
      "Credentials, recognitions, and milestones",
      "What the Builder wants to be trusted with",
    ],
    category: "passport",
    minutes: 45,
  },
  {
    id: "memory",
    title: "Configure Universal Memory",
    chapter: "Continuity",
    purpose:
      "Agree on what Frassy remembers, for how long, and who can ever see it.",
    objectives: [
      "What Frassy should always remember",
      "What should never be remembered",
      "Privacy boundaries and sharing preferences",
      "How the Builder wants memory used in daily work",
    ],
    category: "memory",
    minutes: 35,
  },
  {
    id: "vault",
    title: "Create your Builder Vault",
    chapter: "Continuity",
    purpose:
      "Set up the living knowledge vault where the Builder's work compounds.",
    objectives: [
      "The kinds of assets and knowledge they will store",
      "How they want their work organized",
      "What must be preserved for the long term",
      "First collections to create",
    ],
    category: "vault",
    minutes: 45,
  },
  {
    id: "districts",
    title: "Learn the districts",
    chapter: "Orientation",
    purpose:
      "Walk the Builder through the districts and where their work will live.",
    objectives: [
      "Welcome Hall, Creation, Opportunity, Academy, Community",
      "Foundation, Executive Tower, Marketplace, Vault",
      "Which districts matter most for them right now",
      "Which districts to leave quiet for later",
    ],
    category: "districts",
    minutes: 50,
  },
  {
    id: "preferences",
    title: "Configure your preferences",
    chapter: "Orientation",
    purpose:
      "Shape how Frass OS behaves so it protects the Builder's attention.",
    objectives: [
      "Working rhythm and best hours",
      "Notification and attention boundaries",
      "Communication tone from Frassy",
      "Accessibility and interface preferences",
    ],
    category: "preferences",
    minutes: 30,
  },
  {
    id: "workflows",
    title: "Build your first workflows",
    chapter: "Practice",
    purpose:
      "Turn intentions into the first real, running work inside the system.",
    objectives: [
      "The Builder's most important current intention",
      "The steps that intention actually requires",
      "Where each step lives across districts",
      "Two or three workflows they can start today",
    ],
    category: "workflows",
    minutes: 60,
  },
  {
    id: "organizations",
    title: "Connect your organizations",
    chapter: "Practice",
    purpose:
      "Bring the Builder's teams, brands, and collaborators into Frass OS.",
    objectives: [
      "Organizations, brands, or ventures they lead or belong to",
      "Collaborators and their roles",
      "What each organization is responsible for",
      "How leadership and stewardship are shared",
    ],
    category: "organizations",
    minutes: 45,
  },
  {
    id: "marketplace",
    title: "Configure the Marketplace",
    chapter: "Economy",
    purpose:
      "Prepare how the Builder offers value and earns through their work.",
    objectives: [
      "Products, services, or offers they bring",
      "Who they serve and how they price",
      "Reputation and trust they want to build",
      "First marketplace presence to set up",
    ],
    category: "marketplace",
    minutes: 45,
  },
  {
    id: "foundation",
    title: "Configure Foundation participation",
    chapter: "Economy",
    purpose: "Define how the Builder gives back through what they build.",
    objectives: [
      "Causes and communities they care about",
      "How they want to serve — time, craft, resources, mentorship",
      "The impact they want recorded",
      "Their first act of service",
    ],
    category: "foundation",
    minutes: 35,
  },
  {
    id: "frassy",
    title: "Learn how Frassy works",
    chapter: "Companion",
    purpose:
      "Teach the Builder how to work with their constitutional intelligence.",
    objectives: [
      "What Frassy can do across districts",
      "How to ask for reasoning, planning, and recall",
      "How permission, transparency, and correction work",
      "What Frassy will never do without permission",
    ],
    category: "frassy",
    minutes: 40,
  },
  {
    id: "welcome_hall",
    title: "Complete the Welcome Hall",
    chapter: "Arrival",
    purpose:
      "Close the journey by reflecting everything back and opening the doors.",
    objectives: [
      "Reflect the Builder's mission, identity, and plan back to them",
      "Confirm what Frassy now remembers",
      "Set the very next step",
      "Welcome them into Frass OS",
    ],
    category: "welcome_hall",
    minutes: 30,
  },
];

// ── The Owner Setup Journey ────────────────────────────────────────────────
// For the person who owns and operates the site itself (Frass Kicks).
// Frassy works as an operating partner: brand, catalog, money, policies,
// storefront, marketing, launch and daily running of the store.
const OWNER_STAGES_RAW: Omit<JourneyStage, "track">[] = [
  {
    id: "op_brand",
    title: "Lock the brand and the promise",
    chapter: "Store Foundation",
    purpose:
      "Agree on what the store is, who it serves, and the promise every page must keep.",
    objectives: [
      "What the store sells and what makes it unmistakably Frass",
      "Who the customer is and what they come here for",
      "The voice, tone, and look the site must hold",
      "The one-line promise the homepage has to make",
    ],
    category: "store_brand",
    minutes: 40,
  },
  {
    id: "op_catalog",
    title: "Set up your catalog",
    chapter: "Store Foundation",
    purpose:
      "Decide the collections, products, and drops the storefront will carry.",
    objectives: [
      "Collections and how the tree is organised",
      "Which products are live, which are coming",
      "Photography, sizing, and product copy standards",
      "The first drop and what it contains",
    ],
    category: "store_catalog",
    minutes: 60,
  },
  {
    id: "op_pricing",
    title: "Pricing, margins, and offers",
    chapter: "Money",
    purpose:
      "Make sure every sale actually makes money and every offer is deliberate.",
    objectives: [
      "Cost, price, and margin on each product family",
      "Discount rules and what is excluded",
      "Welcome offer and loyalty rewards",
      "Bundles, sale windows, and floor prices",
    ],
    category: "store_pricing",
    minutes: 45,
  },
  {
    id: "op_payments",
    title: "Payments, taxes, and payouts",
    chapter: "Money",
    purpose: "Confirm money can come in cleanly and reach your account.",
    objectives: [
      "How customers pay and which methods are on",
      "Currency, taxes, and where you collect",
      "Payout account and schedule",
      "A real test order, start to finish",
    ],
    category: "store_payments",
    minutes: 35,
  },
  {
    id: "op_fulfillment",
    title: "Shipping and fulfilment",
    chapter: "Operations",
    purpose: "Decide how an order becomes a package in a customer's hands.",
    objectives: [
      "Shipping zones, rates, and free-shipping thresholds",
      "Who packs and ships, and how fast",
      "Tracking and delivery communication",
      "Returns, exchanges, and lost parcels",
    ],
    category: "store_fulfillment",
    minutes: 45,
  },
  {
    id: "op_policies",
    title: "Policies and customer trust",
    chapter: "Operations",
    purpose: "Put the written promises in place before customers arrive.",
    objectives: [
      "Returns, refunds, and exchange policy in plain words",
      "Shipping and delivery policy",
      "Privacy and terms",
      "Contact and support expectations",
    ],
    category: "store_policies",
    minutes: 35,
  },
  {
    id: "op_storefront",
    title: "Storefront and pages",
    chapter: "Storefront",
    purpose: "Walk the site page by page and make each one earn its place.",
    objectives: [
      "Homepage, hero, and first impression",
      "Collection and product pages",
      "About, contact, and the Frass story",
      "Anything broken, empty, or off-brand",
    ],
    category: "store_storefront",
    minutes: 50,
  },
  {
    id: "op_marketing",
    title: "Marketing and launch plan",
    chapter: "Growth",
    purpose: "Decide how the first customers actually find the store.",
    objectives: [
      "Social channels and the content rhythm",
      "Email list and the welcome sequence",
      "Launch date and the run-up",
      "The first ten customers and how you reach them",
    ],
    category: "store_marketing",
    minutes: 50,
  },
  {
    id: "op_frassy",
    title: "Train Frassy for your customers",
    chapter: "Growth",
    purpose:
      "Teach Frassy how to greet, help, and sell on your behalf, in your voice.",
    objectives: [
      "How Frassy should greet a first-time visitor",
      "Answers to the questions customers ask most",
      "What Frassy must never say or promise",
      "When to hand a customer to you",
    ],
    category: "store_frassy",
    minutes: 40,
  },
  {
    id: "op_launch",
    title: "Launch readiness",
    chapter: "Launch",
    purpose: "Final walk-through, then open the doors with confidence.",
    objectives: [
      "Every link, card, and button checked",
      "A real test purchase completed",
      "What you watch in the first week",
      "Your daily and weekly running routine",
    ],
    category: "store_launch",
    minutes: 40,
  },
];

export const JOURNEY_STAGES: JourneyStage[] = BUILDER_STAGES_RAW.map((s) => ({
  ...s,
  track: "builder" as const,
}));

export const OWNER_STAGES: JourneyStage[] = OWNER_STAGES_RAW.map((s) => ({
  ...s,
  track: "owner" as const,
}));

export const ALL_STAGES: JourneyStage[] = [...JOURNEY_STAGES, ...OWNER_STAGES];

export const FIRST_STAGE: JourneyStageId = "mission";
export const FIRST_OWNER_STAGE: JourneyStageId = "op_brand";

export function trackOf(id: string): JourneyTrack {
  return id.startsWith("op_") ? "owner" : "builder";
}

export function stagesForTrack(track: JourneyTrack): JourneyStage[] {
  return track === "owner" ? OWNER_STAGES : JOURNEY_STAGES;
}

export function stagesFor(id: string): JourneyStage[] {
  return stagesForTrack(trackOf(id));
}

export function stageById(id: string): JourneyStage {
  return ALL_STAGES.find((s) => s.id === id) ?? JOURNEY_STAGES[0];
}

export function stageIndex(id: string): number {
  const i = stagesFor(id).findIndex((s) => s.id === id);
  return i < 0 ? 0 : i;
}

export function nextStage(id: string): JourneyStage | null {
  const list = stagesFor(id);
  return list[stageIndex(id) + 1] ?? null;
}

export function trackMinutes(track: JourneyTrack): number {
  return stagesForTrack(track).reduce((sum, s) => sum + s.minutes, 0);
}

export const TOTAL_JOURNEY_MINUTES = trackMinutes("builder");

