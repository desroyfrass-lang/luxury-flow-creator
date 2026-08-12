// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0486 · FRASS STREET — "Learn. Play. Create. Grow."
// FRASS-0486A · The children's FOR ME (personal feed, never a social feed)
// FRASS-0486B · Privacy & Feed Constitution (children explore, they don't network)
// FRASS-0486C · Content & Video Constitution (approved monetized providers only)
// FRASS-0486D · Purpose Before Platform (tools appear only when a dream needs them)
//
// AUDIT BEFORE BUILDING — nothing below duplicates an existing system:
//   · Kids World (lib/kids-world.ts, routes/kids-world.*)  → FRASS STREET is its
//     personal feed. The age worlds, places and parent dashboard stay as they are.
//   · Kids Passport (lib/kids-passport.ts)                 → the only age source.
//   · Kids Progress (lib/kids-progress.ts)                 → the only progress store.
//   · FOR ME (routes/for-me.tsx)                           → adults only. Children
//     never enter it; FRASS STREET is their equivalent, and they graduate into it.
//   · The Daily (components/workspace/frass-daily.tsx)     → adult. Never shown to a child.
//   · Money Moves (lib/business/money-moves.ts)            → adult. Children never monetize.
//   · Frassy (lib/frassy/*, routes/api/chat.ts)            → ONE Frassy. The street
//     characters are presentations of Frassy, never separate AIs (FRASS-0479 freeze).
//   · Accessibility                                        → large targets, plain
//     language, no timers, no streak pressure, reduced-motion respected in the UI.
// ─────────────────────────────────────────────────────────────────────────────

import type { KidsProgress } from "@/lib/kids-progress";

export const STREET_PRINCIPLE =
  "FRASS STREET is the children's neighborhood inside Frass — a living world where children learn, laugh, create, imagine and grow life skills through stories, characters, games and exploration.";

export const STREET_PLAIN_ENGLISH =
  "What this means in plain English: it's a street a child wants to walk down, not a class they have to sit through. Every door opens onto something to make, not something to watch.";

export const STREET_FOUNDER_PRINCIPLE =
  "Every child should leave having learned something, created something, or smiled.";

export const STREET_NOT_SOCIAL =
  "FRASS STREET is not social media. It is one child's private world: no profiles, no followers, no messages, no discovery by strangers.";

export const STREET_NO_BROWSING_RULE =
  "Children never browse the internet through FRASS STREET. Frassy brings the best age-appropriate content to them.";

export const STREET_ONE_FRASSY_RULE =
  "Every FRASS STREET character is a way Frassy presents an experience. They are never separate assistants (FRASS-0479 Frassy Architecture Freeze).";

export const PURPOSE_BEFORE_PLATFORM =
  "Frass never asks what tool to teach. Frass asks what dream someone is building. Creative tools appear only when a member's own vision needs them — never as a recruitment pitch, never as a Money Move.";

// ── The constitutional purpose test ──────────────────────────────────────────
// Nothing enters the street unless it satisfies at least one of these.

export const PURPOSES = [
  { id: "learn", emoji: "📖", label: "Learn" },
  { id: "create", emoji: "🎨", label: "Create" },
  { id: "explore", emoji: "🧭", label: "Explore" },
  { id: "confidence", emoji: "🌟", label: "Build confidence" },
  { id: "kindness", emoji: "💛", label: "Encourage kindness" },
  { id: "curiosity", emoji: "🔍", label: "Develop curiosity" },
  { id: "imagination", emoji: "🌈", label: "Inspire creativity" },
] as const;

export type PurposeId = (typeof PURPOSES)[number]["id"];

export function purposeLabel(id: PurposeId): string {
  return PURPOSES.find((p) => p.id === id)?.label ?? id;
}

/** The gate every experience must pass before it can appear on the street. */
export function passesPurposeTest(purposes: PurposeId[]): boolean {
  return purposes.length > 0;
}

// ── Age bands (the Kids Passport is the only source of a child's age) ────────

export type AgeBand = "0-3" | "3-6" | "6-12" | "12-plus";

export const AGE_BANDS: { id: AgeBand; label: string; spirit: string; reading: string }[] = [
  {
    id: "0-3",
    label: "0–3",
    spirit: "Sensory. Colours, shapes, sounds and a grown-up close by.",
    reading: "No reading. Pictures, sounds and one short sentence for the grown-up.",
  },
  {
    id: "3-6",
    label: "3–6",
    spirit: "Stories, letters, numbers, drawing, songs, kindness and imagination.",
    reading: "Short sentences. Big words explained the moment they appear.",
  },
  {
    id: "6-12",
    label: "6–12",
    spirit: "Science, art, reading, nature, building, problem solving and confidence.",
    reading: "Full sentences. Real vocabulary, always explained once.",
  },
  {
    id: "12-plus",
    label: "12+",
    spirit: "Deeper projects, mentorship and the first steps toward Frass Hill.",
    reading: "Grown-up clarity, still warm, never talking down.",
  },
];

