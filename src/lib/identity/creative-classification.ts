/**
 * FRASS-0495 — Creative Identity Classification.
 *
 * "One word. One meaning."
 *
 * The generic word "artist" is overloaded. A painter and a producer both call
 * themselves artists, and they need completely different ecosystems, tools and
 * Money Moves. This module is the single vocabulary Frassy, onboarding, search,
 * badges and profile labels all read from.
 *
 * FRASS-0494 compliance: this creates no new identity system. It is terminology
 * for the existing Builder Identity, Frass Card, Money Moves and Business Vault
 * engines.
 */

export const CLASSIFICATION_PRINCIPLE =
  "Frass recognizes creators by the work they bring into the world. Clear identity creates better guidance, better businesses, and better experiences.";

export const CLASSIFICATION_PLAIN_ENGLISH =
  "Let's break it down: 'artist' is like saying 'I work with my hands' — true, but it doesn't tell anybody which door to open. A painter needs a gallery. A producer needs a studio. Same respect, different building.";

export const CLASSIFICATION_LAW =
  "The generic term 'Artist' is never used as a primary member classification when a more specific discipline exists. Members are identified by what they create.";

export type CreativeClassId = "visual-creator" | "music-creator";

export type CreativeClass = {
  id: CreativeClassId;
  emoji: string;
  label: string;
  /** Plain description shown on profiles, filters and badges. */
  description: string;
  /** Everyday words members actually use for themselves. */
  examples: string[];
  /** The one ecosystem this classification belongs to. */
  ecosystem: { name: string; href: string };
  /** Money Moves pathways. These never cross over. */
  moneyMoves: string[];
  cues: RegExp;
};

export const CREATIVE_CLASSES: CreativeClass[] = [
  {
    id: "visual-creator",
    emoji: "🎨",
    label: "Visual Creator",
    description: "Members who create visual works.",
    examples: [
      "Painters",
      "Illustrators",
      "Sketch artists",
      "Digital artists",
      "Sculptors",
      "Fine artists",
      "Photographers",
      "NFT artists",
      "Mixed-media creators",
    ],
    ecosystem: { name: "Frass Gallery", href: "/workspace/gallery" },
    moneyMoves: ["Gallery", "Original artwork", "Prints", "Licensing", "Exhibitions", "NFTs"],
    cues: /paint|painter|illustrat|sketch|draw(ing)?|sculpt|ceramic|pottery|photograph|photo|fine art|mixed media|collage|digital art|procreate|nft|canvas|mural|gallery/i,
  },
  {
    id: "music-creator",
    emoji: "🎵",
    label: "Music Creator",
    description: "Members who create music.",
    examples: [
      "Singers",
      "Songwriters",
      "Producers",
      "DJs",
      "Bands",
      "Instrumentalists",
      "Composers",
      "Vocalists",
      "Recording artists",
    ],
    ecosystem: { name: "FV Studios", href: "/fv-studios" },
    moneyMoves: [
      "Recording",
      "Publishing",
      "Distribution",
      "Live performances",
      "Merchandise",
      "Royalties",
    ],
    cues: /music|sing(er|ing)?|songwrit|produc(er|ing) (beats|music)|beatmak|\bdj\b|band\b|instrument|guitar|piano|keys|drums|compos(er|ing)|vocal|rapper|record(ing)? artist|studio session|mixtape|album|\bep\b|track/i,
  },
];

export function creativeClass(id: CreativeClassId): CreativeClass {
  return CREATIVE_CLASSES.find((c) => c.id === id)!;
}

/** The word on its own, with nothing else to go on. Never assume. */
const BARE_ARTIST = /\bartist(e|ry|s)?\b/i;

export type ClassificationResult =
  | { status: "resolved"; classification: CreativeClass }
  | { status: "ambiguous"; question: string; heard: string }
  | { status: "unknown" };

/**
 * Reads what a member said about themselves and returns either a clear
 * classification or the clarifying question Frassy should ask.
 *
 * She NEVER guesses. "I'm an artist" always produces a question.
 */
