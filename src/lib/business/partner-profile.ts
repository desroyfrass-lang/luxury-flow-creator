// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0482 — Partner Daily Intelligence · Personalized Money Moves
//
// This is NOT another onboarding and NOT another Daily. It is a discovery
// layer that sits UNDER the systems that already exist:
//
//   Daily (workspace/daily.ts) · Money Moves (money-moves.ts) ·
//   Business Builder (accelerator.ts) · Business Vaults (future-vaults.ts) ·
//   Welcome Hall · FOR ME · Frassy chat context
//
// Founder Principle (locked):
//   "Frass should discover the business already inside the person — not force
//    the person into a business."
//
// Frassy's greatest talent is not giving people business ideas. It is finding
// the value they already possess and building a business around it. Most
// people believe they have "no business ideas" while carrying decades of
// knowledge, certifications, discipline and credibility.
//
// The profile lives on the member's device. It carries personal life detail,
// so it is never uploaded, never used for scoring, and can be erased in one tap.
// ─────────────────────────────────────────────────────────────────────────────

export const FOUNDER_PRINCIPLE =
  "Frass should discover the business already inside the person — not force the person into a business.";

export const PLAIN_ENGLISH =
  "What this means in plain English: before Frassy hands you any work, she asks about your life — what you know, what you're certified in, what people already come to you for. Then your daily tasks are built from that, not from a template someone else uses.";

// ── Hidden assets ────────────────────────────────────────────────────────────
// Each asset is something a person already has. Every one of them maps to
// businesses that already exist inside Frass — nothing new is invented here.

export type HiddenAsset = {
  id: string;
  emoji: string;
  label: string;
  /** Plain-English proof that this is worth money. */
  worth: string;
  /** Existing Business Builder journeys this strengthens (accelerator ids). */
  businesses: string[];
  /** Business shapes Frassy can suggest — all built with existing surfaces. */
  opportunities: string[];
};