export function ageBand(slug: string | null | undefined): AgeBand {
  const found = AGE_BANDS.find((b) => b.id === slug);
  return found?.id ?? "3-6";
}

/** Ages 0–3 are always accompanied. The UI says so out loud. */
export function needsGrownUp(band: AgeBand): boolean {
  return band === "0-3";
}

// ── The neighborhood ─────────────────────────────────────────────────────────

export type Building = {
  slug: string;
  emoji: string;
  name: string;
  /** One line a six-year-old understands. */
  invitation: string;
  purposes: PurposeId[];
  ages: AgeBand[];
  /** The character who lives here — a presentation of Frassy. */
  character: CharacterId;
  /** Warm accent used for the building's card. */
  accent: string;
};

export const BUILDINGS: Building[] = [
  { slug: "homes", emoji: "🏠", name: "The Homes", invitation: "Knock on a door and meet the families who live on the street.", purposes: ["kindness", "imagination"], ages: ["0-3", "3-6", "6-12"], character: "elder", accent: "#f4a259" },
  { slug: "park", emoji: "🌳", name: "The Park", invitation: "Run, count the birds, and find something living under every leaf.", purposes: ["explore", "curiosity"], ages: ["0-3", "3-6", "6-12"], character: "explorer", accent: "#5fa855" },
  { slug: "library", emoji: "📚", name: "The Library", invitation: "Pick a story. Read it, or let it be read to you.", purposes: ["learn", "imagination"], ages: ["0-3", "3-6", "6-12", "12-plus"], character: "storyteller", accent: "#8a6ad1" },
  { slug: "music-corner", emoji: "🎵", name: "Music Corner", invitation: "Tap a rhythm, learn a note, make a song that is only yours.", purposes: ["create", "confidence"], ages: ["0-3", "3-6", "6-12", "12-plus"], character: "musician", accent: "#e05b7a" },
  { slug: "art-house", emoji: "🎨", name: "The Art House", invitation: "Draw, paint, and hang what you made on your own wall.", purposes: ["create", "imagination"], ages: ["3-6", "6-12", "12-plus"], character: "artist", accent: "#e8a33d" },
  { slug: "science-lab", emoji: "🔬", name: "The Science Lab", invitation: "Ask why. Then try it and find out.", purposes: ["learn", "curiosity"], ages: ["3-6", "6-12", "12-plus"], character: "scientist", accent: "#3d9ad1" },
  { slug: "story-tree", emoji: "🌲", name: "The Story Tree", invitation: "Write your own story. The tree keeps every one you make.", purposes: ["create", "confidence"], ages: ["3-6", "6-12", "12-plus"], character: "storyteller", accent: "#4f8f6d" },
  { slug: "nature-trail", emoji: "🦋", name: "Nature Trail", invitation: "Follow the trail and meet the animals who live along it.", purposes: ["explore", "curiosity"], ages: ["0-3", "3-6", "6-12"], character: "explorer", accent: "#6bbf9b" },
  { slug: "playground", emoji: "🛝", name: "The Playground", invitation: "Puzzles, games and challenges that make your brain giggle.", purposes: ["learn", "confidence"], ages: ["0-3", "3-6", "6-12"], character: "explorer", accent: "#f2735f" },
  { slug: "discovery-center", emoji: "🧭", name: "Discovery Center", invitation: "Something new every visit. Nobody knows what it will be.", purposes: ["curiosity", "explore"], ages: ["3-6", "6-12", "12-plus"], character: "scientist", accent: "#7f8ce0" },
  { slug: "theatre", emoji: "🎭", name: "The Theatre", invitation: "Put on a play, use funny voices, take a bow.", purposes: ["create", "confidence"], ages: ["3-6", "6-12", "12-plus"], character: "storyteller", accent: "#c05fd1" },
  { slug: "community-garden", emoji: "🌱", name: "Community Garden", invitation: "Plant something, look after it, and share what grows.", purposes: ["kindness", "learn"], ages: ["0-3", "3-6", "6-12", "12-plus"], character: "gardener", accent: "#7bab3f" },
  { slug: "kitchen", emoji: "🍳", name: "The Little Kitchen", invitation: "Healthy snacks you can really make, with a grown-up nearby.", purposes: ["learn", "kindness"], ages: ["3-6", "6-12", "12-plus"], character: "cook", accent: "#e8894d" },
];

export function buildingBySlug(slug: string): Building | undefined {
  return BUILDINGS.find((b) => b.slug === slug);
}

export function buildingsForAge(band: AgeBand): Building[] {
  return BUILDINGS.filter((b) => b.ages.includes(band));
}

