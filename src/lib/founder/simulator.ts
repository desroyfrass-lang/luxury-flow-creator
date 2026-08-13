// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0559 — Founder Experience Simulator.
// FRASS-0560 — Founder Preview Reset (every build begins at the front door).
// FRASS-0561 — Founder Seed Vaults (nothing created in Frass is ever practice).
//
// This is NOT a new admin view and NOT a second walkthrough engine. It reuses
// the FRASS-0519 session engine (founder_sessions / founder_observations): a
// simulation is a walkthrough with a persona attached and a fixed starting
// point — the public front door.
// ─────────────────────────────────────────────────────────────────────────────

export type PersonaId =
  | "first-time-visitor"
  | "beginner"
  | "tradesperson"
  | "business-builder"
  | "fashion-designer"
  | "musician"
  | "author"
  | "parent"
  | "first-partner"
  | "founder";

export type Persona = {
  id: PersonaId;
  emoji: string;
  label: string;
  /** Who this is, in one plain sentence. */
  plain: string;
  /** How the simulation should behave for this person. */
  behaviour: string[];
  /** Where the journey naturally leads after the front door. */
  destination: string;
  /** Part of the minimum release checklist. */
  required?: boolean;
};

export const PERSONAS: Persona[] = [
  {
    id: "first-time-visitor",
    emoji: "👩",
    label: "First-Time Visitor",
    plain: "A complete stranger who has never heard of Frass.",
    behaviour: [
      "Knows nothing. Reads everything.",
      "Leaves if the first screen doesn't explain itself.",
      "Should never be asked to sign in before being welcomed.",
    ],
    destination: "/frass-district",
    required: true,
  },
  {
    id: "beginner",
    emoji: "👵",
    label: "Beginner",
    plain: "Someone new to technology who needs everything explained twice.",
    behaviour: [
      "Prefers Simplified View.",
      "Moves slowly; one action at a time.",
      "Needs plain English and an analogy for every term.",
    ],
    destination: "/room",
    required: true,
  },
  {
    id: "tradesperson",
    emoji: "👷",
    label: "Tradesperson",
    plain: "Decades of hands-on skill, no digital business yet.",
    behaviour: [
      "Digital-first Money Moves.",
      "Knowledge products before labour.",
      "Legacy building matters more than speed.",
    ],
    destination: "/business-vaults",
    required: true,
  },
  {
    id: "business-builder",
    emoji: "👩‍💼",
    label: "Business Builder",
    plain: "Moves fast, accepts challenges, wants advanced tools.",
    behaviour: [
      "Skips explanations.",
      "Expects numbers, deadlines and next actions.",
      "Uses advanced features immediately.",
    ],
    destination: "/business-builder",
  },
  {
    id: "fashion-designer",
    emoji: "🎨",
    label: "Fashion Designer",
    plain: "A maker who wants to produce and sell what they design.",
    behaviour: ["Visual first.", "Cares about manufacturing and margins.", "Wants a storefront quickly."],
    destination: "/manufacturing",
  },
  {
    id: "musician",
    emoji: "🎵",
    label: "Musician",
    plain: "A creator with catalogue, rights and an audience.",
    behaviour: ["Cares about ownership and credits.", "Wants distribution, not lessons."],
    destination: "/music-media",
  },
  {
    id: "author",
    emoji: "📚",
    label: "Author",
    plain: "Someone with a lifetime of knowledge to publish.",
    behaviour: ["Journey becomes a book.", "Frassy edits, never authors.", "Needs the Author Vault."],
    destination: "/vault",
  },
  {
    id: "parent",
    emoji: "🧒",
    label: "Parent / Kids World",
    plain: "A parent checking whether Frass is safe for a child.",
    behaviour: [
      "Safety by absence — no Frassy, no chat in children's spaces.",
      "Looks for what is NOT there as much as what is.",
    ],
    destination: "/frass-street",
  },
  {
    id: "first-partner",
    emoji: "👥",
    label: "First Partner",
    plain: "One of the first people invited to build on Frass Hill.",
    behaviour: ["Expects a personal Daily.", "Needs the First Week Promise honoured."],
    destination: "/first-30-days",
  },
  {
    id: "founder",
    emoji: "🏢",
    label: "Founder",
    plain: "You, with full administrative tools.",
    behaviour: ["Everything visible.", "Command Center reachable.", "Nothing hidden."],
    destination: "/command",
    required: true,
  },
];

