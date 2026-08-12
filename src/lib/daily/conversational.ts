// ─────────────────────────────────────────────────────────────────────────────
// FRASS-5P000 — Conversational customization.
// Members never have to learn a dashboard editor. They tell Frassy what they
// want and she rearranges their Daily.
//
// FRASS-0500 — one sentence in, one change out. Never a settings tour.
// Frassy never reorganises anything the member did not ask for.
// ─────────────────────────────────────────────────────────────────────────────

import {
  ALL_SECTION_IDS,
  DAILY_DESIGNS,
  DAILY_SECTIONS,
  SECTION_BY_ID,
  applyDesign,
  defaultPrefs,
  type DailyPrefs,
  type SectionId,
} from "./customization";

export type CustomizationResult = {
  prefs: DailyPrefs;
  /** What Frassy says back — plain English, always confirming the change. */
  say: string;
};

function matchSection(said: string): SectionId | null {
  const text = said.toLowerCase();
  let best: { id: SectionId; len: number } | null = null;
  for (const meta of DAILY_SECTIONS) {
    const needles = [meta.label.toLowerCase(), ...meta.aliases];
    for (const n of needles) {
      if (text.includes(n) && (!best || n.length > best.len)) best = { id: meta.id, len: n.length };
    }
  }
  return best?.id ?? null;
}

function matchDesign(said: string) {
  const text = said.toLowerCase();
  return DAILY_DESIGNS.find((d) => text.includes(d.name.toLowerCase())) ?? null;
}

function without(list: SectionId[], id: SectionId) {
  return list.filter((x) => x !== id);
}

function moveTo(order: SectionId[], id: SectionId, position: "top" | "bottom" | "up" | "down") {
  const base = order.filter((x) => ALL_SECTION_IDS.includes(x));
  const rest = without(base, id);
  if (position === "top") return [id, ...rest];
  if (position === "bottom") return [...rest, id];
  const i = base.indexOf(id);
  if (i < 0) return [id, ...rest];
  const j = position === "up" ? Math.max(0, i - 1) : Math.min(base.length - 1, i + 1);
  const next = [...rest];
  next.splice(j, 0, id);
  return next;
}

/**
 * Interpret a member's plain-English request about their own Daily.
 * Returns null when the sentence isn't about layout at all, so the caller can
 * fall through to the normal Daily commands.
 */
