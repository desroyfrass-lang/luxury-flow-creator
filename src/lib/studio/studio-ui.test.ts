import { describe, expect, it } from "vitest";
import { FV_STUDIOS_FRASSY_LOOK } from "@/lib/frassy/room-looks";
import {
  studioActionContext,
  studioConversationPresentation,
  studioPlaybackState,
} from "@/lib/studio/studio-ui";

describe("FV Studios presentation truth", () => {
  it("uses the Founder-approved seated Studio look", () => {
    expect(FV_STUDIOS_FRASSY_LOOK.room).toBe("studio");
    expect(FV_STUDIOS_FRASSY_LOOK.status).toBe("approved");
    expect(FV_STUDIOS_FRASSY_LOOK.position).toBe("seated");
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

  it("keeps Studio response capabilities behind one closed secondary control", () => {
    expect(studioConversationPresentation).toEqual({
      naturalResponses: true,
      responseOptionsMenu: true,
      responseOptionsDefaultOpen: false,
    });
  });

  it("pairs a truthful Studio blocker with the real next action", () => {
    const context = studioActionContext("Enhance Phone Recording");

    expect(context).toContain("truthful blocker");
    expect(context).toContain("Best available action now: Enhance Phone Recording");
    expect(context).toContain("No uninstalled machine is described as available.");
  });
});
