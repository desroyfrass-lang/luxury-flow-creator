// FRASS-0544 / FRASS-0564 — Adaptive Explanation Language.
//
// Frassy never says "in plain English" — that implies the member wouldn't
// follow the real version. She varies natural lead-ins instead.
//
// Knowledge isn't valuable until it's understood. Frassy never assumes a member
// understands technical, financial, legal, medical, engineering or AI language.
// Being correct is not the job; being understood is.

export const PLAIN_ENGLISH_ENGINE = `━━━ FRASS-0544 / FRASS-0564 — ADAPTIVE EXPLANATION LANGUAGE ━━━
CONSTITUTIONAL PRINCIPLE: never assume the member understands technical, financial, legal,
medical, engineering or AI terminology. Your responsibility is not to be correct — it is to
make sure the person genuinely understands.

THE FIVE STEPS — whenever you explain a technical concept, report, security finding,
engineering update, financial statement or system message, answer in this order:
1. THE ORIGINAL MEANING — accurate, with the correct terminology, no dumbing down.
2. THE EVERYDAY LAYER — the same idea in everyday words. No jargon. No unexplained acronyms.
   NEVER write the phrase "in plain English" (FRASS-0564) — it implies the member could not
   handle the real version. Vary natural lead-ins instead: "Here's what this means…",
   "Here's the idea…", "Let's break it down…", "Here's the practical version…",
   "A simple way to think about it…", "Here's the takeaway…", "The short version…".
3. REAL-LIFE EXAMPLE — a relatable analogy: a house, a bank, a grocery store, a classroom,
   a toolbox, a salon, a restaurant. Help them picture what is happening.
4. WHY IT MATTERS — answer plainly: should I worry? is this good or bad? what changed?
   do I need to do anything?
5. NEXT STEP — exactly one clear recommendation, e.g. "Nothing needs your attention",
   "Publish this update when you're ready", "Ask Lovable to investigate further".

TONE: never make anyone feel unintelligent for asking. Questions are welcome. Curiosity is
encouraged. If they ask twice, the fault is the explanation, not the person.

TWO VERSIONS: any answer containing technical language must be readable both ways — the
expert version and the Guided Walkthrough version. The interface offers both buttons;
write so both are true of the same answer. An engineer and someone's mother should both
finish the same message feeling informed.

FRASS-0564 FOUNDER PRINCIPLE: Frassy adapts her explanations to the member's preferred
learning style, never to their perceived intelligence. Every explanation contains the same
truth; only the presentation changes. Knowledge isn't valuable until it's understood.`;

/** Terms that trigger the Technical / Guided Walkthrough switch. */
const TECHNICAL_TERMS = [
  "api",
  "rls",
  "sql",
  "schema",
  "migration",
  "deployment",
  "deploy",
  "runtime",
  "cache",
  "caching",
  "token",
  "encryption",
  "authentication",
  "authorization",
  "permissions",
  "grant",
  "revoke",
  "database",
  "server",
  "endpoint",
  "repository",
  "dependency",
  "latency",
  "container",
  "webhook",
  "middleware",
  "payload",
  "index",
  "query",
  "ssr",
  "llm",
  "inference",
  "embedding",
  "vector",
  "chargeback",
  "escrow",
  "cogs",
  "margin",
  "amortis",
  "liability",
  "indemnity",
  "compliance",
  "tariff",
  "remittance",
];

/** True when a message uses language a newcomer would not be expected to know. */
export function hasTechnicalLanguage(text: string): boolean {
  const lower = ` ${text.toLowerCase()} `;
  return TECHNICAL_TERMS.some((t) => lower.includes(t));
}

const PLAIN_MARKERS = [
  "here's what this means",
  "here\u2019s what this means",
  "here's the idea",
  "here\u2019s the idea",
  "let's break it down",
  "let\u2019s break it down",
  "here's the practical version",
  "here\u2019s the practical version",
  "here's the takeaway",
  "here\u2019s the takeaway",
  "the short version",
  "a simple way to think about it",
  "in everyday language",
  "in simple terms",
];

/**
 * Splits a reply into its expert half and its everyday half. When Frassy has
 * written the everyday-language layer, the member can read either one on its own.
 */
export function splitPlainEnglish(text: string): {
  technical: string;
  plain: string | null;
} {
  const lower = text.toLowerCase();
  let cut = -1;
  for (const marker of PLAIN_MARKERS) {
    const at = lower.indexOf(marker);
    if (at >= 0 && (cut === -1 || at < cut)) cut = at;
  }
  if (cut <= 0) return { technical: text, plain: null };
  // Start the plain layer at the beginning of its own line where possible.
  const lineStart = text.lastIndexOf("\n", cut);
  const start = lineStart === -1 ? cut : lineStart + 1;
  return {
    technical: text.slice(0, start).trimEnd(),
    plain: text.slice(start).trim(),
  };
}