// ── Characters — all of them are Frassy ──────────────────────────────────────
// FRASS-0479 freeze: one Frassy, many presentations. A character is a costume
// and a specialty, never a second assistant with its own memory or voice engine.

export type CharacterId =
  | "storyteller"
  | "artist"
  | "musician"
  | "gardener"
  | "scientist"
  | "explorer"
  | "cook"
  | "elder";

export type StreetCharacter = {
  id: CharacterId;
  emoji: string;
  name: string;
  /** What this presentation of Frassy is for. */
  teaches: string;
  /** How she sounds while wearing it. */
  personality: string;
  /** Greeting per age band — the same voice, pitched to the child. */
  greeting: Record<AgeBand, string>;
};

export const CHARACTERS: StreetCharacter[] = [
  {
    id: "storyteller",
    emoji: "📚",
    name: "Auntie Story",
    teaches: "Reading, writing and imagination.",
    personality: "Warm, unhurried, always leaves one question hanging.",
    greeting: {
      "0-3": "Look — a picture story. Point at the one you like.",
      "3-6": "I have a story with a lizard in it. Should we read it together?",
      "6-12": "Every story starts with someone who wants something. What does yours want?",
      "12-plus": "Bring me one sentence and I'll help you turn it into a whole chapter.",
    },
  },
  {
    id: "artist",
    emoji: "🎨",
    name: "Miss Colour",
    teaches: "Drawing, painting, colour and looking closely.",
    personality: "Playful, never corrects, always asks what you meant.",
    greeting: {
      "0-3": "Big colours today. Which one is your favourite?",
      "3-6": "Let's draw something nobody has ever drawn before.",
      "6-12": "Pick three colours only. Hard rules make better pictures.",
      "12-plus": "Want to try shading? I'll show you one trick, then you take over.",
    },
  },
  {
    id: "musician",
    emoji: "🎵",
    name: "Uncle Pan",
    teaches: "Rhythm, melody, listening and making songs.",
    personality: "Steel-pan bright, claps along, counts you in.",
    greeting: {
      "0-3": "Boom, boom, tap. Can you copy that?",
      "3-6": "Every song is just a pattern. Let's make one.",
      "6-12": "Four beats in a bar. Clap them and I'll add the pan underneath.",
      "12-plus": "Write me a chorus. Four lines. I'll help you find the tune.",
    },
  },
  {
    id: "gardener",
    emoji: "🌱",
    name: "Mister Green",
    teaches: "Growing, patience, weather and looking after things.",
    personality: "Slow, kind, thinks a week ahead.",
    greeting: {
      "0-3": "Soft leaf. Touch it gently.",
      "3-6": "Seeds are sleeping. Water wakes them up.",
      "6-12": "Plants need four things. Guess them, then let's check.",
      "12-plus": "Grow one thing you can actually eat. I'll plan the weeks with you.",
    },
  },
  {
    id: "scientist",
    emoji: "🔬",
    name: "Doctor Why",
    teaches: "Questions, experiments and finding out for yourself.",
    personality: "Delighted by being wrong, always says 'let's test it'.",
    greeting: {
      "0-3": "Splash. Where did the water go?",
      "3-6": "Does it float or does it sink? Let's find out.",
      "6-12": "A guess with a test is called a hypothesis. Make one.",
      "12-plus": "Design the experiment yourself. I'll only check your controls.",
    },
  },
  {
    id: "explorer",
    emoji: "🦋",
    name: "Sky the Explorer",
    teaches: "Nature, animals, maps and noticing.",
    personality: "Whispers, points a lot, never in a rush.",
    greeting: {
      "0-3": "Listen. Do you hear the bird?",
      "3-6": "Let's count how many living things we can find.",
      "6-12": "Every animal here has a job. Want to learn the hummingbird's?",
      "12-plus": "Map your own street's wildlife. Real fieldwork, real notebook.",
    },
  },
  {
    id: "cook",
    emoji: "🍳",
    name: "Chef Nutmeg",
    teaches: "Healthy habits, simple cooking and sharing food.",
    personality: "Cheerful, safety-first, always makes enough for two.",
    greeting: {
      "0-3": "Red fruit, yellow fruit. Which one is sweet?",
      "3-6": "Cold snack, no stove, big smile. Ready?",
      "6-12": "Real recipe today — and a grown-up holds the knife.",
      "12-plus": "Cook one meal for someone else this week. I'll write the list.",
    },
  },
  {
    id: "elder",
    emoji: "🐢",
    name: "Granny Turtle",
    teaches: "Kindness, courage, family and slowing down.",
    personality: "Gentle, funny, tells one small truth per visit.",
    greeting: {
      "0-3": "Hello, little one. Sit with me a while.",
      "3-6": "Being kind is a thing you practise, like hopping.",
      "6-12": "Brave doesn't mean not scared. It means going anyway.",
      "12-plus": "You're growing fast. Let's talk about the person you're becoming.",
    },
  },
];

