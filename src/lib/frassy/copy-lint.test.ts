// FRASS-0583 — the guard that stops generic software English creeping back in.
//
// Partner-facing screens must speak in Frassy's voice. Founder-only rooms
// (Control Room, admin, diagnostics) are allowed to be technical.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src/components", "src/routes"];

/** Founder-only and diagnostic surfaces — technical wording is fine there. */
const ALLOWLIST = [
  "control-room",
  "/founder",
  "founder-",
  "/admin",
  "admin.",
  "admin-",
  "audit",
  "teleporter",
  "security",
  "diagnostic",
  "debug",
  "/api/",
  "simulator",
  "release",
  "deploy",
  "lovable/email",
  "webhook",
];

/** Wording a partner must never read. */
const BANNED: { phrase: RegExp; why: string }[] = [
  { phrase: /"Error:/, why: 'say what happened, not "Error:"' },
  { phrase: /Task completed successfully/i, why: "no canned confirmations" },
  { phrase: />\s*Submit\s*</, why: 'name the action, not "Submit"' },
  { phrase: /Something went wrong\./, why: "use trouble.generic from the voice pack" },
  { phrase: /Failed to load/i, why: "use trouble.generic from the voice pack" },
  { phrase: /Invalid input/i, why: "explain it the way a person would" },
  { phrase: /Processing request/i, why: "use loading.generic from the voice pack" },
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full) && !full.endsWith(".test.ts")) out.push(full);
  }
  return out;
}

function partnerFacing(path: string): boolean {
  const p = path.toLowerCase();
  return !ALLOWLIST.some((frag) => p.includes(frag));
}

describe("partner-facing copy", () => {
  it("never uses generic software wording", () => {
    const offences: string[] = [];
    for (const root of ROOTS) {
      for (const file of walk(root)) {
        if (!partnerFacing(file)) continue;
        const source = readFileSync(file, "utf8");
        for (const { phrase, why } of BANNED) {
          if (phrase.test(source)) offences.push(`${file}: ${phrase} — ${why}`);
        }
      }
    }
    expect(offences, offences.join("\n")).toEqual([]);
  });
});
