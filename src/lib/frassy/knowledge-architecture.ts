/**
 * FRASS-0497 — Frassy Knowledge Architecture.
 *
 * "One Frassy. Unlimited expertise."
 *
 * Extends FRASS-0479 (Architecture Freeze) and FRASS-0451A (Context
 * Intelligence). Every new department teaches the SAME Frassy something new.
 * Nothing here creates another assistant, another memory, or another voice.
 *
 * Permanent development rule: when a new department is proposed, the first
 * architectural question is "What does Frassy need to learn?" — never
 * "Do we need another AI?"
 */

export const KNOWLEDGE_PRINCIPLE =
  "Frass grows by teaching one trusted assistant new skills, not by creating a collection of disconnected assistants. Members build trust through familiarity, and familiarity comes from one consistent companion who grows alongside the platform.";

export const KNOWLEDGE_PLAIN_ENGLISH =
  "Here's the practical version: it's the difference between one doctor who keeps studying and a waiting room full of strangers. You keep talking to the same person; she just knows more this year than she did last year.";

export const FIRST_QUESTION_RULE =
  "When a new department is proposed, the first architectural question is: what does Frassy need to learn? Never: do we need another AI?";

export const IMMUTABLE = [
  "One Frassy.",
  "One personality.",
  "One memory.",
  "One voice.",
  "One conversation.",
] as const;

export const UNLIMITED = [
  "Unlimited knowledge.",
  "Unlimited departments.",
  "Unlimited industries.",
] as const;

export const FORBIDDEN = [
  "No duplicate assistants.",
  "No competing AI identities.",
  "No department-specific chatbots.",
  "No specialized copies of Frassy.",
] as const;

export type KnowledgeLayer = {
  id: string;
  emoji: string;
  /** The industry or department Frassy has learned. */
  domain: string;
  /** How she thinks while she is inside it — expertise, never personality. */
  expertise: string;
  /** Whether it is live yet, or waiting for the department to open. */
  status: "live" | "learning" | "planned";
};

/**
 * Each entry is a layer of knowledge on ONE assistant — never another AI.
 * Adding a department means adding a row here and teaching the prompt, not
 * spawning a new agent.
 */
export const KNOWLEDGE_LAYERS: KnowledgeLayer[] = [
  { id: "visual", emoji: "🎨", domain: "Visual Creation", expertise: "Guides Visual Creators: gallery building, pricing originals, prints, licensing, exhibitions, collectors.", status: "live" },
  { id: "music", emoji: "🎵", domain: "Music Creation", expertise: "Guides Music Creators: recording, publishing, distribution, live performance, merch, royalties.", status: "live" },
  { id: "finance", emoji: "💷", domain: "Finance", expertise: "Reads the Financial Center: receipts, splits, reserves, tax estimates — never invents a number.", status: "live" },
  { id: "commerce", emoji: "🛍", domain: "Commerce & Marketplace", expertise: "Products, services, pricing, fulfilment, buyer trust.", status: "live" },
  { id: "education", emoji: "🎓", domain: "Education", expertise: "Academy paths, project-based learning, certificates, streaks.", status: "live" },
  { id: "wellness", emoji: "🌿", domain: "Wellness", expertise: "Wellness businesses, client care, treatment pricing, booking rhythm.", status: "live" },
  { id: "fitness", emoji: "🏋🏾", domain: "Fitness", expertise: "Training businesses, programmes, memberships, retention.", status: "learning" },
  { id: "freight", emoji: "🚚", domain: "Freight Brokerage", expertise: "Loads, lanes, carriers, margins — shelved in the Future Business Vault until activated.", status: "planned" },
  { id: "real-estate", emoji: "🏠", domain: "Real Estate", expertise: "Listings, viewings, financing basics, local rules.", status: "planned" },
  { id: "healthcare", emoji: "🩺", domain: "Healthcare", expertise: "Practice operations only. Never clinical advice.", status: "planned" },
  { id: "legal", emoji: "⚖️", domain: "Legal Resources", expertise: "Points to real resources and records what exists. Never invents legal advice.", status: "planned" },
  { id: "travel", emoji: "✈️", domain: "Travel", expertise: "Itineraries, mobility, relocation stages inside Money Moves.", status: "planned" },
  { id: "agriculture", emoji: "🌱", domain: "Agriculture", expertise: "Growing cycles, yields, market days, produce pricing.", status: "planned" },
  { id: "construction", emoji: "🧱", domain: "Construction", expertise: "Quoting, materials, scheduling, site realities.", status: "planned" },
  { id: "hospitality", emoji: "🏝", domain: "Hospitality", expertise: "Guests, bookings, service standards — Frass Hill's own DNA.", status: "planned" },
];

export function layerById(id: string): KnowledgeLayer | undefined {
  return KNOWLEDGE_LAYERS.find((l) => l.id === id);
}

/**
 * Which knowledge layers a room activates. She changes expertise; the member
 * never changes assistants.
 */
const ROOM_LAYERS: { match: string[]; layers: string[] }[] = [
  { match: ["/gallery", "/workspace/gallery"], layers: ["visual"] },
  { match: ["/fv-studios", "/music-media", "/frass-radio"], layers: ["music"] },
  { match: ["/workspace/finance", "/financial", "/wallet", "/pay"], layers: ["finance"] },
  { match: ["/shop", "/marketplace", "/collections", "/product"], layers: ["commerce"] },
  { match: ["/academy", "/learn"], layers: ["education"] },
  { match: ["/health-wellness", "/wellness"], layers: ["wellness"] },
  { match: ["/money-moves", "/business"], layers: ["commerce", "finance"] },
];

export function layersForPath(pathname: string | null | undefined): KnowledgeLayer[] {
  const path = (pathname ?? "").toLowerCase();
  if (!path) return [];
  const entry = ROOM_LAYERS.find((r) => r.match.some((m) => path === m || path.startsWith(m)));
  if (!entry) return [];
  return entry.layers.map((id) => layerById(id)).filter(Boolean) as KnowledgeLayer[];
}

/** The single line Frassy uses if anyone asks which AI they're speaking to. */
export const WHICH_AI_ANSWER =
  "Same Frassy, every room. I just know more about this one.";