export function characterById(id: CharacterId): StreetCharacter {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]!;
}

// ── Safety architecture (FRASS-0486B) ────────────────────────────────────────

export const SAFETY_QUESTION = "Does this protect the child? If the answer is uncertain, the interaction does not exist.";

/** Capabilities that are structurally absent. The UI never renders them. */
export const FORBIDDEN_IN_STREET = [
  "search for other children",
  "contact other children",
  "send or receive direct messages",
  "public profiles",
  "following or followers",
  "going live",
  "public chats",
  "unsolicited communication",
  "being discoverable by strangers",
  "targeted advertising",
  "adult marketplace",
  "adult Money Moves",
  "adult social feed",
  "adult communities",
  "adult recommendations",
] as const;

/** Adult surfaces a child must never reach. Used by the street's route guard. */
export const ADULT_SURFACES = [
  "/for-me",
  "/for-us",
  "/room",
  "/money-moves",
  "/marketplace",
  "/services",
  "/founder",
  "/live",
  "/workspace",
] as const;

export function isAdultSurface(path: string): boolean {
  return ADULT_SURFACES.some((p) => path === p || path.startsWith(`${p}/`));
}

// ── Video (FRASS-0486C) ──────────────────────────────────────────────────────
// Frass does not host or re-upload video. Long-form video is delivered by an
// approved monetized provider — YouTube is the primary provider at launch — and
// always plays inside the street. The child never lands on the provider's site.

export const VIDEO_PROVIDERS = ["youtube"] as const;
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

export const VIDEO_CONSTITUTION =
  "Every long-form video comes from an approved monetized provider. YouTube is the primary provider at launch. The viewing experience belongs to FrassKicks — children are exploring FRASS STREET, not browsing YouTube.";

export const VIDEO_CURATION_RULE =
  "Popularity never decides a recommendation. Age, learning interest, current activity, parent preference, educational value, safety and quality do.";

export type CuratedVideo = {
  id: string;
  provider: VideoProvider;
  /** Provider reference (YouTube video id). Empty until the Founder approves one. */
  ref: string;
  title: string;
  /** The learning topic this slot fills. */
  topic: StreetTopic;
  ages: AgeBand[];
  /** Why Frassy chose it — shown to parents, spoken to children. */
  why: string;
  minutes: number;
  /** Whose channel earns from it. Frass never displays unmonetized rips. */
  creditedTo: string;
};

/**
 * Curation slots. Each entry is an approved *place* in the street for a video on
 * that topic; the provider ref is filled in by the Founder during approval, and
 * an unapproved slot renders as "Frassy is still choosing this one" rather than
 * ever falling back to an open search. That is what keeps FRASS-0486B's
 * "children never browse the internet" rule structural instead of aspirational.
 */
export const CURATED_VIDEOS: CuratedVideo[] = [
  { id: "v-alphabet", provider: "youtube", ref: "", title: "Letters on the Street", topic: "reading", ages: ["3-6"], why: "Letter sounds set to a steel-pan rhythm — the way most children remember them.", minutes: 6, creditedTo: "Approved Frass education partner" },
  { id: "v-counting", provider: "youtube", ref: "", title: "Counting the Mango Tree", topic: "maths", ages: ["3-6"], why: "Counting with real objects before symbols. Fewer numbers, more understanding.", minutes: 5, creditedTo: "Approved Frass education partner" },
  { id: "v-water", provider: "youtube", ref: "", title: "Where Rain Goes", topic: "science", ages: ["6-12"], why: "The water cycle explained through one afternoon of island rain.", minutes: 9, creditedTo: "Approved Frass education partner" },
  { id: "v-hummingbird", provider: "youtube", ref: "", title: "The Hummingbird's Job", topic: "nature", ages: ["3-6", "6-12"], why: "Pollination, told as a working day. Connects to the Community Garden.", minutes: 7, creditedTo: "Approved Frass education partner" },
  { id: "v-shading", provider: "youtube", ref: "", title: "Light and Shadow", topic: "art", ages: ["6-12", "12-plus"], why: "One drawing technique, taught slowly, ending in something the child makes.", minutes: 11, creditedTo: "Approved Frass education partner" },
  { id: "v-rhythm", provider: "youtube", ref: "", title: "Four Beats", topic: "music", ages: ["6-12"], why: "Rhythm you can clap before you can read it.", minutes: 8, creditedTo: "Approved Frass education partner" },
  { id: "v-kindness", provider: "youtube", ref: "", title: "The Quiet Kindness", topic: "kindness", ages: ["3-6", "6-12"], why: "A story about helping without being asked. Pairs with the Homes.", minutes: 6, creditedTo: "Approved Frass education partner" },
  { id: "v-money", provider: "youtube", ref: "", title: "Save, Spend, Share", topic: "money", ages: ["6-12", "12-plus"], why: "Three jars, one allowance. The whole foundation of money in ten minutes.", minutes: 10, creditedTo: "Approved Frass education partner" },
  { id: "v-body", provider: "youtube", ref: "", title: "Why Sleep Wins", topic: "health", ages: ["6-12"], why: "Healthy habits explained by what the body is doing, not by rules.", minutes: 7, creditedTo: "Approved Frass education partner" },
  { id: "v-culture", provider: "youtube", ref: "", title: "Songs from the Hill", topic: "culture", ages: ["6-12", "12-plus"], why: "Caribbean music history, in the voices of the people who made it.", minutes: 12, creditedTo: "Approved Frass education partner" },
];

