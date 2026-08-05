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

export const FIRST_STAGE: JourneyStageId = "mission";

export function stageById(id: string): JourneyStage {
  return JOURNEY_STAGES.find((s) => s.id === id) ?? JOURNEY_STAGES[0];
}

export function stageIndex(id: string): number {
  const i = JOURNEY_STAGES.findIndex((s) => s.id === id);
  return i < 0 ? 0 : i;
}

export function nextStage(id: string): JourneyStage | null {
  const i = stageIndex(id);
  return JOURNEY_STAGES[i + 1] ?? null;
}

export const TOTAL_JOURNEY_MINUTES = JOURNEY_STAGES.reduce(
  (sum, s) => sum + s.minutes,
  0,
);