export function personaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

/** FRASS-0560 — the official Founder testing sequence. Always starts outside. */
export const TESTING_SEQUENCE: Array<{ id: string; label: string; path: string; plain: string }> = [
  { id: "landing", label: "FrassKicks.com", path: "/", plain: "The public front door. Exactly what a stranger sees." },
  { id: "welcome", label: "Welcome Hall", path: "/welcome", plain: "The official introduction to Frassy." },
  { id: "conversation", label: "First Frassy conversation", path: "/frassy", plain: "Greeting, direction, confidence." },
  { id: "district", label: "District selection", path: "/frass-hill", plain: "Frass District or Frass Hill — an intentional choice." },
];

/** Later stages a Founder may jump to on purpose. Default is always Step 1. */
export const JOURNEY_STAGES: Array<{ id: string; label: string; path: string; plain: string }> = [
  { id: "day-1", label: "Day 1", path: "/onboarding", plain: "Arrival and first Daily." },
  { id: "day-7", label: "Day 7", path: "/room", plain: "A week in — does momentum hold?" },
  { id: "day-30", label: "Day 30", path: "/first-30-days", plain: "The end of the launch programme." },
  { id: "first-sale", label: "First sale", path: "/money-moves", plain: "The first money that ever arrived." },
  { id: "first-vault", label: "First Vault complete", path: "/business-vaults", plain: "A finished business pathway." },
  { id: "first-book", label: "First e-book", path: "/vault", plain: "A journey turned into a published book." },
  { id: "first-order", label: "First manufacturing order", path: "/manufacturing", plain: "A design that became a product." },
];

/** FRASS-0559 — the Founder's observation lenses during a simulation. */
export const SIM_LENSES: Array<{
  id: string;
  emoji: string;
  label: string;
  kind: "bug" | "improvement" | "amendment" | "idea";
  signal: "smooth" | "neutral" | "confusing" | "blocked";
}> = [
  { id: "bug", emoji: "🐞", label: "Bug", kind: "bug", signal: "blocked" },
  { id: "improvement", emoji: "💡", label: "Improvement", kind: "improvement", signal: "neutral" },
  { id: "loved", emoji: "❤️", label: "Loved this", kind: "idea", signal: "smooth" },
  { id: "confusing", emoji: "🤔", label: "Confusing", kind: "improvement", signal: "confusing" },
  { id: "simplify", emoji: "⚠", label: "Needs simplification", kind: "amendment", signal: "confusing" },
];

/** The five questions Frassy asks when a simulation ends. Stored as the session checklist. */
export const SUCCESS_QUESTIONS: Array<{ id: string; question: string; scores: ScoreKey }> = [
  { id: "welcoming", question: "Did this feel welcoming?", scores: "welcome" },
  { id: "no-confusion", question: "Was everything clear — nothing confused you?", scores: "clarity" },
  { id: "next-step", question: "Did you always know what to do next?", scores: "navigation" },
  { id: "frassy-helped", question: "Did Frassy help enough?", scores: "conversation" },
  { id: "would-invite", question: "Would you invite someone else to try this?", scores: "confidence" },
];

export type ScoreKey = "welcome" | "clarity" | "conversation" | "navigation" | "confidence";

export const SCORE_LABELS: Record<ScoreKey, string> = {
  welcome: "Welcome",
  clarity: "Clarity",
  conversation: "Conversation",
  navigation: "Navigation",
  confidence: "Confidence",
};

export type ScoredObservation = { kind: string; signal: string; note: string };

export type ExperienceScore = {
  scores: Record<ScoreKey, number>;
  overall: number;
  weakest: ScoreKey;
  summary: string;
};

/**
 * FRASS-0559 — turn a walkthrough into a Founder Experience Score out of 10.
 * Answers set the baseline; recorded observations move it, so a gut feeling
 * can never outvote something the Founder actually saw go wrong.
 */