export function approvedVideos(band: AgeBand): CuratedVideo[] {
  return CURATED_VIDEOS.filter((v) => v.ages.includes(band));
}

/** A slot only plays once the Founder has approved a provider reference. */
export function isPlayable(v: CuratedVideo): boolean {
  return v.ref.trim().length > 0;
}

/** Privacy-preserving embed, locked to the street. No related-video exit doors. */
export function embedUrl(v: CuratedVideo): string | null {
  if (!isPlayable(v)) return null;
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1", iv_load_policy: "3" });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.ref)}?${params.toString()}`;
}

// ── Topics & interests ───────────────────────────────────────────────────────

export const TOPICS = [
  "reading", "maths", "science", "nature", "art", "music",
  "stories", "kindness", "health", "building", "money", "culture",
] as const;
export type StreetTopic = (typeof TOPICS)[number];

export const TOPIC_LABEL: Record<StreetTopic, { emoji: string; label: string }> = {
  reading: { emoji: "📖", label: "Reading" },
  maths: { emoji: "🔢", label: "Numbers" },
  science: { emoji: "🔬", label: "Science" },
  nature: { emoji: "🌿", label: "Nature" },
  art: { emoji: "🎨", label: "Art" },
  music: { emoji: "🎵", label: "Music" },
  stories: { emoji: "📚", label: "Stories" },
  kindness: { emoji: "💛", label: "Kindness" },
  health: { emoji: "🍎", label: "Healthy habits" },
  building: { emoji: "🧱", label: "Building" },
  money: { emoji: "🪙", label: "Money sense" },
  culture: { emoji: "🌍", label: "Our culture" },
};

// ── The feed (FRASS-0486A) ───────────────────────────────────────────────────
// A continuous scroll through one child's own world. It is generated from age,
// interests, progress and parent preferences — never from engagement metrics,
// never from what other children did.

export type FeedKind =
  | "welcome"
  | "story"
  | "game"
  | "art"
  | "music"
  | "science"
  | "nature"
  | "activity"
  | "video"
  | "challenge"
  | "achievement"
  | "kindness"
  | "product"
  | "episode";

export type FeedCard = {
  id: string;
  kind: FeedKind;
  emoji: string;
  title: string;
  /** One line, written at the child's reading level. */
  line: string;
  purposes: PurposeId[];
  topic: StreetTopic;
  character: CharacterId;
  building?: string;
  minutes?: number;
  /** What the child will have made by the end. Creativity first. */
  makes?: string;
  video?: CuratedVideo;
  /** In-street destination. Children never leave the street from a card. */
  to?: string;
  params?: Record<string, string>;
  /** Shown to the parent in the dashboard, never framed as a score. */
  parentNote?: string;
};

type FeedInput = {
  band: AgeBand;
  interests?: StreetTopic[];
  progress?: KidsProgress | null;
  /** Rotates the world daily so the street is never identical twice. */
  dayIndex?: number;
  childName?: string;
  /** Parent preferences: topics a family would rather not see today. */
  muted?: StreetTopic[];
};

/** Deterministic rotation — same child, same day, same street. */
function rotate<T>(items: T[], by: number): T[] {
  if (!items.length) return items;
  const n = ((by % items.length) + items.length) % items.length;
  return [...items.slice(n), ...items.slice(0, n)];
}

