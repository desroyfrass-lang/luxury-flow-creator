import { describe, expect, it } from "vitest";
import { A1_CLEAN_ENGINE, a1StoragePaths, isAcceptedA1Audio } from "./a1-clean";

describe("FRASS Native A1 Clean", () => {
  it("identifies the real Frass-native machine", () => {
    expect(A1_CLEAN_ENGINE).toEqual(expect.objectContaining({ type: "frass_native", version: "1.0.0", runtime: "browser" }));
  });
  it("accepts supported real audio and rejects missing, oversized, or non-audio input", () => {
    expect(isAcceptedA1Audio("audio/wav", 44)).toBe(true);
    expect(isAcceptedA1Audio("audio/mpeg", 1024)).toBe(true);
    expect(isAcceptedA1Audio("video/mp4", 1024)).toBe(false);
    expect(isAcceptedA1Audio("audio/wav", 0)).toBe(false);
    expect(isAcceptedA1Audio("audio/wav", 21 * 1024 * 1024)).toBe(false);
  });
  it("keeps source and output as distinct owner-scoped objects", () => {
    const paths = a1StoragePaths("owner", "job");
    expect(paths.source).not.toBe(paths.output);
    expect(paths.source).toMatch(/^owner\/job\//);
    expect(paths.output).toMatch(/^owner\/job\//);
  });
});