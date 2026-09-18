import { describe, expect, it } from "vitest";
import {
  RESULT_KINDS,
  RESULT_KIND_SPECS,
  isWorkResultKind,
  readWorkResult,
  resultStatus,
} from "./work-result";

describe("work result contract", () => {
  it("only accepts known result kinds", () => {
    expect(isWorkResultKind("hidden-asset")).toBe(true);
    expect(isWorkResultKind("money-earned")).toBe(false);
    expect(isWorkResultKind(null)).toBe(false);
  });

  it("every kind can prove ownership one way or the other", () => {
    for (const kind of RESULT_KINDS) {
      const spec = RESULT_KIND_SPECS[kind];
      expect(Boolean(spec.ownerColumn) || Boolean(spec.ownerVia)).toBe(true);
      expect(spec.table.length).toBeGreaterThan(0);
    }
  });

  it("ignores half-written or malformed results", () => {
    expect(readWorkResult({ result_kind: "hidden-asset", result_ref: null })).toBeNull();
    expect(readWorkResult({ result_kind: "nonsense", result_ref: "abc" })).toBeNull();
    expect(readWorkResult({ result_kind: "hidden-asset", result_ref: "abc" })?.ref).toBe("abc");
  });

  it("never claims money in any wording", () => {
    const banned = /earn|paid|verified|settled|commission|cleared/i;
    for (const kind of RESULT_KINDS) {
      const spec = RESULT_KIND_SPECS[kind];
      expect(spec.label).not.toMatch(banned);
      // the notes may say what has NOT happened, but never assert income
      expect(spec.note).not.toMatch(/you (earned|were paid)/i);
    }
    const s = resultStatus({ kind: "card-listing", ref: "x", label: "Chrome tee" });
    expect(s.label).toContain("Chrome tee");
    expect(s.href).toBe("/workspace/wallet?section=sell");
  });
});