const ACTIVITY_SEEDS: Record<AgeBand, Omit<FeedCard, "id">[]> = {
  "0-3": [
    { kind: "art", emoji: "🖍", title: "Big Scribble", line: "Hold the crayon any way you like. Fill the page.", purposes: ["create"], topic: "art", character: "artist", makes: "a scribble picture", building: "art-house", minutes: 5, parentNote: "Sit beside them. Name the colours out loud." },
    { kind: "music", emoji: "🥁", title: "Copy the Beat", line: "Boom, boom, tap. Now you.", purposes: ["learn", "confidence"], topic: "music", character: "musician", makes: "a clapped pattern", building: "music-corner", minutes: 3 },
    { kind: "nature", emoji: "🐢", title: "Slow Animal Walk", line: "Walk like a turtle. Now like a bird.", purposes: ["explore"], topic: "nature", character: "explorer", makes: "a giggle", building: "nature-trail", minutes: 4 },
    { kind: "story", emoji: "🌙", title: "Picture Story", line: "Point at the part you like best.", purposes: ["imagination"], topic: "stories", character: "storyteller", makes: "a favourite page", building: "library", minutes: 5 },
    { kind: "kindness", emoji: "💛", title: "Gentle Hands", line: "Soft touch for the leaf. Soft touch for the cat.", purposes: ["kindness"], topic: "kindness", character: "elder", makes: "a kind moment", building: "homes", minutes: 3 },
  ],
  "3-6": [
    { kind: "story", emoji: "📖", title: "Story with a Lizard", line: "A little lizard lost his hat. Let's find it.", purposes: ["learn", "imagination"], topic: "stories", character: "storyteller", makes: "an ending you chose", building: "library", minutes: 8 },
    { kind: "art", emoji: "🎨", title: "Draw Your Street", line: "Draw the house you live in. Add one thing that isn't real.", purposes: ["create", "imagination"], topic: "art", character: "artist", makes: "a drawing", building: "art-house", minutes: 12 },
    { kind: "game", emoji: "🧩", title: "Shape Hunt", line: "Find three circles in your room. Go!", purposes: ["learn", "curiosity"], topic: "maths", character: "scientist", makes: "a list of shapes", building: "playground", minutes: 6 },
    { kind: "music", emoji: "🎵", title: "Make a Song About Rain", line: "Two lines. Any tune. Loud is allowed.", purposes: ["create", "confidence"], topic: "music", character: "musician", makes: "a song", building: "music-corner", minutes: 7 },
    { kind: "nature", emoji: "🌱", title: "Plant a Seed", line: "Seeds sleep until water wakes them.", purposes: ["learn", "kindness"], topic: "nature", character: "gardener", makes: "a growing plant", building: "community-garden", minutes: 10, parentNote: "A bean in a cup on the windowsill is enough." },
    { kind: "kindness", emoji: "💛", title: "One Kind Thing", line: "Do one kind thing today and tell me about it.", purposes: ["kindness", "confidence"], topic: "kindness", character: "elder", makes: "a kindness", building: "homes", minutes: 5 },
    { kind: "science", emoji: "💧", title: "Float or Sink?", line: "Guess first. Then test it in a bowl of water.", purposes: ["curiosity", "learn"], topic: "science", character: "scientist", makes: "a guess you tested", building: "science-lab", minutes: 10, parentNote: "Water play — towel nearby." },
  ],
  "6-12": [
    { kind: "story", emoji: "✍️", title: "Write the First Page", line: "Someone wants something and can't have it. Go.", purposes: ["create", "confidence"], topic: "stories", character: "storyteller", makes: "a page of your own story", building: "story-tree", minutes: 15 },
    { kind: "art", emoji: "🖌", title: "Three Colours Only", line: "Pick three colours. Make a whole picture from them.", purposes: ["create"], topic: "art", character: "artist", makes: "a limited-palette painting", building: "art-house", minutes: 20, to: "/gallery/studio" },
    { kind: "science", emoji: "🔬", title: "Make a Hypothesis", line: "A guess plus a test equals science. Design yours.", purposes: ["learn", "curiosity"], topic: "science", character: "scientist", makes: "an experiment", building: "science-lab", minutes: 18 },
    { kind: "nature", emoji: "🦋", title: "Map the Wildlife", line: "Every living thing you can find in ten minutes.", purposes: ["explore", "curiosity"], topic: "nature", character: "explorer", makes: "a field map", building: "nature-trail", minutes: 12 },
    { kind: "music", emoji: "🎼", title: "Four Beats in a Bar", line: "Clap it, then write it down. That's notation.", purposes: ["learn", "create"], topic: "music", character: "musician", makes: "a written rhythm", building: "music-corner", minutes: 14 },
    { kind: "activity", emoji: "🪙", title: "Save, Spend, Share", line: "Three jars. Decide what goes in each and why.", purposes: ["learn", "confidence"], topic: "money", character: "elder", makes: "your own money plan", building: "discovery-center", minutes: 15, parentNote: "Money sense, not earning. Children never trade inside Frass." },
    { kind: "activity", emoji: "🍳", title: "A Snack You Can Make", line: "Real recipe. A grown-up holds the knife.", purposes: ["learn", "kindness"], topic: "health", character: "cook", makes: "something to eat", building: "kitchen", minutes: 20 },
    { kind: "challenge", emoji: "🧱", title: "Build a Bridge", line: "Paper and tape only. It has to hold a book.", purposes: ["learn", "confidence"], topic: "building", character: "scientist", makes: "a bridge that holds", building: "playground", minutes: 25 },
    { kind: "kindness", emoji: "💛", title: "A Kindness Project", line: "Plan one thing that helps somebody this week.", purposes: ["kindness", "confidence"], topic: "kindness", character: "elder", makes: "a kindness plan", building: "community-garden", minutes: 15 },
  ],
  "12-plus": [
    { kind: "challenge", emoji: "📓", title: "Keep a Field Notebook", line: "One observation a day for a week. Real fieldwork.", purposes: ["explore", "confidence"], topic: "nature", character: "explorer", makes: "a week of notes", building: "nature-trail", minutes: 15 },
    { kind: "art", emoji: "🖼", title: "Light and Shadow", line: "One technique, practised properly, changes everything.", purposes: ["create", "learn"], topic: "art", character: "artist", makes: "a shaded study", building: "art-house", minutes: 30, to: "/gallery/studio" },
    { kind: "story", emoji: "📕", title: "Write a Chapter", line: "You have the sentence. Now build the room around it.", purposes: ["create", "confidence"], topic: "stories", character: "storyteller", makes: "a chapter", building: "story-tree", minutes: 35 },
    { kind: "activity", emoji: "🪙", title: "What Things Actually Cost", line: "Price a week of groceries. Compare it to a guess.", purposes: ["learn"], topic: "money", character: "elder", makes: "a real budget", building: "discovery-center", minutes: 25, parentNote: "Financial literacy only. No selling, no earning, no accounts." },
    { kind: "challenge", emoji: "🌍", title: "A Project for Your Street", line: "Find one small problem near you and plan a fix.", purposes: ["kindness", "confidence"], topic: "culture", character: "elder", makes: "a community plan", building: "community-garden", minutes: 30 },
    { kind: "music", emoji: "🎤", title: "Write a Chorus", line: "Four lines that mean something. Then find the tune.", purposes: ["create"], topic: "music", character: "musician", makes: "a chorus", building: "music-corner", minutes: 25 },
  ],
};

