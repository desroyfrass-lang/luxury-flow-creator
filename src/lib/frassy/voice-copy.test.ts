// FRASS-0583 — the voice pack polices itself.

import { describe, expect, it } from "vitest";
import { ALLOWED_TOKENS, allCopyKeys, t, tForTier, validateTokens } from "@/lib/frassy/voice-copy";

const BANNED = [
  "Error:",
  "Task completed successfully",
  "Submit",
  " AI ",
  "system",
  "agent",
  "automation",
  "invalid input",
  "processing request",
];

describe("Frassy voice pack", () => {
  it("uses only supported placeholders", () => {
    expect(validateTokens()).toEqual([]);
  });

  it("has no empty or unknown tokens", () => {
    for (const { key, text } of allCopyKeys()) {
      for (const m of text.matchAll(/\{(\w*)\}/g)) {
        expect(ALLOWED_TOKENS.has(m[1]), `${key} uses {${m[1]}}`).toBe(true);
      }
      expect(text.includes("{missing}"), key).toBe(false);
      expect(text.trim().length, key).toBeGreaterThan(0);
    }
  });

  it("never speaks like generic software", () => {
    for (const { key, text } of allCopyKeys()) {
      for (const phrase of BANNED) {
        expect(text.toLowerCase().includes(phrase.toLowerCase()), `${key}: "${phrase}"`).toBe(
          false,
        );
      }
    }
  });

  it("interpolates and tidies a missing name", () => {
    expect(t("hero.heroFinishedTitle", { moveName: "Affiliate Page", name: "Kanko" })).toBe(
      "Affiliate Page is finished, Kanko",
    );
    expect(t("hero.heroFinishedTitle", { moveName: "Affiliate Page", name: "" })).toBe(
      "Affiliate Page is finished.",
    );
  });

  it("returns the tier line, then falls back to the base line", () => {
    expect(tForTier("hero.heroFrassyNote", "beginner", { moveName: "Funnel", name: "Kanko" })).toContain(
      "no stress",
    );
    expect(tForTier("hero.heroButtonLaunch", "advanced")).toBe("Make it live");
  });

  it("falls back to the previous wording for an unknown key", () => {
    expect(t("nope.not.here", undefined, "Old wording")).toBe("Old wording");
  });
});
