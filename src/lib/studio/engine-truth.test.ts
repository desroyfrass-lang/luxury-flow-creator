import { describe, expect, it } from "vitest";
import {
  planOperations,
  routeToEngine,
  engineBoard,
  capabilityForOperation,
  engineOwnership,
  type EngineRow,
} from "@/lib/studios/native-engines";
import { decideCharge, chargeIdempotencyKey, phoneEnhancementHeadline } from "@/lib/studio/job-truth";
import { productionRef, needsCanonicalBridge, CANONICAL_PRODUCTION_TABLE } from "@/lib/studios/production-identity";

const engine = (over: Partial<EngineRow>): EngineRow => ({
  id: "1",
  slug: "e",
  label: "Engine",
  capabilities: ["image"],
  status: "available",
  enabled: true,
  engine_type: "external_fallback",
  priority: 10,
  founder_preferred: false,
  ...over,
});

describe("native-first routing", () => {
  it("prefers a Frass-native engine over an available external one", () => {
    const decision = routeToEngine(
      "image",
      [
        engine({ id: "x", slug: "outside", label: "Outside", engine_type: "external_fallback", priority: 1 }),
        engine({ id: "n", slug: "frass-image", label: "Frass Image", engine_type: "frass_native", priority: 90 }),
      ],
      { allowExternalFallback: true },
    );
    expect(decision.ok).toBe(true);
    if (decision.ok) {
      expect(decision.ownership).toBe("frass_native");
      expect(decision.engine.slug).toBe("frass-image");
    }
  });

  it("uses an external engine only when explicitly permitted", () => {
    const engines = [engine({ slug: "outside", engine_type: "external_fallback" })];
    const refused = routeToEngine("image", engines);
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.state).toBe("external_not_permitted");

    const allowed = routeToEngine("image", engines, { allowExternalFallback: true });
    expect(allowed.ok).toBe(true);
    if (allowed.ok) expect(allowed.ownership).toBe("external_fallback");
  });

  it("reports NOT INSTALLED when no engine exists", () => {
    const decision = routeToEngine("music", [], { allowExternalFallback: true });
    expect(decision.ok).toBe(false);
    if (!decision.ok) {
      expect(decision.state).toBe("not_installed");
      expect(decision.reason).toContain("NOT INSTALLED");
    }
  });

  it("never treats a disabled or unavailable engine as usable", () => {
    const decision = routeToEngine("image", [
      engine({ engine_type: "frass_native", enabled: false }),
      engine({ engine_type: "frass_native", status: "disabled" }),
    ]);
    expect(decision.ok).toBe(false);
  });

  it("boards every machine honestly and defaults unknown rows to external", () => {
    const board = engineBoard([engine({ capabilities: ["text"] })]);
    expect(board.find((b) => b.capability === "video")?.headline).toBe("NOT INSTALLED");
    expect(board.find((b) => b.capability === "text")?.state).toBe("external_only");
    expect(engineOwnership({ ...engine({}), engine_type: null })).toBe("external_fallback");
  });

  it("maps studio operations onto the machine they need", () => {
    expect(capabilityForOperation("ai-video-generation")).toBe("video");
    expect(capabilityForOperation("voice-enhance")).toBe("audioRestoration");
    expect(capabilityForOperation("ai-master")).toBe("finishing");
    expect(capabilityForOperation("nonsense-op")).toBeNull();
  });
});