/**
 * Builds the child's street. Ordering is deliberate and repeats a rhythm:
 * a welcome, then story → make → move → discover → watch → create → celebrate.
 */
export function buildStreetFeed(input: FeedInput): FeedCard[] {
  const { band, interests = [], muted = [], dayIndex = 0, childName, progress } = input;
  const character = characterById(BUILDINGS.find((b) => b.ages.includes(band))?.character ?? "storyteller");

  const welcome: FeedCard = {
    id: "welcome",
    kind: "welcome",
    emoji: "🌞",
    title: childName ? `Good day, ${childName}` : "Welcome back to Frass Street",
    line:
      needsGrownUp(band)
        ? "Sit together — this part of the street is for you and your grown-up."
        : "Everything here is yours. Nobody else can see it.",
    purposes: ["confidence"],
    topic: "stories",
    character: character.id,
  };

  const seeds = ACTIVITY_SEEDS[band] ?? [];
  const allowed = seeds.filter((s) => !muted.includes(s.topic));
  const liked = allowed.filter((s) => interests.includes(s.topic));
  const rest = rotate(
    allowed.filter((s) => !interests.includes(s.topic)),
    dayIndex,
  );

  // Interests lead, but the street never becomes one subject — variety is a
  // constitutional property of childhood, not a personalisation setting.
  const woven: Omit<FeedCard, "id">[] = [];
  const pool = [...rotate(liked, dayIndex), ...rest];
  const seenTopics: StreetTopic[] = [];
  for (const card of pool) {
    const lastTwo = seenTopics.slice(-2);
    if (lastTwo.includes(card.topic) && pool.length > 3) continue;
    woven.push(card);
    seenTopics.push(card.topic);
  }

  const cards: FeedCard[] = [welcome];
  const videos = rotate(
    approvedVideos(band).filter((v) => !muted.includes(v.topic)),
    dayIndex,
  );
  let videoIndex = 0;

  woven.forEach((card, i) => {
    cards.push({ ...card, id: `${band}-${card.kind}-${i}` });
    // One curated video every third stop. Never a wall of video.
    if ((i + 1) % 3 === 0 && videos[videoIndex]) {
      const v = videos[videoIndex]!;
      videoIndex += 1;
      cards.push({
        id: `video-${v.id}`,
        kind: "video",
        emoji: "📺",
        title: v.title,
        line: v.why,
        purposes: ["learn", "curiosity"],
        topic: v.topic,
        character: characterById(BUILDINGS.find((b) => b.slug === "library")!.character).id,
        minutes: v.minutes,
        video: v,
        parentNote: `Curated by Frassy · ${v.creditedTo}. Plays inside Frass Street.`,
      });
    }
  });

  const badges = progress?.badges?.length ?? 0;
  const made = Object.keys(progress?.completed ?? {}).length;
  cards.push({
    id: "achievement",
    kind: "achievement",
    emoji: "🏅",
    title: made ? "Look what you've made" : "Your shelf is waiting",
    line: made
      ? `${made} thing${made === 1 ? "" : "s"} finished${badges ? ` · ${badges} badge${badges === 1 ? "" : "s"}` : ""}. All of it kept, all of it yours.`
      : "Everything you make gets a place on your own shelf. Nothing is ever scored.",
    purposes: ["confidence"],
    topic: "stories",
    character: "elder",
  });

  return cards;
}

