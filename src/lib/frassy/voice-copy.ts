// FRASS-0583 — Frassy's Voice: one copy layer for the whole platform.
//
// Every partner-facing word Frassy says on screen comes from
// `locales/frassy-en.json` through this module. No component writes its own
// greeting, confirmation, empty state or trouble message again.
//
// Staged rollout: `voiceCopyEnabled()` is the single switch. When it is off,
// `t()` returns the caller's `fallback` (the wording that shipped before), so
// the whole layer can be turned off in one step without a redeploy.

import strings from "../../../locales/frassy-en.json";

export type Tier = "beginner" | "learner" | "intermediate" | "advanced";

/** Every interpolation token allowed inside a copy string. */
export const ALLOWED_TOKENS = new Set([
  "name",
  "moveName",
  "tierLabel",
  "months",
  "count",
  "pct",
  "styleName",
  "outfitName",
  "insight",
  "signal",
]);

export const VOICE_COPY_FLAG = "frass:voice-copy";

/** The rollout switch. On by default; a Founder can turn it off in the browser. */
export function voiceCopyEnabled(): boolean {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(VOICE_COPY_FLAG);
      if (raw === "off") return false;
      if (raw === "on") return true;
    }
  } catch {
    /* storage unavailable — fall through to the default */
  }
  return true;
}

export function setVoiceCopyEnabled(on: boolean) {
  try {
    window.localStorage.setItem(VOICE_COPY_FLAG, on ? "on" : "off");
    window.dispatchEvent(new Event("frass-voice-copy"));
  } catch {
    /* ignore */
  }
}

type Vars = Record<string, string | number | null | undefined>;

function interpolate(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, k)) {
      const val = vars[k];
      return val === null || val === undefined ? "" : String(val);
    }
    return `{${k}}`;
  });
}

/** Tidy the sentence when an optional name was left empty. */
function clean(text: string): string {
  return text
    .replace(/\s+,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/,\s*$/, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function lookup(key: string): string | undefined {
  let cur: unknown = strings;
  for (const part of key.split(".")) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

const warned = new Set<string>();

/**
 * The one way to put Frassy's words on screen.
 * `fallback` is the pre-existing wording, used when the rollout switch is off.
 */
export function t(key: string, vars?: Vars, fallback?: string): string {
  if (!voiceCopyEnabled() && fallback !== undefined) return clean(interpolate(fallback, vars ?? {}));
  const found = lookup(key);
  if (found === undefined) {
    if (import.meta.env?.DEV && !warned.has(key)) {
      warned.add(key);
      console.warn(`[frassy-voice] Missing copy key: ${key}`);
    }
    return fallback !== undefined ? clean(interpolate(fallback, vars ?? {})) : key;
  }
  return clean(interpolate(found, vars ?? {}));
}

const TIER_SUFFIX: Record<Tier, string> = {
  beginner: "_Beginner",
  learner: "_Learner",
  intermediate: "_Intermediate",
  advanced: "_Advanced",
};

/** Tier-aware lookup: `hero.heroFrassyNote` + tier, falling back to the base key. */
export function tForTier(keyBase: string, tier: Tier, vars?: Vars, fallback?: string): string {
  if (!voiceCopyEnabled() && fallback !== undefined) return clean(interpolate(fallback, vars ?? {}));
  const tierText = lookup(`${keyBase}${TIER_SUFFIX[tier]}`);
  if (tierText) return clean(interpolate(tierText, vars ?? {}));
  return t(keyBase, vars, fallback);
}

/** Every key in the pack, flattened — used by the tests and the copy lint. */
export function allCopyKeys(): { key: string; text: string }[] {
  const out: { key: string; text: string }[] = [];
  const walk = (obj: unknown, prefix: string) => {
    if (typeof obj === "string") {
      out.push({ key: prefix, text: obj });
      return;
    }
    if (typeof obj === "object" && obj !== null) {
      for (const k of Object.keys(obj as Record<string, unknown>)) {
        walk((obj as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k);
      }
    }
  };
  walk(strings, "");
  return out;
}

/** CI placeholder QA — returns every string using a token we don't support. */
export function validateTokens(): { key: string; tokens: string[] }[] {
  const bad: { key: string; tokens: string[] }[] = [];
  for (const { key, text } of allCopyKeys()) {
    const tokens = Array.from(text.matchAll(/\{(\w*)\}/g)).map((m) => m[1]);
    const invalid = tokens.filter((tok) => !tok || !ALLOWED_TOKENS.has(tok));
    if (invalid.length) bad.push({ key, tokens: invalid });
  }
  return bad;
}

export default { t, tForTier, validateTokens, allCopyKeys, ALLOWED_TOKENS };
