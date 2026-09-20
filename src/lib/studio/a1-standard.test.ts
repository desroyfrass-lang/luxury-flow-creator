import { describe, expect, it } from "vitest";
import { A1_CHECKS, evaluateA1, a1StatusLine } from "./a1-standard";
import {
  CONTROL_DEPTHS,
  DEFAULT_CONTROL_DEPTH,
  controlDepth,
  describeDepthChange,
  isControlDepth,
} from "./control-depths";
import { suggestCompanionHandoff } from "./companion-workspace";

describe("A1 quality gate", () => {
  it("never approves without evidence", () => {
    const v = evaluateA1();
    expect(v.approved).toBe(false);
    expect(v.headline).not.toContain("APPROVED");
    expect(v.blocking).toHaveLength(A1_CHECKS.length);
    expect(a1StatusLine(v)).toContain("no quality claim");
  });

  it("names exactly what blocks approval", () => {
    const v = evaluateA1({ source: { state: "passed" }, "input-clean": { state: "passed" } });
    expect(v.approved).toBe(false);
    expect(v.passed).toEqual(["source", "input-clean"]);
    expect(v.blocking.map((b) => b.id)).toEqual(["picture", "sound", "rights", "master-file"]);
    expect(v.reachedStage).toBe("enhance");
  });

  it("approves only when every check passed", () => {
    const evidence = Object.fromEntries(
      A1_CHECKS.map((c) => [c.id, { state: "passed" as const }]),
    );
    const v = evaluateA1(evidence);
    expect(v.approved).toBe(true);
    expect(v.headline).toBe("A1 MASTER — APPROVED");
    expect(v.reachedStage).toBe("master");
  });

  it("treats unknown as blocked, not passed", () => {
    const v = evaluateA1({ "master-file": { state: "unknown" } });
    expect(v.approved).toBe(false);
  });
});

describe("control depths", () => {
  it("has exactly four depths of one project", () => {
    expect(CONTROL_DEPTHS.map((d) => d.id)).toEqual(["directed", "creator", "producer", "pro"]);
  });

  it("falls back to Directed for unknown values", () => {
    expect(isControlDepth("expert")).toBe(false);
    expect(controlDepth("expert").id).toBe(DEFAULT_CONTROL_DEPTH);
  });

  it("always allows moving between depths and guarantees nothing is lost", () => {
    const change = describeDepthChange("pro", "directed");
    expect(change.allowed).toBe(true);
    expect(change.guarantees.join(" ")).toContain("no restart");
  });
});

describe("companion workspace", () => {
  it("stays quiet during ordinary direction", () => {
    expect(
      suggestCompanionHandoff({ turns: 3, characters: 400, noOperationRequested: false }).suggest,
    ).toBe(false);
  });

  it("offers a handoff on long exploratory conversation", () => {
    const s = suggestCompanionHandoff({ turns: 12, characters: 5000, noOperationRequested: true });
    expect(s.suggest).toBe(true);
    if (s.suggest) expect(s.tool).toBeNull();
  });
});