export function classifyCreative(text: string): ClassificationResult {
  const input = (text ?? "").trim();
  if (!input) return { status: "unknown" };

  const matches = CREATIVE_CLASSES.filter((c) => c.cues.test(input));
  if (matches.length === 1) return { status: "resolved", classification: matches[0]! };
  if (matches.length > 1) {
    return {
      status: "ambiguous",
      heard: input,
      question:
        "Sounds like you work across more than one craft. Which one do you want me to build the business around first — visual work or music?",
    };
  }
  if (BARE_ARTIST.test(input)) {
    return { status: "ambiguous", heard: input, question: CLARIFYING_QUESTION };
  }
  return { status: "unknown" };
}

export const CLARIFYING_QUESTION =
  "Wonderful. What kind of creative work do you do? Visual art, music, or another creative field?";

/**
 * Existing members: migrate only when it is safe to determine. Where it isn't,
 * the stored value stays exactly as it is until the member updates it.
 */
export function safeMigration(
  stored: string | null | undefined,
  evidence?: string,
): { classification: CreativeClassId | null; keepExisting: boolean; reason: string } {
  const raw = (stored ?? "").trim();
  if (!raw) return { classification: null, keepExisting: true, reason: "Nothing stored yet." };
  if (!BARE_ARTIST.test(raw)) {
    return { classification: null, keepExisting: true, reason: "Already specific — leave it alone." };
  }
  const result = classifyCreative(`${raw} ${evidence ?? ""}`);
  if (result.status === "resolved") {
    return {
      classification: result.classification.id,
      keepExisting: false,
      reason: `Evidence clearly shows ${result.classification.label.toLowerCase()} work.`,
    };
  }
  return {
    classification: null,
    keepExisting: true,
    reason: "Cannot be determined safely. Keep the existing value until the member updates their profile.",
  };
}

/**
 * Search & discovery: "artist" must find both ecosystems, while each result
 * still shows its own proper classification.
 */
export function expandCreativeSearch(query: string): {
  classifications: CreativeClassId[];
  note: string | null;
} {
  if (BARE_ARTIST.test(query)) {
    return {
      classifications: ["visual-creator", "music-creator"],
      note: "Showing Visual Creators and Music Creators — Frass lists everyone by their craft.",
    };
  }
  const hits = CREATIVE_CLASSES.filter((c) => c.cues.test(query)).map((c) => c.id);
  return { classifications: hits, note: null };
}

/* ── Other overloaded labels ────────────────────────────────────────────────
 * One profession should map to one clear business path. These are the next
 * broad labels that need the same treatment; Frassy already clarifies them
 * rather than assuming.
 */

export type OverloadedLabel = { generic: string; specifics: string[]; question: string };

export const OVERLOADED_LABELS: OverloadedLabel[] = [
  {
    generic: "Artist",
    specifics: ["Visual Creator", "Music Creator"],
    question: CLARIFYING_QUESTION,
  },
  {
    generic: "Coach",
    specifics: ["Business Coach", "Fitness Coach", "Life Coach", "Career Coach"],
    question: "What kind of coaching do you do — business, fitness, life or career?",
  },
  {
    generic: "Writer",
    specifics: ["Author", "Copywriter", "Screenwriter", "Blogger"],
    question: "What kind of writing — books, copy for businesses, screen work, or your own blog?",
  },
  {
    generic: "Designer",
    specifics: ["Graphic Designer", "Fashion Designer", "Interior Designer", "UX Designer"],
    question: "What do you design — graphics, fashion, interiors or digital products?",
  },
];

export function clarifyOverloaded(text: string): OverloadedLabel | null {
  const input = (text ?? "").toLowerCase();
  return (
    OVERLOADED_LABELS.find((l) => {
      const generic = new RegExp(`\\b${l.generic.toLowerCase()}s?\\b`);
      if (!generic.test(input)) return false;
      // Already specific? Then there is nothing to clarify.
      return !l.specifics.some((s) => input.includes(s.toLowerCase()));
    }) ?? null
  );
}
