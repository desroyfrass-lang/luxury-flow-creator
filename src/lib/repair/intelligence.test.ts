import { expect, test } from "vitest";
import { analyzePlatform } from "@/lib/repair/intelligence";
const mk = (n: number, o: Partial<any> = {}) =>
  Array.from({ length: n }, (_, i) => ({
    id: `i${i}${o.pattern_signature ?? ""}`,
    category: "routing", severity: "high", status: "escalated",
    context_path: "/onboarding", reported_text: "onboarding page 404",
    root_cause: "Route missing from deployment",
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    pattern_signature: "route:onboarding:404", resolution_mode: null, amendment_ref: null,
    evidence: { client: { browser: "Safari", device: "phone" } },
    ...o,
  }));
test("recurring pattern produces an amendment recommendation", () => {
  const r = analyzePlatform(mk(6));
  expect(r.topRecurring[0]?.occurrences).toBe(6);
  expect(r.recommendations.some((x) => x.kind === "constitutional_amendment")).toBe(true);
  expect(r.supportHeavy[0]?.area).toBe("Onboarding");
  expect(r.clientPattern[0]?.client).toBe("Safari · phone");
  expect(r.headline).toContain("same problem");
});
test("empty history is quiet", () => {
  const r = analyzePlatform([]);
  expect(r.recommendations).toHaveLength(0);
  expect(r.headline).toContain("Quiet");
});
test("an amendment that ended a problem is credited", () => {
  const r = analyzePlatform(mk(3, { amendment_ref: "FRASS-0514" }));
  expect(r.amendmentsThatWorked[0]?.ref).toBe("FRASS-0514");
});
