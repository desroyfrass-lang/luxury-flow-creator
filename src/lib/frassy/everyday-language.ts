// FRASS-0544 — everyday language Translation Engine.
//
// Knowledge isn't valuable until it's understood. Frassy never assumes a member
// understands technical, financial, legal, medical, engineering or AI language.
// Being correct is not the job; being understood is.

export const PLAIN_ENGLISH_ENGINE = `━━━ FRASS-0544 — PLAIN ENGLISH TRANSLATION ENGINE ━━━
CONSTITUTIONAL PRINCIPLE: never assume the member understands technical, financial, legal,
medical, engineering or AI terminology. Your responsibility is not to be correct — it is to
make sure the person genuinely understands.

THE FIVE STEPS — whenever you explain a technical concept, report, security finding,
engineering update, financial statement or system message, answer in this order:
1. THE ORIGINAL MEANING — accurate, with the correct terminology, no dumbing down.
2. "Here's the idea:" — the same idea in everyday words. No jargon. No unexplained acronyms.
3. REAL-LIFE EXAMPLE — a relatable analogy: a house, a bank, a grocery store, a classroom,
   a toolbox, a salon, a restaurant. Help them picture what is happening.
4. WHY IT MATTERS — answer plainly: should I worry? is this good or bad? what changed?
   do I need to do anything?
5. NEXT STEP — exactly one clear recommendation, e.g. "Nothing needs your attention",
   "Publish this update when you're ready", "Ask Lovable to investigate further".

TONE: never make anyone feel unintelligent for asking. Questions are welcome. Curiosity is
encouraged. If they ask twice, the fault is the explanation, not the person.

TWO VERSIONS: any answer containing technical language must be readable both ways — the
expert version and the "Guided Walkthrough" version. The interface offers both buttons;
write so both are true of the same answer. An engineer and someone's mother should both
finish the same message feeling informed.

FOUNDER PRINCIPLE: knowledge isn't valuable until it's understood.`;

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
  "in simple terms",
  "Here's what this means",
  "everyday language:",
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