export const HIDDEN_ASSETS: HiddenAsset[] = [
  {
    id: "wellness",
    emoji: "🌿",
    label: "Health & wellness knowledge",
    worth: "People pay for guidance they trust with their body. You already have the answers they search for.",
    businesses: ["wellness", "faceless", "podcast", "affiliate"],
    opportunities: [
      "Wellness education",
      "Healthy aging guidance",
      "Natural wellness guides",
      "Herbal knowledge series",
      "Wellness products",
    ],
  },
  {
    id: "esthetics",
    emoji: "🧴",
    label: "Esthetics / skincare",
    worth: "A certification is credibility you already paid for. It turns advice into a paid service.",
    businesses: ["wellness", "faceless", "affiliate"],
    opportunities: [
      "Skin education content",
      "Esthetics consultations",
      "Product recommendation guides",
      "Routine-building downloads",
    ],
  },
  {
    id: "fitness",
    emoji: "🏋️",
    label: "Fitness & movement",
    worth: "Discipline is a product. People buy the structure you already live by.",
    businesses: ["wellness", "faceless", "podcast"],
    opportunities: [
      "Fitness coaching",
      "A walking community",
      "Simple at-home routines",
      "Accountability group",
    ],
  },
  {
    id: "cooking",
    emoji: "🍲",
    label: "Cooking & food",
    worth: "Food travels further than any advert. Every plate is content and a product.",
    businesses: ["faceless", "wellness", "affiliate"],
    opportunities: ["Recipe collections", "Meal-prep guides", "Cooking videos", "Kitchen product picks"],
  },
  {
    id: "style",
    emoji: "👗",
    label: "Style, fashion & thrifting",
    worth: "An eye for a good piece is inventory intelligence — the hardest part of resale.",
    businesses: ["coco-vintage", "faceless", "affiliate"],
    opportunities: ["Curated collections", "Styling sessions", "Thrift-find content", "Seasonal drops"],
  },
  {
    id: "teaching",
    emoji: "🎓",
    label: "Teaching & explaining",
    worth: "If people understand you, they'll follow you. Teaching is the fastest route to authority.",
    businesses: ["podcast", "faceless", "affiliate"],
    opportunities: ["Short lessons", "Workshops", "Downloadable guides", "Podcast conversations"],
  },
  {
    id: "care",
    emoji: "💛",
    label: "Caring for people",
    worth: "Trust is the scarcest thing online. Years of caring for people is trust already earned.",
    businesses: ["wellness", "podcast"],
    opportunities: ["Family wellness guidance", "Caregiver support content", "Community circle"],
  },
  {
    id: "craft",
    emoji: "🧵",
    label: "Making things by hand",
    worth: "Handmade carries a price premium machines can't touch.",
    businesses: ["coco-vintage", "faceless"],
    opportunities: ["Small-batch products", "Made-to-order pieces", "Process videos"],
  },
  {
    id: "logistics",
    emoji: "🌍",
    label: "Freight, logistics & coordination",
    worth: "Knowing how goods actually move is rare knowledge, and businesses pay for it.",
    businesses: ["affiliate"],
    opportunities: [
      "Freight brokerage & logistics coordination",
      "Shipping guidance for small businesses",
      "Customs paperwork help",
    ],
  },
  {
    id: "music",
    emoji: "🎧",
    label: "Music, audio & performance",
    worth: "Attention is the asset. Audio holds it longer than anything else.",
    businesses: ["podcast", "faceless"],
    opportunities: ["Podcast", "Audio series", "Live sessions"],
  },
  {
    id: "photo",
    emoji: "📸",
    label: "Photography & video",
    worth: "Every other business here needs images. Yours is a service and a product at once.",
    businesses: ["faceless", "coco-vintage"],
    opportunities: ["Content packages", "Product photography", "Short-form video"],
  },
  {
    id: "writing",
    emoji: "✍️",
    label: "Writing & storytelling",
    worth: "Words are the cheapest inventory in the world and they sell everything else.",
    businesses: ["affiliate", "faceless", "podcast"],
    opportunities: ["Honest reviews", "Newsletters", "Guides", "Brand stories"],
  },
  {
    id: "selling",
    emoji: "🤝",
    label: "Selling & dealing with people",
    worth: "Most builders can make something and can't sell it. You start ahead.",
    businesses: ["affiliate", "coco-vintage", "wellness"],
    opportunities: ["Affiliate partnerships", "Consultations", "Referral network"],
  },
  {
    id: "faith",
    emoji: "🕊",
    label: "Community & faith leadership",
    worth: "You already gather people. Gathering is the hardest part of any audience.",
    businesses: ["podcast", "faceless"],
    opportunities: ["Encouragement series", "Community events", "Conversation podcast"],
  },
  {
    id: "garden",
    emoji: "🪴",
    label: "Gardening & plants",
    worth: "Growing things is a skill with buyers, students and content built in.",
    businesses: ["wellness", "faceless", "affiliate"],
    opportunities: ["Growing guides", "Herbal knowledge", "Plant care content"],
  },
  {
    id: "tech",
    emoji: "💻",
    label: "Tech & digital work",
    worth: "You can build faster than most — so your businesses can be more ambitious.",
    businesses: ["faceless", "affiliate", "coco-vintage"],
    opportunities: ["Digital products", "Automation", "Content systems"],
  },
];

export function assetById(id: string): HiddenAsset | undefined {
  return HIDDEN_ASSETS.find((a) => a.id === id);
}

// ── The discovery conversation ───────────────────────────────────────────────
// A conversation, never a questionnaire. One question at a time, in Frassy's
// voice, always skippable.

export type InterviewQuestion = {
  id: keyof PartnerAnswers;
  /** Frassy's line — spoken, warm, one question only. */
  ask: string;
  helper?: string;
  kind: "assets" | "text" | "hours" | "goal" | "comfort";
  /** Suggestions offered as taps, so nobody has to type an essay. */
  chips?: string[];
};

export type PartnerAnswers = {
  enjoy: string;
  learned: string;
  work: string;
  certifications: string;
  askedFor: string;
  neverAgain: string;
};

export const INTERVIEW: InterviewQuestion[] = [
  {
    id: "enjoy",
    ask: "Before I give you a single task — tell me what you actually enjoy doing. Not work. The thing you'd do on a free afternoon.",
    helper: "One line is plenty. I'll do the thinking.",
    kind: "assets",
  },
  {
    id: "learned",
    ask: "What have you spent years learning, even if nobody paid you for it?",
    helper: "Years of knowing something is an asset, whether it came with a certificate or not.",
    kind: "text",
    chips: ["Wellness", "Cooking", "Fashion", "Raising children", "Faith", "Trades", "Business"],
  },
  {
    id: "work",
    ask: "And what work have you done over the years?",
    helper: "Every job leaves knowledge behind. I'm listening for the part that's still worth money.",
    kind: "text",
  },
  {
    id: "certifications",
    ask: "Do you hold any certifications or training? Anything official at all.",
    helper: "A certificate is credibility you already paid for — I build on it first.",
    kind: "text",
    chips: ["Esthetician", "Fitness trainer", "Nursing / care", "Food handling", "Trade licence", "None yet"],
  },
  {
    id: "askedFor",
    ask: "What do people always come to you for help with?",
    helper: "This one usually reveals the business. People are already choosing you for something.",
    kind: "text",
  },
  {
    id: "neverAgain",
    ask: "Last honest one — what kind of work do you never want to do again?",
    helper: "I'll keep it off your Daily. Promise.",
    kind: "text",
  },
];

