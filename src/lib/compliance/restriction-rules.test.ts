import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parseRuleDraft, approvalBlockers } from "./restriction-rules";
import { COMMAND_SECTIONS } from "@/lib/founder/command-center";

const now = new Date("2026-10-09T00:00:00Z");
const base = { target_level: "listing", target_ref: "p1", country: "jm", effect: "prohibit", reason: "legal_prohibition", applies_to: "both" };

describe("restriction rule drafts", () => {
  it("accepts a valid draft and upper-cases the country", () => {
    const r = parseRuleDraft(base, now);
    expect(r.ok && r.draft.country).toBe("JM");
  });
  it("drops any client-supplied approval fields", () => {
    const r = parseRuleDraft({ ...base, approval: "approved", approved_by: "x" }, now);
    expect(r.ok && Object.keys(r.draft)).not.toContain("approval");
    expect(r.ok && Object.keys(r.draft)).not.toContain("approved_by");
  });
  it("rejects a bad country and a mismatched region", () => {
    expect(parseRuleDraft({ ...base, country: "JAM" }, now).ok).toBe(false);
    expect(parseRuleDraft({ ...base, country: "US", subdivision: "CA-ON" }, now).ok).toBe(false);
  });
  it("requires a minimum age for age rules", () => {
    expect(parseRuleDraft({ ...base, effect: "allow", reason: "age_gated" }, now).ok).toBe(false);
    expect(parseRuleDraft({ ...base, effect: "allow", reason: "age_gated", min_age: 18 }, now).ok).toBe(true);
  });
  it("legal bans cannot allow", () => {
    expect(parseRuleDraft({ ...base, effect: "allow" }, now).ok).toBe(false);
  });
  it("rejects future verified dates and expiry before verification", () => {
    expect(parseRuleDraft({ ...base, verified_at: "2027-01-01" }, now).ok).toBe(false);
    expect(parseRuleDraft({ ...base, verified_at: "2026-09-01", expires_at: "2026-08-01" }, now).ok).toBe(false);
  });
});

describe("approval blockers", () => {
  it("lists missing evidence and verified date", () => {
    expect(approvalBlockers({ evidence_source: "", evidence_reference: null, verified_at: null, expires_at: null, reason: "needs_review", min_age: null }, now)).toHaveLength(3);
  });
  it("is empty when evidence is complete", () => {
    expect(approvalBlockers({ evidence_source: "Customs Act", evidence_reference: "s.40", verified_at: "2026-09-01", expires_at: null, reason: "legal_prohibition", min_age: null }, now)).toEqual([]);
  });
});

describe("Control Room integration", () => {
  it("registers Global Restrictions inside Commissioning only", () => {
    const owners = COMMAND_SECTIONS.filter((s) => s.tools.some((t) => t.id === "global-restrictions")).map((s) => s.id);
    expect(owners).toEqual(["commissioning"]);
  });
  it("renders the panel on the Commissioning tab", () => {
    const src = readFileSync("src/routes/_authenticated/control-room.tsx", "utf8");
    expect(src).toMatch(/active === "commissioning"[\s\S]{0,200}<RestrictionsPanel \/>/);
  });
  it("decision server function goes through the database decision function", () => {
    const src = readFileSync("src/lib/compliance/restriction-rules.functions.ts", "utf8");
    expect(src).toContain('rpc("founder_decide_restriction_rule"');
    expect(src).not.toContain("supabaseAdmin");
  });
});
