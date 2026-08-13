// FRASS-0545 — Adaptive Learning Levels.
//
// The information never changes. Only the depth of the explanation changes.
// Education adapts to the learner, never the other way around.

export type LearningLevel = "one_sentence" | "new" | "detailed" | "expert";

export type LearningLevelMeta = {
  id: LearningLevel;
  dot: string;
  label: string;
  purpose: string;
  /** How the member would say it in their own words. */
  memberVoice: string;
  /** Instruction handed to Frassy for this level. */
  instruction: string;
};

export const LEARNING_LEVELS: LearningLevelMeta[] = [
  {
    id: "one_sentence",
    dot: "🟢",
    label: "One Sentence",
    purpose: "Just the conclusion.",
    memberVoice: "Just tell me the answer.",
    instruction:
      "ONE SENTENCE: answer in a single clear sentence. Give the conclusion only — no background, no caveats, no lists.",
  },
  {
    id: "new",
    dot: "🔵",
    label: "Explain Like I'm New",
    purpose: "No previous knowledge assumed.",
    memberVoice: "I've never heard these terms before.",
    instruction:
      "EXPLAIN LIKE I'M NEW: assume zero prior knowledge. Everyday language, an analogy from ordinary life, step-by-step thinking, no jargon or unexplained acronyms.",
  },
  {
    id: "detailed",
    dot: "🟣",
    label: "Detailed",
    purpose: "How it actually works.",
    memberVoice: "I want to understand what's happening.",
    instruction:
      "DETAILED: give background, context, why this happens, the trade-offs involved, and a practical example. Technical terms are allowed but must be explained the first time.",
  },
  {
    id: "expert",
    dot: "⚫",
    label: "Expert",
    purpose: "Full technical detail.",
    memberVoice: "Give me all the technical details.",
    instruction:
      "EXPERT: full technical depth — architecture, data model, APIs, performance, security and best practice. Correct engineering terminology, no simplification.",
  },
];

export function levelMeta(level: LearningLevel): LearningLevelMeta {
  return LEARNING_LEVELS.find((l) => l.id === level) ?? LEARNING_LEVELS[1];
}

/** Constitutional prompt block sent with every conversation. */
export const LEARNING_LEVELS_ENGINE = `━━━ FRASS-0545 — ADAPTIVE LEARNING LEVELS ━━━
CONSTITUTIONAL PRINCIPLE: education adapts to the learner, not the learner to the education.
Every answer exists at four depths. The facts never change — only the depth changes.
${LEARNING_LEVELS.map((l) => `${l.dot} ${l.label} — ${l.instruction}`).join("\n")}

Honour the member's active level for every explanation, everywhere in Frass (Daily, Workshop,
Welcome Hall, Business Vaults, Money Moves, Knowledge Vault, Command Center, Control Room,
security, financial, analytics and AI reports, Blueprint discussions).

You may RECOMMEND a different level when it would help — for example "This has a lot of
technical terminology. Would you like me to switch to Explain Like I'm New?" or "You seem
comfortable with this now. Would you like more detail?" — but the member always chooses. Never
switch levels on your own, and never make anyone feel small for choosing a simpler level.`;

/** The line appended to the context block for the member's active level. */
export function learningLevelContext(level: LearningLevel): string {
  const meta = levelMeta(level);
  return `Active learning level: ${meta.label}. ${meta.instruction}`;
}

// ── Member preference (local, instant, changeable per conversation) ──────────

const KEY = "frassy:learning-level:v1";
export const DEFAULT_LEARNING_LEVEL: LearningLevel = "new";

export function loadLearningLevel(): LearningLevel {
  if (typeof window === "undefined") return DEFAULT_LEARNING_LEVEL;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw && LEARNING_LEVELS.some((l) => l.id === raw)) return raw as LearningLevel;
  } catch {
    /* noop */
  }
  return DEFAULT_LEARNING_LEVEL;
}

export function saveLearningLevel(level: LearningLevel) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, level);
    window.dispatchEvent(new CustomEvent("frassy:learning-level", { detail: level }));
  } catch {
    /* noop */
  }
}

/** Suggests a gentler or deeper level when the answer clearly sits at a different depth. */
export function recommendLevel(
  text: string,
  current: LearningLevel,
  technical: boolean,
): { level: LearningLevel; reason: string } | null {
  if (technical && (current === "detailed" || current === "expert")) return null;
  if (technical && current !== "new") {
    return {
      level: "new",
      reason: "This explanation contains a lot of technical terminology.",
    };
  }
  if (!technical && current === "one_sentence" && text.length > 600) {
    return { level: "detailed", reason: "There's more behind this answer if you want it." };
  }
  return null;
}