export const HOURS_QUESTION =
  "Realistically, how much time can you give this each day? Be honest — I'd rather plan small and true.";
export const GOAL_QUESTION = "And what would this need to earn each month for it to matter to you?";
export const COMFORT_QUESTION = "How would you like me to explain things?";

// ── Profile ──────────────────────────────────────────────────────────────────

export type Comfort = "plain" | "standard";

export type PartnerProfile = {
  version: 1;
  /** Hidden asset ids the member confirmed. */
  assets: string[];
  answers: Partial<PartnerAnswers>;
  hoursPerDay: number;
  monthlyGoal: number;
  comfort: Comfort;
  completedAt: string | null;
  updatedAt: string;
};

export const EMPTY_PROFILE: PartnerProfile = {
  version: 1,
  assets: [],
  answers: {},
  hoursPerDay: 1,
  monthlyGoal: 0,
  comfort: "plain",
  completedAt: null,
  updatedAt: "",
};

const KEY = "frass.partner.profile";

export function loadProfile(): PartnerProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw) as Partial<PartnerProfile>;
    return {
      ...EMPTY_PROFILE,
      ...parsed,
      assets: Array.isArray(parsed.assets) ? parsed.assets.filter((a) => !!assetById(a)) : [],
      answers: (parsed.answers ?? {}) as Partial<PartnerAnswers>,
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveProfile(profile: PartnerProfile): PartnerProfile {
  const next = { ...profile, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — the profile simply stays in memory */
    }
  }
  return next;
}

export function forgetProfile(): PartnerProfile {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
  return EMPTY_PROFILE;
}

export function profileComplete(p: PartnerProfile): boolean {
  return !!p.completedAt && p.assets.length > 0;
}

// ── Reading hidden assets out of plain speech ────────────────────────────────
// People rarely name their asset. They describe their life. This listens for
// the life and names the asset back to them.

const HINTS: Record<string, RegExp> = {
  wellness: /wellness|health|healing|nutrition|vitamin|natural|holistic|wellbeing|diet/i,
  esthetics: /esthetic|aesthetic|skin|facial|beauty|cosmet|spa|nail|lash/i,
  fitness: /fitness|train|gym|walk|exercise|yoga|workout|coach|athlet|run/i,
  cooking: /cook|food|bake|recipe|kitchen|chef|meal|cater/i,
  style: /fashion|style|cloth|thrift|vintage|dress|outfit|sew|tailor/i,
  teaching: /teach|tutor|lectur|explain|school|educat|train/i,
  care: /care|nurse|caregiv|elder|children|mother|family|support|counsel/i,
  craft: /craft|handmade|knit|crochet|wood|jewel|art|paint|pottery/i,
  logistics: /freight|logistic|ship|truck|broker|customs|warehouse|dispatch|barrel/i,
  music: /music|sing|dj|instrument|audio|sound|perform/i,
  photo: /photo|camera|video|film|edit|shoot/i,
  writing: /writ|blog|poem|story|journal|author|copy/i,
  selling: /sell|sales|market|retail|negotiat|customer|shop|vendor/i,
  faith: /faith|church|pastor|community|volunteer|charity|ministry/i,
  garden: /garden|plant|farm|herb|grow|soil|bush/i,
  tech: /tech|comput|code|software|digital|IT|website|app/i,
};

/** Names the assets hiding inside anything the member said. */
export function detectAssets(text: string): string[] {
  const found: string[] = [];
  for (const [id, re] of Object.entries(HINTS)) {
    if (re.test(text)) found.push(id);
  }
  return found;
}

/** Everything said across the whole conversation, read at once. */
export function detectFromAnswers(answers: Partial<PartnerAnswers>): string[] {
  const text = Object.values(answers).filter(Boolean).join(" \n ");
  return detectAssets(text);
}