export function customizeFromSpeech(said: string, prefs: DailyPrefs): CustomizationResult | null {
  const t = said.trim().toLowerCase();
  if (!t) return null;

  // Reset — nothing is ever permanently lost.
  if (/(reset|restore|start over|default|recommended layout)/.test(t) && /daily|layout|everything/.test(t)) {
    return {
      prefs: { ...defaultPrefs(), name: prefs.name },
      say: "Done — I've put your Daily back to the arrangement I recommend. Nothing was deleted; everything is exactly where it was.",
    };
  }

  // Pick a design from the library.
  const design = matchDesign(t);
  if (design && /(use|switch|try|change|give me|apply|like)/.test(t)) {
    return {
      prefs: applyDesign(prefs, design.id),
      say: `Switched you to the ${design.name} layout. Same Daily underneath — same Money Moves, same money, same everything. Say the word if you want a block moved.`,
    };
  }

  // Name my Daily.
  const named = /(call|name)\s+(?:my|this)\s+(?:daily|layout)\s+(?:"|“|')?([^"”']{2,40})/.exec(said);
  if (named) {
    const name = named[2].trim().replace(/[.!]$/, "");
    return { prefs: { ...prefs, name }, say: `Your Daily is now called "${name}".` };
  }

  // Simpler / show everything.
  if (/(simpler|simplify|too much|overwhelm|less on|only \w+ things|three things|fewer)/.test(t)) {
    const n = /only (one|two|three|four|five|\d+)/.exec(t)?.[1];
    const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    const count = n ? (words[n] ?? (Number(n) || 3)) : 3;
    return {
      prefs: { ...prefs, simplified: true, simplifiedCount: Math.max(1, Math.min(8, count)) },
      say: `Simplified. You'll see your top ${count} block${count === 1 ? "" : "s"} each morning and nothing else. Say "show me everything" whenever you want the rest back.`,
    };
  }
  if (/(show (me )?everything|full daily|all of it|more detail|unhide everything)/.test(t)) {
    return {
      prefs: { ...prefs, simplified: false, hidden: [] },
      say: "Everything's back on screen.",
    };
  }

  // Text size, density, contrast, motion.
  if (/(bigger|larger|big text|increase (the )?text|hard to read|can'?t see)/.test(t)) {
    const next = prefs.textSize === "normal" ? "large" : "largest";
    return { prefs: { ...prefs, textSize: next }, say: "Made everything bigger. Say 'make it smaller' if I overdid it." };
  }
  if (/(smaller|reduce (the )?text|less big)/.test(t)) {
    const next = prefs.textSize === "largest" ? "large" : "normal";
    return { prefs: { ...prefs, textSize: next }, say: "Brought the text back down." };
  }
  if (/(tighter|compact|closer together|denser|fit more)/.test(t)) {
    return { prefs: { ...prefs, density: "compact" }, say: "Tightened everything up so more fits on screen." };
  }
  if (/(roomier|more space|spacious|breathing room|spread out)/.test(t)) {
    return { prefs: { ...prefs, density: "spacious" }, say: "Given everything more room to breathe." };
  }
  if (/(contrast|easier to see|brighter text)/.test(t)) {
    return {
      prefs: { ...prefs, highContrast: !prefs.highContrast },
      say: prefs.highContrast ? "Contrast back to normal." : "Turned on high contrast.",
    };
  }
  if (/(stop (the )?(motion|animation)|less movement|no animation|still)/.test(t)) {
    return { prefs: { ...prefs, reducedMotion: true }, say: "Motion turned off across your Daily." };
  }

  // Everything below needs a target block.
  const id = matchSection(t);
  if (!id) return null;
  const label = SECTION_BY_ID[id].label;

  if (/(hide|remove|take (it )?off|don'?t (want|show)|get rid)/.test(t)) {
    return {
      prefs: { ...prefs, hidden: [...without(prefs.hidden, id), id], pinned: without(prefs.pinned, id) },
      say: `Hidden ${label}. Nothing was deleted — say "show me ${label}" and it comes straight back.`,
    };
  }
  if (/(show|unhide|bring back|add)/.test(t)) {
    return {
      prefs: { ...prefs, hidden: without(prefs.hidden, id) },
      say: `${label} is back on your Daily.`,
    };
  }
  if (/\bpin\b/.test(t)) {
    return {
      prefs: { ...prefs, pinned: [...without(prefs.pinned, id), id], hidden: without(prefs.hidden, id) },
      say: `Pinned ${label} to the top. It stays there every morning.`,
    };
  }
  if (/unpin/.test(t)) {
    return { prefs: { ...prefs, pinned: without(prefs.pinned, id) }, say: `Unpinned ${label}.` };
  }
  if (/(collapse|fold|shrink|make .* smaller)/.test(t)) {
    return {
      prefs: { ...prefs, collapsed: [...without(prefs.collapsed, id), id] },
      say: `${label} is folded down to its heading. Tap it any time to open it.`,
    };
  }
  if (/(expand|open|bigger|unfold)/.test(t)) {
    return { prefs: { ...prefs, collapsed: without(prefs.collapsed, id) }, say: `${label} is open again.` };
  }
  if (/(top|first|higher|up|beginning|before everything)/.test(t)) {
    return {
      prefs: { ...prefs, order: moveTo(prefs.order, id, /higher|\bup\b/.test(t) ? "up" : "top"), hidden: without(prefs.hidden, id) },
      say: `Moved ${label} ${/higher|\bup\b/.test(t) ? "up" : "to the top"}.`,
    };
  }
  if (/(bottom|last|lower|down|end)/.test(t)) {
    return {
      prefs: { ...prefs, order: moveTo(prefs.order, id, /lower|\bdown\b/.test(t) ? "down" : "bottom") },
      say: `Moved ${label} ${/lower|\bdown\b/.test(t) ? "down" : "to the bottom"}.`,
    };
  }

  return null;
}

/** Examples shown to the member — the whole editor, in six sentences. */
export const CUSTOMIZATION_EXAMPLES = [
  "Move my Financial Center to the top",
  "I only want to see three things every morning",
  "Hide the daily performance block",
  "Pin my journal",
  "Make everything bigger",
  "Call my Daily 'Morning Dashboard'",
];
