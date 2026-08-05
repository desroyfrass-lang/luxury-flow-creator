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

// ── The Founder Commissioning Journey ─────────────────────────────────────
// Not a setup checklist. This is the Founder commissioning Frass OS itself:
// the place Builders will one day enter. Five phases, then launch readiness.
const OWNER_STAGES_RAW: Omit<JourneyStage, "track">[] = [
  {
    id: "op_brand_name",
    title: "Name the platform",
    chapter: "Phase 1 · Platform Identity",
    purpose:
      "Settle the name, the mark, and how Frass introduces itself to the world.",
    objectives: [
      "The platform name and how it is written",
      "What Frass means and where it comes from",
      "The mark, wordmark, and where each is used",
      "How Frass is introduced in one sentence",
    ],
    category: "platform_identity",
    minutes: 25,
  },
  {
    id: "op_mission",
    title: "Declare the mission",
    chapter: "Phase 1 · Platform Identity",
    purpose:
      "Put into words why Frass exists and what it is here to change.",
    objectives: [
      "Why Frass exists",
      "Who it exists for",
      "The change it is here to make",
      "The mission in the Founder's own words",
    ],
    category: "platform_identity",
    minutes: 30,
  },
  {
    id: "op_vision",
    title: "Cast the vision",
    chapter: "Phase 1 · Platform Identity",
    purpose:
      "Describe the world Frass is building toward over the long horizon.",
    objectives: [
      "What Frass looks like in five years",
      "What Builders will be able to do that they cannot today",
      "What success looks like beyond revenue",
      "The legacy Frass should leave",
    ],
    category: "platform_identity",
    minutes: 25,
  },
  {
    id: "op_values",
    title: "Set the core values",
    chapter: "Phase 1 · Platform Identity",
    purpose:
      "Name the principles every district and every decision must honour.",
    objectives: [
      "The non-negotiable values",
      "How each value shows up in the product",
      "What Frass will refuse to do",
      "How a value is applied when two conflict",
    ],
    category: "platform_identity",
    minutes: 30,
  },
  {
    id: "op_voice",
    title: "Define voice and personality",
    chapter: "Phase 1 · Platform Identity",
    purpose:
      "Shape how Frass and Frassy speak to everyone who arrives.",
    objectives: [
      "The tone Frass holds — warmth, refinement, wit",
      "Words and phrases Frass uses and avoids",
      "How Frassy speaks to a Builder versus a customer",
      "What Frassy must never say",
    ],
    category: "platform_identity",
    minutes: 30,
  },
  {
    id: "op_founder_profile",
    title: "Establish the Founder profile",
    chapter: "Phase 1 · Platform Identity",
    purpose:
      "Record who the Founder is and how they appear across the platform.",
    objectives: [
      "Founder name, handle, and how they are introduced",
      "The Founder's story and why they built this",
      "What the Founder personally stands behind",
      "How and where the Founder appears publicly",
    ],
    category: "platform_identity",
    minutes: 25,
  },
  {
    id: "op_products",
    title: "Commission the products",
    chapter: "Phase 2 · Commerce Foundation",
    purpose:
      "Decide what Frass sells and the standard every product must meet.",
    objectives: [
      "The product families and what makes each Frass",
      "Which products are live, which are coming",
      "Photography, sizing, and copy standards",
      "The first drop and what it contains",
    ],
    category: "commerce",
    minutes: 40,
  },
  {
    id: "op_collections",
    title: "Organise the collections",
    chapter: "Phase 2 · Commerce Foundation",
    purpose:
      "Structure the catalog so anyone can find their way.",
    objectives: [
      "Collections and the shape of the tree",
      "How a product is assigned to a collection",
      "Which collections are featured, which are quiet",
      "Seasonal and drop-based collections",
    ],
    category: "commerce",
    minutes: 30,
  },
  {
    id: "op_pricing",
    title: "Set pricing and offers",
    chapter: "Phase 2 · Commerce Foundation",
    purpose:
      "Make sure every sale makes money and every offer is deliberate.",
    objectives: [
      "Cost, price, and margin per product family",
      "Discount rules and what is excluded",
      "Welcome offer and loyalty rewards",
      "Bundles, sale windows, and floor prices",
    ],
    category: "commerce",
    minutes: 35,
  },
  {
    id: "op_payments",
    title: "Open payments",
    chapter: "Phase 2 · Commerce Foundation",
    purpose:
      "Confirm money can come in cleanly and reach the right account.",
    objectives: [
      "How customers pay and which methods are on",
      "Currency and where you sell",
      "Payout account and schedule",
      "A real test order, start to finish",
    ],
    category: "commerce",
    minutes: 30,
  },
  {
    id: "op_shipping",
    title: "Commission shipping",
    chapter: "Phase 2 · Commerce Foundation",
    purpose:
      "Decide how an order becomes a package in someone's hands.",
    objectives: [
      "Shipping zones, rates, and free-shipping thresholds",
      "Who packs and ships, and how fast",
      "Tracking and delivery communication",
      "Returns, exchanges, and lost parcels",
    ],
    category: "commerce",
    minutes: 35,
  },
  {
    id: "op_policies",
    title: "Write the policies",
    chapter: "Phase 2 · Commerce Foundation",
    purpose:
      "Put the written promises in place before anyone arrives.",
    objectives: [
      "Returns, refunds, and exchanges in plain words",
      "Shipping and delivery policy",
      "Privacy and terms",
      "Contact and support expectations",
    ],
    category: "commerce",
    minutes: 30,
  },
  {
    id: "op_taxes",
    title: "Settle taxes",
    chapter: "Phase 2 · Commerce Foundation",
    purpose:
      "Handle the tax position properly, or record that it does not yet apply.",
    objectives: [
      "Where you are registered and where you collect",
      "Whether prices include tax",
      "Records you need to keep",
      "Whether this applies yet at all",
    ],
    category: "commerce",
    minutes: 20,
  },
  {
    id: "op_builder_journey",
    title: "Review the Builder Journey",
    chapter: "Phase 3 · Builder Experience",
    purpose:
      "Walk the journey a Builder takes and approve it as Founder.",
    objectives: [
      "Whether the chapters are the right ones",
      "What Frassy must always ask a new Builder",
      "Where the journey should go deeper or lighter",
      "What a Builder should feel when it ends",
    ],
    category: "builder_experience",
    minutes: 35,
  },
  {
    id: "op_welcome_hall",
    title: "Configure the Welcome Hall",
    chapter: "Phase 3 · Builder Experience",
    purpose:
      "Decide what greets a Builder the moment they arrive.",
    objectives: [
      "What the Welcome Hall shows first",
      "Which districts are open on day one",
      "The first action a Builder is invited to take",
      "The words that welcome them",
    ],
    category: "builder_experience",
    minutes: 25,
  },
  {
    id: "op_builder_paths",
    title: "Configure Builder Paths",
    chapter: "Phase 3 · Builder Experience",
    purpose:
      "Approve the identities a Builder can grow into inside the Academy.",
    objectives: [
      "Which Builder Paths exist",
      "What each path produces",
      "How Frassy recommends a path",
      "Which paths are featured first",
    ],
    category: "builder_experience",
    minutes: 30,
  },
  {
    id: "op_passport",
    title: "Configure the Builder Passport",
    chapter: "Phase 3 · Builder Experience",
    purpose:
      "Decide what a Builder carries with them across every district.",
    objectives: [
      "What the Passport records",
      "Which achievements are recognised",
      "What is public and what stays private",
      "How the Passport grows over a lifetime",
    ],
    category: "builder_experience",
    minutes: 25,
  },
  {
    id: "op_vault_defaults",
    title: "Set Builder Vault defaults",
    chapter: "Phase 3 · Builder Experience",
    purpose:
      "Establish how every Builder's knowledge is organised from day one.",
    objectives: [
      "Default collections every Vault begins with",
      "What Frassy files automatically",
      "Privacy defaults and sharing rules",
      "What must be preserved for the long term",
    ],
    category: "builder_experience",
    minutes: 25,
  },
  {
    id: "op_frassy_config",
    title: "Configure Frassy's guidance",
    chapter: "Phase 3 · Builder Experience",
    purpose:
      "Set how Frassy mentors, intervenes, and steps back.",
    objectives: [
      "When Frassy speaks first and when she waits",
      "How direct her guidance should be",
      "What she needs permission to do",
      "When she hands a person to a human",
    ],
    category: "builder_experience",
    minutes: 30,
  },
  {
    id: "op_marketplace",
    title: "Marketplace settings",
    chapter: "Phase 4 · Platform Operations",
    purpose:
      "Decide how value is offered and earned inside Frass.",
    objectives: [
      "Who may sell and what may be listed",
      "Fees, commissions, and payouts",
      "Reputation and review rules",
      "How disputes are handled",
    ],
    category: "platform_ops",
    minutes: 30,
  },
  {
    id: "op_community",
    title: "Community settings",
    chapter: "Phase 4 · Platform Operations",
    purpose:
      "Set the conditions for a healthy Builder society.",
    objectives: [
      "Who may post and who may join circles",
      "Moderation standards and enforcement",
      "How collaboration is initiated",
      "What community stewardship looks like",
    ],
    category: "platform_ops",
    minutes: 25,
  },
  {
    id: "op_foundation",
    title: "Foundation settings",
    chapter: "Phase 4 · Platform Operations",
    purpose:
      "Define how Frass gives back through what is built.",
    objectives: [
      "Causes Frass stands behind",
      "How Builders contribute — time, craft, resources",
      "What impact is recorded and reported",
      "The first act of service",
    ],
    category: "platform_ops",
    minutes: 25,
  },
  {
    id: "op_notifications",
    title: "Notification and attention rules",
    chapter: "Phase 4 · Platform Operations",
    purpose:
      "Protect attention as the platform grows louder.",
    objectives: [
      "What is worth interrupting a Builder for",
      "What waits for a digest",
      "Default quiet hours",
      "What a Builder can always turn off",
    ],
    category: "platform_ops",
    minutes: 20,
  },
  {
    id: "op_roles",
    title: "Admin roles and delegation",
    chapter: "Phase 4 · Platform Operations",
    purpose:
      "Decide who can operate Frass alongside the Founder.",
    objectives: [
      "Which roles exist and what each may do",
      "Who currently holds each role",
      "How access is granted and revoked",
      "What only the Founder may ever do",
    ],
    category: "platform_ops",
    minutes: 25,
  },
  {
    id: "op_security",
    title: "Security review",
    chapter: "Phase 4 · Platform Operations",
    purpose:
      "Confirm the platform protects the people inside it.",
    objectives: [
      "Who can reach which data",
      "Sign-in protection and account recovery",
      "What is logged and reviewed",
      "What happens if something goes wrong",
    ],
    category: "platform_ops",
    minutes: 30,
  },
  {
    id: "op_launch",
    title: "Commission the launch",
    chapter: "Phase 5 · Launch Readiness",
    purpose:
      "Walk the readiness board, close the gaps, and open the doors.",
    objectives: [
      "Every readiness item reviewed together",
      "Anything still In Progress or Not Started",
      "A real end-to-end test by the Founder",
      "The first week of operating routine",
    ],
    category: "launch",
    minutes: 45,
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