export function buildExperienceScore(
  answers: Record<string, boolean>,
  observations: ScoredObservation[],
): ExperienceScore {
  const scores: Record<ScoreKey, number> = {
    welcome: 7,
    clarity: 7,
    conversation: 7,
    navigation: 7,
    confidence: 7,
  };

  for (const q of SUCCESS_QUESTIONS) {
    scores[q.scores] = answers[q.id] ? 9.5 : 5;
  }

  const hits = (re: RegExp) =>
    observations.filter((o) => re.test(o.note)).length;

  const penalise = (key: ScoreKey, amount: number) => {
    scores[key] = Math.max(1, Math.round((scores[key] - amount) * 10) / 10);
  };

  penalise("navigation", Math.min(3, hits(/navigat|menu|link|route|404|find|lost|where/i) * 0.7));
  penalise("clarity", Math.min(3, observations.filter((o) => o.signal === "confusing").length * 0.7));
  penalise("conversation", Math.min(3, hits(/frassy|voice|conversation|chat|reply/i) * 0.5));
  penalise("welcome", Math.min(3, hits(/welcome|landing|first|arrival|greet/i) * 0.5));
  penalise(
    "confidence",
    Math.min(4, observations.filter((o) => o.kind === "bug" || o.signal === "blocked").length * 1),
  );

  const keys = Object.keys(scores) as ScoreKey[];
  const overall = Math.round((keys.reduce((s, k) => s + scores[k], 0) / keys.length) * 10) / 10;
  const weakest = keys.reduce((a, b) => (scores[a] <= scores[b] ? a : b));

  const why: Record<ScoreKey, string> = {
    welcome: "New members don't feel greeted before they're asked to act.",
    clarity: "Something on the way through is explained in words a beginner wouldn't use.",
    conversation: "Frassy isn't carrying enough of the journey — people are left to work it out alone.",
    navigation: "New members hesitate after the Welcome Hall because they're unsure where to go next.",
    confidence: "Something broke or blocked the way through, and that's what people remember.",
  };

  return {
    scores,
    overall,
    weakest,
    summary: `Your biggest opportunity is ${SCORE_LABELS[weakest].toLowerCase()}. ${why[weakest]}`,
  };
}

/* ── Simulation state (this device only) ──────────────────────────────────── */

const SIM_KEY = "frass.founder.simulation";
const RESET_KEY = "frass.founder.previewReset";
const BUILD_KEY = "frass.founder.buildStamp";

export type SimulationState = {
  personaId: PersonaId;
  sessionId: string | null;
  startedAt: string;
  stage: string;
};

export function loadSimulation(): SimulationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SIM_KEY);
    return raw ? (JSON.parse(raw) as SimulationState) : null;
  } catch {
    return null;
  }
}

export function saveSimulation(state: SimulationState | null) {
  if (typeof window === "undefined") return;
  try {
    if (state) window.localStorage.setItem(SIM_KEY, JSON.stringify(state));
    else window.localStorage.removeItem(SIM_KEY);
  } catch {
    /* storage blocked — the simulation still runs for this session */
  }
}

/**
 * FRASS-0559 — Reset Simulation. Clears the member-shaped local state a
 * simulation touches (tours, dismissals, view mode, drafts) WITHOUT touching
 * anything the Founder created: Seed Vaults, notes and sessions are permanent
 * (FRASS-0561).
 */
const PRESERVE = ["frass.founder.notes", RESET_KEY, BUILD_KEY];

export function resetSimulationState() {
  if (typeof window === "undefined") return;
  try {
    const keep = new Map(PRESERVE.map((k) => [k, window.localStorage.getItem(k)]));
    window.localStorage.clear();
    window.sessionStorage.clear();
    for (const [k, v] of keep) if (v !== null) window.localStorage.setItem(k, v);
  } catch {
    /* nothing to clear */
  }
}

/* ── FRASS-0560 — Founder Preview Reset ───────────────────────────────────── */

export function previewResetEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(RESET_KEY) !== "off";
}

export function setPreviewResetEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESET_KEY, on ? "on" : "off");
}

/**
 * True exactly once per new build: the running build stamp differs from the
 * last one this device saw. Used to return the Founder to the front door.
 */
export function isNewBuild(stamp: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const seen = window.localStorage.getItem(BUILD_KEY);
    if (seen === stamp) return false;
    window.localStorage.setItem(BUILD_KEY, stamp);
    return seen !== null; // first ever visit is not a "new build"
  } catch {
    return false;
  }
}

/** FRASS-0561 — the language Frass uses for anything a Founder creates. */
export const SEED_VAULT_PRINCIPLE =
  "Nothing created in Frass is ever practice. Every Vault you create while testing is a Founder Seed Vault — a real asset you own, which can become a course, a book, a Builder Path or a business.";
