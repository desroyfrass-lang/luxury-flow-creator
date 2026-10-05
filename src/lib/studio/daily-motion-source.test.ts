import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import source from "@/assets/frassy-daily-seated-exact-original.png.asset.json";

describe("single Daily-source commissioning test", () => {
  it("uses the exact registered original and existing waived rig path only", () => {
    const ui = readFileSync("src/components/studio/motion-rig-test.tsx", "utf8");
    expect(source.asset_id).toBe("457d3037-6834-4df3-8990-e425e0be0c4b");
    expect(ui).toContain("renderIdleBreathing(dailyOriginal.url)");
    expect(ui).toContain("sourceAsset: dailyOriginal.original_filename");
    expect(ui).toContain("testWaiver: true");
    expect(ui).toContain("not approved for Daily attachment");
    expect(ui).not.toContain("seatedStudioLook");
    expect(ui).not.toContain("speechSynthesis");
  });
});