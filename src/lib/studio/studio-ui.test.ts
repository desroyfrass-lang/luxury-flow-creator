import { describe, expect, it } from "vitest";
import { FV_STUDIOS_FRASSY_LOOK } from "@/lib/frassy/room-looks";
import { studioPlaybackState } from "@/lib/studio/studio-ui";

describe("FV Studios presentation truth", () => {
  it("keeps the current portrait explicitly temporary until approved Studio artwork is supplied", () => {
    expect(FV_STUDIOS_FRASSY_LOOK.room).toBe("studio");
    expect(FV_STUDIOS_FRASSY_LOOK.status).toBe("temporary");
    expect(FV_STUDIOS_FRASSY_LOOK.position).toBe("portrait");
  });

  it("disables playback when no real media URL exists", () => {
    expect(studioPlaybackState(null)).toEqual({ playable: false, label: "No playable output yet" });
    expect(studioPlaybackState("  ").playable).toBe(false);
  });

  it("allows playback only for a populated output URL", () => {
    expect(studioPlaybackState("https://media.example/output.wav")).toEqual({
      playable: true,
      label: "Play current output",
    });
  });
});