describe("credit truth", () => {
  const verified = {
    fileUrl: "https://assets.frass/master-01.mp4",
    engineSlug: "frass-video",
    ownership: "frass_native" as const,
    verifiedAt: new Date().toISOString(),
  };

  it("missing engine means no charge and never complete", () => {
    const d = decideCharge({ forecastCredits: 500, lifecycle: "awaiting_engine" });
    expect(d.charge).toBe(0);
    expect(d.status).toBe("blocked");
  });

  it("failed engine means no charge and never complete", () => {
    const d = decideCharge({ forecastCredits: 500, lifecycle: "failed" });
    expect(d.charge).toBe(0);
    expect(d.status).toBe("failed");
  });

  it("an approved forecast alone never charges", () => {
    const d = decideCharge({ forecastCredits: 500, lifecycle: "approved" });
    expect(d.charge).toBe(0);
    expect(d.status).toBe("waiting");
  });

  it("a queued job with no verified output never charges", () => {
    const d = decideCharge({ forecastCredits: 500, lifecycle: "running", output: { fileUrl: "" } });
    expect(d.charge).toBe(0);
    expect(d.status).toBe("waiting");
  });

  it("a verified output charges exactly once", () => {
    const first = decideCharge({ forecastCredits: 500, lifecycle: "verified", output: verified });
    expect(first.charge).toBe(500);
    expect(first.status).toBe("complete");

    const replay = decideCharge({
      forecastCredits: 500,
      lifecycle: "verified",
      output: verified,
      alreadyCharged: true,
    });
    expect(replay.charge).toBe(0);
    expect(replay.status).toBe("complete");
  });

  it("free and manual work stays free", () => {
    expect(decideCharge({ forecastCredits: 0, lifecycle: "approved" }).status).toBe("complete");
    expect(decideCharge({ forecastCredits: 900, lifecycle: "approved", free: true }).charge).toBe(0);
  });

  it("gives one stable idempotency key per job", () => {
    expect(chargeIdempotencyKey("abc")).toBe("studio-job:abc");
    expect(chargeIdempotencyKey("abc")).toBe(chargeIdempotencyKey("abc"));
  });

  it("Phone Content Mode never says Enhanced without a verified result", () => {
    expect(phoneEnhancementHeadline(decideCharge({ forecastCredits: 300, lifecycle: "awaiting_engine" }))).toContain(
      "NOT AVAILABLE",
    );
    expect(phoneEnhancementHeadline(decideCharge({ forecastCredits: 300, lifecycle: "approved" }))).toContain(
      "not enhanced yet",
    );
    expect(
      phoneEnhancementHeadline(
        decideCharge({ forecastCredits: 300, lifecycle: "verified", output: verified }),
      ),
    ).toContain("Enhanced");
  });
});

describe("canonical production identity", () => {
  it("resolves a linked project to the canonical production", () => {
    const ref = productionRef({ id: "p1", title: "One", production_id: "prod-1" });
    expect(ref.kind).toBe("canonical");
    expect(ref.table).toBe(CANONICAL_PRODUCTION_TABLE);
    if (ref.kind === "canonical") expect(ref.productionId).toBe("prod-1");
  });

  it("keeps an unlinked legacy project working and flags it for bridging", () => {
    const project = { id: "p2", title: "Two" };
    const ref = productionRef(project);
    expect(ref.kind).toBe("legacy_project");
    expect(needsCanonicalBridge(project)).toBe(true);
    expect(needsCanonicalBridge({ id: "p3", title: "Three", production_id: "prod-3" })).toBe(false);
  });
});


describe("machine independence — A1 Clean does not need mastering", () => {
  const restoration = engine({
    id: "a1",
    slug: "frass_a1_clean_web_audio_v1",
    label: "FRASS Native A1 Clean",
    capabilities: ["audioRestoration"],
    engine_type: "frass_native",
    priority: 1,
  });

  it("runs restoration even though the finishing machine is absent", () => {
    const plan = planOperations([{ key: "voice-enhance" }, { key: "phone-noise" }], [restoration]);
    expect(plan.decision.ok).toBe(true);
    if (plan.decision.ok) expect(plan.decision.ownership).toBe("frass_native");
    expect(plan.runnable.map((r) => r.key)).toEqual(["voice-enhance", "phone-noise"]);
    expect(plan.blocked).toHaveLength(0);
  });

  it("keeps a bundled mastering step out of the run and out of the bill", () => {
    const plan = planOperations([{ key: "voice-enhance" }, { key: "ai-master" }], [restoration]);
    expect(plan.decision.ok).toBe(true);
    expect(plan.runnable.map((r) => r.key)).toEqual(["voice-enhance"]);
    expect(plan.blocked[0]?.capability).toBe("finishing");
    expect(plan.blocked[0]?.reason).toContain("NOT INSTALLED");
  });

  it("still refuses a mastering-only request", () => {
    const plan = planOperations([{ key: "ai-master" }], [restoration]);
    expect(plan.decision.ok).toBe(false);
    expect(plan.runnable).toHaveLength(0);
  });

  it("reports an unmapped step honestly instead of guessing a machine", () => {
    const plan = planOperations([{ key: "nonsense-op" }], [restoration]);
    expect(plan.decision.ok).toBe(false);
    expect(plan.blocked[0]?.capability).toBeNull();
  });
});