// ── Personalized business fit ────────────────────────────────────────────────

export type BusinessFit = {
  businessId: string;
  score: number;
  /** Why Frassy chose it — always traced back to the member's own words. */
  why: string;
  assets: HiddenAsset[];
  opportunities: string[];
};

/**
 * Ranks the Business Builder journeys that already exist against what the
 * member actually carries. No new business catalogue, no generic template.
 */
export function businessFits(profile: PartnerProfile): BusinessFit[] {
  const chosen = profile.assets.map(assetById).filter(Boolean) as HiddenAsset[];
  const tally = new Map<string, { score: number; assets: HiddenAsset[] }>();
  chosen.forEach((asset, index) => {
    // Earlier-named assets count for more — people name their strongest first.
    const weight = 3 + Math.max(0, 3 - index);
    asset.businesses.forEach((b, position) => {
      const entry = tally.get(b) ?? { score: 0, assets: [] };
      entry.score += weight - position;
      entry.assets.push(asset);
      tally.set(b, entry);
    });
  });
  return [...tally.entries()]
    .map(([businessId, entry]) => ({
      businessId,
      score: entry.score,
      assets: entry.assets,
      why: `Because of your ${entry.assets.map((a) => a.label.toLowerCase()).join(" and ")}.`,
      opportunities: [...new Set(entry.assets.flatMap((a) => a.opportunities))].slice(0, 6),
    }))
    .sort((a, b) => b.score - a.score);
}

/** The businesses Frassy would suggest, in the member's own language. */
export function suggestedOpportunities(profile: PartnerProfile): string[] {
  const chosen = profile.assets.map(assetById).filter(Boolean) as HiddenAsset[];
  return [...new Set(chosen.flatMap((a) => a.opportunities))];
}

// ── Simple first ─────────────────────────────────────────────────────────────
// The Daily always opens with something a person can finish and feel good about.
// Frassy does the technical part behind the scenes.

export type StarterMove = {
  id: string;
  emoji: string;
  label: string;
  minutes: number;
  /** What Frassy does with it afterwards — the member never touches the tooling. */
  frassyHandles: string;
};

const GENERIC_STARTERS: StarterMove[] = [
  {
    id: "voice-note",
    emoji: "🎙",
    label: "Record a one-minute voice note about something you know well",
    minutes: 2,
    frassyHandles: "I'll turn it into a post, a caption and a page — you just talk.",
  },
  {
    id: "answer",
    emoji: "💬",
    label: "Answer one question I ask you today",
    minutes: 2,
    frassyHandles: "Your answer becomes content and it teaches me how to help you better.",
  },
  {
    id: "review-draft",
    emoji: "👀",
    label: "Read a draft I prepared and tell me yes or change it",
    minutes: 3,
    frassyHandles: "I wrote it already. You only approve it.",
  },
];

const ASSET_STARTERS: Record<string, StarterMove[]> = {
  wellness: [
    {
      id: "wellness-tip",
      emoji: "🌿",
      label: "Share one wellness tip, out loud or typed",
      minutes: 3,
      frassyHandles: "I'll shape it into a post and save it toward your first guide.",
    },
  ],
  cooking: [
    {
      id: "meal-photo",
      emoji: "🥗",
      label: "Photograph one healthy meal you made",
      minutes: 2,
      frassyHandles: "I'll write the caption and file it in your content library.",
    },
  ],
  fitness: [
    {
      id: "walk-log",
      emoji: "🥾",
      label: "Log today's walk and one sentence about how it felt",
      minutes: 2,
      frassyHandles: "That's the first entry of your walking community — I'll build the page.",
    },
  ],
  esthetics: [
    {
      id: "skin-question",
      emoji: "🧴",
      label: "Answer one common skin question in your own words",
      minutes: 4,
      frassyHandles: "I'll format it as skin education and prepare the next three questions.",
    },
  ],
  style: [
    {
      id: "one-piece",
      emoji: "👗",
      label: "Photograph one piece and say why it's good",
      minutes: 4,
      frassyHandles: "I'll write the listing and place it in a collection.",
    },
  ],
  logistics: [
    {
      id: "shipping-tip",
      emoji: "🌍",
      label: "Explain one thing most people get wrong about shipping",
      minutes: 4,
      frassyHandles: "I'll keep it for your service page and your first client conversation.",
    },
  ],
};

