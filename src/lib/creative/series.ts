// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0533 — Creative Series & Intellectual Property
//
// A creative series is not "another YouTube channel". It is a media business:
// characters, a world, a back catalog and licensing — an asset that keeps
// earning long after the episodes are made (FRASS-0533-A, Stage 3: Legacy).
//
// The member remains the creator. Frassy becomes the production partner.
//
// Nothing here is hardcoded into anybody's Daily. A series lives on a Member
// Success Blueprint as a creative project; the Daily renders whatever the
// Blueprint carries (FRASS-0532-B).
// ─────────────────────────────────────────────────────────────────────────────

export const EPISODE_STAGES = [
  { id: "brainstorm", emoji: "💡", label: "Brainstorm", plain: "Throw out ideas. Nothing is silly yet." },
  { id: "concept", emoji: "🎯", label: "Choose the funniest concept", plain: "Pick the one that made you laugh." },
  { id: "script", emoji: "📝", label: "Build the script", plain: "Write it as if you're telling a friend." },
  { id: "scenes", emoji: "🎞", label: "Plan the scenes", plain: "What happens, in what order." },
  { id: "storyboard", emoji: "🖼", label: "Generate storyboards", plain: "See it before you make it." },
  { id: "animation", emoji: "🎬", label: "Produce the animation", plain: "Bring the scene to life." },
  { id: "upload", emoji: "📤", label: "Prepare the YouTube upload", plain: "Title, description, thumbnail, tags." },
  { id: "publish", emoji: "🚀", label: "Publish", plain: "It goes live." },
  { id: "shorts", emoji: "✂️", label: "Repurpose into Shorts", plain: "Three clips from one episode." },
  { id: "track", emoji: "📈", label: "Track performance", plain: "What worked, what we do differently." },
] as const;

export type EpisodeStageId = (typeof EPISODE_STAGES)[number]["id"];

export type SeriesCharacter = { name: string; plain: string };

export type CreativeSeries = {
  key: string;
  emoji: string;
  title: string;
  status: string;
  vision: string;
  /** What the series is made of. */
  ingredients: string[];
  objective: string;
  /** What Frassy does every single week. */
  producerRoles: string[];
  weeklyQuestion: string;
  workflow: readonly { id: string; emoji: string; label: string; plain: string }[];
  /** FRASS-0533 — the franchise, not just the videos. */
  longTerm: string[];
  characters: SeriesCharacter[];
  comedySources: string[];
  creativeRule: string;
  founderPrinciple: string;
};

/** 💇🏾‍♀️ The Founder's own series — and the proof that Frass works. */
export const I_AM_NOT_MY_HAIR: CreativeSeries = {
  key: "i-am-not-my-hair",
  emoji: "💇🏾‍♀️",
  title: "I Am Not My Hair",
  status: "Active Weekly Money Move",
  vision:
    "The Founder's original animated educational and entertainment series — hairdressing, comedy, Caribbean culture, natural hair, locks, beauty-industry experience, education and storytelling in one recognisable media brand.",
  ingredients: [
    "Hairdressing",
    "Comedy",
    "Caribbean culture",
    "Natural hair",
    "Locks",
    "Beauty industry experiences",
    "Education",
    "Storytelling",
  ],
  objective:
    "Build a recognisable media brand while growing a monetized YouTube channel and expanding into future products.",
  producerRoles: [
    "Brainstorm episode ideas",
    "Organize scripts",
    "Develop jokes",
    "Improve storytelling",
    "Maintain continuity between episodes",
    "Track production",
    "Prepare publishing schedules",
    "Optimize YouTube titles",
    "Write descriptions",
    "Suggest thumbnails",
    "Research keywords",
    "Track monetization progress",
  ],
  weeklyQuestion: "Are we creating this week's episode of I Am Not My Hair?",
  workflow: EPISODE_STAGES,
  longTerm: [
    "A monetized YouTube channel",
    "Merchandise",
    "Educational content",
    "Digital products",
    "Children's books",
    "Animated specials",
    "Licensing opportunities",
    "Streaming opportunities",
  ],
  characters: [
    { name: "The veteran stylist", plain: "She has seen everything, twice, and is not impressed." },
    { name: "The \"just trim the ends\" client", plain: "Halfway through she wants a completely different hairstyle." },
    { name: "The apprentice", plain: "Learning the trade, sweeping the floor, listening to everything." },
    { name: "The natural hair expert", plain: "Knows every curl pattern and every myth worth killing." },
    { name: "The lock specialist", plain: "Patience, ritual, and years of somebody's journey in her hands." },
    { name: "The barber next door", plain: "Never asked for his opinion. Always has one." },
    { name: "The salon owner", plain: "Trying to keep the lights on, the chairs full and the peace." },
  ],
  comedySources: [
    "Shrinkage jokes",
    "Client misunderstandings",
    "Salon conversations",
    "Hair transformations",
    "Lock journeys",
    "Beauty myths",
    "Caribbean humour",
    "Everyday stylist experiences",
  ],
  creativeRule:
    "Humour comes from real salon experiences. It should always feel authentic and relatable — never a joke written by a stranger.",
  founderPrinciple:
    "Every business begins with a story. I Am Not My Hair celebrates the beauty industry through humour, " +
    "authenticity and creativity while building a lasting media brand that inspires, entertains and creates " +
    "new opportunities for the Founder.",
};

export const CREATIVE_SERIES: CreativeSeries[] = [I_AM_NOT_MY_HAIR];

export function seriesByKey(key: string): CreativeSeries | undefined {
  return CREATIVE_SERIES.find((s) => s.key.toLowerCase() === key.trim().toLowerCase());
}

/** Match a Blueprint creative project to a known series definition, by name. */
export function seriesForProject(name: string): CreativeSeries | undefined {
  const n = name.trim().toLowerCase();
  return CREATIVE_SERIES.find(
    (s) => s.key === n || s.title.toLowerCase() === n || n.includes(s.title.toLowerCase()),
  );
}

export const IP_PRINCIPLE = {
  id: "FRASS-0533",
  headline: "A series is intellectual property, not content.",
  plain:
    "Here's the takeaway: people come back for the characters, not the hair tips. Once they love " +
    "the characters, the same story can become books, merch, specials and licensing — that's a franchise, and a " +
    "franchise is something you can leave behind.",
} as const;
