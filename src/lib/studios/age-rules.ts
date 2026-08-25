// FRASS-0601 — Frassy Studios Build 2: the Age-Aware Content Engine.
//
// One place, and only one place, where age changes how a production is written.
// Nothing in the interface hard-codes "if age is 3-6". Every screen and every
// server function asks this file instead, so a rule changed here changes the
// whole studio at once.

export type AgeGroupId = "0-3" | "3-6" | "6-12" | "12-15" | "Teen" | "Adult" | "General Audience";

export type AgeRule = {
  id: AgeGroupId;
  label: string;
  /** Everyday sentence a Founder can read without translation. */
  plain: string;
  vocabulary: string;
  sentenceLength: string;
  storyComplexity: string;
  pace: string;
  educationalDepth: string;
  visualComplexity: string;
  repetition: string;
  musicIntensity: string;
  characterInteraction: string;
  /** Suggested runtime window in seconds. */
  durationSeconds: { min: number; ideal: number; max: number };
  /** Suggested scene count for a full production. */
  scenes: { min: number; max: number };
  /** Hard content limits Frassy must never cross for this group. */
  neverInclude: string[];
};

export const AGE_RULES: Record<AgeGroupId, AgeRule> = {
  "0-3": {
    id: "0-3",
    label: "Ages 0–3",
    plain: "Babies and toddlers. Very few words, said slowly, and said again.",
    vocabulary: "50–150 everyday words. Naming things, one idea at a time.",
    sentenceLength: "3–5 words per line.",
    storyComplexity: "No plot twists. One simple thing happens, and it feels good.",
    pace: "Very slow. Long, calm holds on screen.",
    educationalDepth: "Recognition only — colours, shapes, sounds, first numbers.",
    visualComplexity: "Big shapes, few objects, high contrast, plain backgrounds.",
    repetition: "Heavy. Repeat the key phrase at least three times.",
    musicIntensity: "Soft, gentle, low volume, no sudden sound.",
    characterInteraction: "One or two characters, speaking straight to the child.",
    durationSeconds: { min: 60, ideal: 180, max: 300 },
    scenes: { min: 3, max: 6 },
    neverInclude: ["Peril", "Conflict", "Loud or sudden sound", "Fast cutting", "Scary imagery"],
  },
  "3-6": {
    id: "3-6",
    label: "Ages 3–6",
    plain: "Little ones. Short, warm stories with one clear lesson.",
    vocabulary: "Simple everyday words. Explain any new word the moment it is used.",
    sentenceLength: "5–9 words per line.",
    storyComplexity: "One clear problem and one clear happy resolution.",
    pace: "Gentle, with pauses for the child to answer out loud.",
    educationalDepth: "One teaching idea for the whole episode. Show it, then say it.",
    visualComplexity: "Bright, friendly, uncluttered scenes.",
    repetition: "Strong. Repeat the lesson at the start, the middle and the end.",
    musicIntensity: "Playful and light. Never overwhelming.",
    characterInteraction: "2–4 characters. Kind, patient, encouraging.",
    durationSeconds: { min: 180, ideal: 420, max: 720 },
    scenes: { min: 5, max: 10 },
    neverInclude: ["Real danger", "Meanness without repair", "Sarcasm", "Frightening imagery"],
  },
  "6-12": {
    id: "6-12",
    label: "Ages 6–12",
    plain: "School age. Real stories with humour and something worth learning.",
    vocabulary: "Everyday language with a few stretch words, explained in context.",
    sentenceLength: "8–15 words per line.",
    storyComplexity: "Beginning, problem, attempt, setback, resolution.",
    pace: "Lively, with room for jokes and reactions.",
    educationalDepth: "A real skill or idea the child can use the same day.",
    visualComplexity: "Detailed scenes, expressive characters, varied camera work.",
    repetition: "Light. Restate the point once at the end.",
    musicIntensity: "Energetic where it earns it, calm underneath dialogue.",
    characterInteraction: "Group dynamics, friendship, teamwork, gentle rivalry.",
    durationSeconds: { min: 300, ideal: 600, max: 900 },
    scenes: { min: 8, max: 16 },
    neverInclude: ["Graphic violence", "Adult themes", "Cruelty played for laughs"],
  },
  "12-15": {
    id: "12-15",
    label: "Ages 12–15",
    plain: "Older kids and young teens. Honest stories, real stakes, still safe.",
    vocabulary: "Natural teen speech. No talking down.",
    sentenceLength: "10–20 words per line.",
    storyComplexity: "Layered story with a subplot and a genuine choice.",
    pace: "Quick, modern, edit-forward.",
    educationalDepth: "Real-world depth: money, work, identity, responsibility.",
    visualComplexity: "Cinematic. Full range of shots and lighting.",
    repetition: "Minimal. Trust them.",
    musicIntensity: "Full dynamic range.",
    characterInteraction: "Real relationships, disagreement, repair.",
    durationSeconds: { min: 420, ideal: 900, max: 1500 },
    scenes: { min: 10, max: 22 },
    neverInclude: ["Explicit content", "Substance glamorisation", "Self-harm depiction"],
  },
  Teen: {
    id: "Teen",
    label: "Teen",
    plain: "Teenagers. Grown conversation without adult content.",
    vocabulary: "Contemporary and direct.",
    sentenceLength: "10–24 words per line.",
    storyComplexity: "Full dramatic structure.",
    pace: "Modern and confident.",
    educationalDepth: "Practical and ambitious.",
    visualComplexity: "Cinematic.",
    repetition: "None required.",
    musicIntensity: "Full dynamic range.",
    characterInteraction: "Complex and honest.",
    durationSeconds: { min: 420, ideal: 900, max: 1800 },
    scenes: { min: 10, max: 24 },
    neverInclude: ["Explicit content"],
  },
  Adult: {
    id: "Adult",
    label: "Adult",
    plain: "Grown audience. No content restrictions beyond brand standards.",
    vocabulary: "Unrestricted within Frass brand standards.",
    sentenceLength: "Natural.",
    storyComplexity: "Unrestricted.",
    pace: "As the story needs.",
    educationalDepth: "As deep as the subject requires.",
    visualComplexity: "Cinematic.",
    repetition: "None required.",
    musicIntensity: "Full dynamic range.",
    characterInteraction: "Unrestricted within brand standards.",
    durationSeconds: { min: 300, ideal: 900, max: 3600 },
    scenes: { min: 8, max: 40 },
    neverInclude: [],
  },
  "General Audience": {
    id: "General Audience",
    label: "General Audience",
    plain: "Everybody. Safe for a family room, still interesting for an adult.",
    vocabulary: "Plain, warm, universal.",
    sentenceLength: "8–18 words per line.",
    storyComplexity: "Clear story anybody can follow.",
    pace: "Steady and welcoming.",
    educationalDepth: "Useful without being heavy.",
    visualComplexity: "Rich but readable.",
    repetition: "Restate the point once.",
    musicIntensity: "Warm and supportive.",
    characterInteraction: "Kind and inclusive.",
    durationSeconds: { min: 180, ideal: 600, max: 1200 },
    scenes: { min: 6, max: 18 },
    neverInclude: ["Explicit content", "Graphic violence"],
  },
};

export function ageRuleFor(group: string | null | undefined): AgeRule {
  const key = (group ?? "General Audience") as AgeGroupId;
  return AGE_RULES[key] ?? AGE_RULES["General Audience"];
}

/** The block of writing rules handed to Frassy for a given age group. */
export function ageDirectiveFor(group: string | null | undefined): string {
  const r = ageRuleFor(group);
  return [
    `AUDIENCE AGE GROUP: ${r.label} — ${r.plain}`,
    `Vocabulary: ${r.vocabulary}`,
    `Sentence length: ${r.sentenceLength}`,
    `Story complexity: ${r.storyComplexity}`,
    `Pace: ${r.pace}`,
    `Educational depth: ${r.educationalDepth}`,
    `Visual complexity: ${r.visualComplexity}`,
    `Repetition: ${r.repetition}`,
    `Music intensity: ${r.musicIntensity}`,
    `Character interaction: ${r.characterInteraction}`,
    `Target runtime: about ${Math.round(r.durationSeconds.ideal / 60)} minutes (${r.durationSeconds.min}–${r.durationSeconds.max} seconds).`,
    `Scene count: ${r.scenes.min}–${r.scenes.max}.`,
    r.neverInclude.length ? `NEVER include: ${r.neverInclude.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