/** Confidence first. Never more than three, never technical. */
export function starterMoves(profile: PartnerProfile): StarterMove[] {
  const specific = profile.assets.flatMap((id) => ASSET_STARTERS[id] ?? []);
  return [...specific, ...GENERIC_STARTERS].slice(0, 3);
}

// ── Adaptive teaching ────────────────────────────────────────────────────────

export function teachingGuidance(profile: PartnerProfile): string {
  if (profile.comfort === "standard") {
    return "This member is comfortable with technical detail — you may move faster and use normal industry words, still explaining anything unusual.";
  }
  return "This member is not technical. Plain language only, no jargon, one step at a time, describe what they will see on screen, and do the technical work yourself rather than explaining it. Never make them feel behind.";
}

/**
 * Manner + strengths guidance handed to Frassy for every reply. It carries
 * what the member chose to tell us, so her Daily can never be generic.
 */
export function partnerContext(profile: PartnerProfile): string {
  const pending = (profile.pending ?? []).map(assetById).filter(Boolean) as HiddenAsset[];
  const pendingLine =
    pending.length > 0 &&
    `Continuous discovery (FRASS-0483): they recently mentioned ${pending
      .map((a) => a.label.toLowerCase())
      .join(", ")} in passing. If it fits naturally — never as an interruption — ask once whether they'd like you to open a Business Vault around it.`;
  if (!profileComplete(profile)) return pendingLine || "";
  const assets = profile.assets.map(assetById).filter(Boolean) as HiddenAsset[];
  const lines = [
    `Partner strengths discovered in conversation: ${assets
      .map((a) => `${a.emoji} ${a.label}`)
      .join(", ")}.`,
    profile.answers.certifications && `Certifications or training: ${profile.answers.certifications}.`,
    profile.answers.askedFor && `People already come to them for: ${profile.answers.askedFor}.`,
    profile.answers.neverAgain && `Work they never want again: ${profile.answers.neverAgain}. Never assign it.`,
    `Time available: about ${profile.hoursPerDay} hour(s) a day.`,
    profile.monthlyGoal > 0 && `Income goal: $${profile.monthlyGoal.toLocaleString()} a month.`,
    `Suggest businesses built on what they already know — ${suggestedOpportunities(profile)
      .slice(0, 6)
      .join(", ")} — never a generic business template, never coding or complex marketing unless they asked.`,
    "Open with simple, confidence-building work they can finish today; handle the technical part yourself.",
    teachingGuidance(profile),
    pendingLine,
  ].filter(Boolean);
  return lines.join("\n");
}

// ── FRASS-0483 — the interview never ends ────────────────────────────────────
// Frassy keeps listening for skills long after onboarding. Anything she
// overhears is held as "pending" until the member confirms it.

/** Reads a passing remark for skills we haven't heard before. Saves and returns them. */
export function noticeAssets(text: string): string[] {
  if (!text || text.trim().length < 6) return [];
  const profile = loadProfile();
  const known = new Set([...(profile.assets ?? []), ...(profile.pending ?? [])]);
  const fresh = detectAssets(text).filter((id) => !known.has(id));
  if (fresh.length === 0) return [];
  saveProfile({ ...profile, pending: [...(profile.pending ?? []), ...fresh].slice(-6) });
  return fresh;
}

/** The member said yes — the overheard skill becomes part of who they are. */
export function acceptPending(id: string): PartnerProfile {
  const profile = loadProfile();
  return saveProfile({
    ...profile,
    assets: [...new Set([...profile.assets, id])],
    pending: (profile.pending ?? []).filter((p) => p !== id),
  });
}

/** The member said no — never raise it again this session. */
export function dismissPending(id: string): PartnerProfile {
  const profile = loadProfile();
  return saveProfile({ ...profile, pending: (profile.pending ?? []).filter((p) => p !== id) });
}


/** One honest sentence for the top of the Daily. */
export function dailyHeadline(profile: PartnerProfile, firstName: string): string {
  if (!profileComplete(profile)) {
    return `${firstName}, before I hand you any work — let me learn what you already know. Two minutes, a conversation, no forms.`;
  }
  const top = assetById(profile.assets[0] ?? "");
  return top
    ? `Today is built around your ${top.label.toLowerCase()}, ${firstName}. ${top.worth}`
    : `Today is built around what you already know, ${firstName}.`;
}
