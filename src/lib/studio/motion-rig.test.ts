import { describe, expect, it } from "vitest";
import { breathAt, breathTransform, MOTION_RIG_ENGINE, motionRigPaths } from "./motion-rig";
import { planOperations, routeToEngine } from "@/lib/studios/native-engines";

describe("FRASS Native Motion Rig", () => {
  it("breathing loop is seamless and subtle", () => {
    expect(breathAt(0)).toBeCloseTo(0);
    expect(breathAt(3)).toBeCloseTo(0);
    expect(breathAt(1.5)).toBeCloseTo(1);
    const peak = breathTransform(1.5);
    expect(peak.scaleY).toBeLessThan(1.02);
    expect(peak.scaleX).toBeLessThan(1.01);
  });

  it("stores output under the member and job", () => {
    expect(motionRigPaths("u", "j").output).toBe("u/j/idle-breathing.webm");
  });

  it("animation routes to the Motion Rig only when it is registered and on", () => {
    const rig = { id: "1", slug: MOTION_RIG_ENGINE.slug, label: "FRASS Native Motion Rig", capabilities: ["animation"], status: "available", enabled: true, engine_type: "frass_native", priority: 1 };
    const d = routeToEngine("animation", [rig]);
    expect(d.ok && d.engine.slug).toBe(MOTION_RIG_ENGINE.slug);
    expect(routeToEngine("animation", [{ ...rig, enabled: false }]).ok).toBe(false);
    expect(planOperations([{ key: "ai-animation" }], [rig]).runnable).toHaveLength(1);
  });
});