// ── What the child makes (creativity first) ──────────────────────────────────

export const CREATION_RULE =
  "Children should leave FRASS STREET having made something — a drawing, a story, a song, a craft, an experiment or a kindness. The emphasis is on creating, not consuming.";

export type CreationKind = "drawing" | "story" | "song" | "craft" | "experiment" | "kindness" | "garden" | "discovery";

export const CREATION_KINDS: { id: CreationKind; emoji: string; label: string }[] = [
  { id: "drawing", emoji: "🎨", label: "Drawing" },
  { id: "story", emoji: "📚", label: "Story" },
  { id: "song", emoji: "🎵", label: "Song" },
  { id: "craft", emoji: "✂️", label: "Craft" },
  { id: "experiment", emoji: "🔬", label: "Experiment" },
  { id: "kindness", emoji: "💛", label: "Kindness" },
  { id: "garden", emoji: "🌱", label: "Garden" },
  { id: "discovery", emoji: "🦋", label: "Discovery" },
];

// ── Parent connection ────────────────────────────────────────────────────────

export const PARENT_PROMISE =
  "Parents see progress, interests, creative work, time spent and achievements. Parents never read a child's private thoughts back to them, and children are never shown a parent's monitoring as pressure.";

export type ParentSummary = {
  interests: { topic: StreetTopic; visits: number }[];
  made: number;
  badges: number;
  lastVisit: string | null;
  minutesToday: number;
};

export function summariseForParent(progress: KidsProgress | null, minutesToday = 0): ParentSummary {
  const skills = progress?.skills ?? {};
  const interests = (Object.entries(skills) as [string, number][])
    .filter(([k]) => (TOPICS as readonly string[]).includes(k))
    .map(([topic, visits]) => ({ topic: topic as StreetTopic, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 6);
  return {
    interests,
    made: Object.keys(progress?.completed ?? {}).length,
    badges: progress?.badges?.length ?? 0,
    lastVisit: progress?.lastActivity ?? null,
    minutesToday,
  };
}

// ── Growing up: the graduation into Frass Hill ───────────────────────────────

export const GRADUATION_PRINCIPLE =
  "Nothing a child made is lost when they grow up. Their artwork, stories, badges, reading milestones and projects become their history on Frass Hill. They graduate — they never start over.";

export function graduationLine(childName?: string): string {
  return `${childName ? `${childName}, you` : "You"}'ve grown so much. Today you're ready for your next adventure. Welcome to Frass Hill.`;
}

export function readyToGraduate(band: AgeBand): boolean {
  return band === "12-plus";
}

/** The mentor programme is guidance, never open messaging. */
export const MENTOR_RULES = [
  "Children can never be contacted by the public.",
  "Mentors cannot browse or approach children.",
  "Contact begins only inside an approved educational or mentorship activity.",
  "A parent or guardian control is available wherever the child is a minor.",
] as const;

// ── Frassy's context block (one Frassy, child mode) ──────────────────────────

export function streetContext(band: AgeBand, childName?: string): string {
  const b = AGE_BANDS.find((x) => x.id === band)!;
  return [
    "FRASS STREET MODE (FRASS-0486) — you are speaking with a child inside their own private world.",
    `Age band ${b.label}. ${b.spirit} Reading level: ${b.reading}`,
    childName ? `The child's name is ${childName}. Use it warmly and sparingly.` : "",
    "You are still one Frassy. The street characters are ways you present yourself, never separate assistants.",
    "Be a gentle learning companion: explain, encourage, celebrate, ask questions. Never overwhelm, never rush, never score.",
    "Every reply should move toward making something: a drawing, a story, a song, an experiment, a kindness.",
    STREET_NOT_SOCIAL,
    STREET_NO_BROWSING_RULE,
    "Never mention adult Frass systems: Money Moves, marketplace selling, going live, business vaults, earnings or payments. Money talk with children is savings and sharing only.",
    "If a child asks to contact anyone, explain kindly that Frass Street is their own private world and suggest showing a grown-up instead.",
  ]
    .filter(Boolean)
    .join("\n");
}
