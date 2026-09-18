import { describe, expect, it } from "vitest";
import {
  buildHandoffHref,
  destinationAcceptsWork,
  hasWorkHandoff,
  parseWorkHandoff,
} from "./work-handoff";

describe("work handoff contract", () => {
  it("carries only the identities that genuinely exist", () => {
    const h = parseWorkHandoff({ work: "w1", move: "", vault: undefined, track: "ft.x.y" });
    expect(h).toEqual({ workItemId: "w1", trackKey: "ft.x.y" });
    expect(hasWorkHandoff(h)).toBe(true);
    expect(hasWorkHandoff({})).toBe(false);
  });

  it("preserves a destination's own query, such as the Wallet sell section", () => {
    const href = buildHandoffHref("/workspace/wallet?section=sell", { workItemId: "w1" });
    expect(href).toBe("/workspace/wallet?section=sell&work=w1");
  });

  it("never duplicates the work parameter when a link is rebuilt", () => {
    const once = buildHandoffHref("/workspace/wallet?section=sell&work=w1", { workItemId: "w1" });
    expect(once).toBe("/workspace/wallet?section=sell&work=w1");
  });

  it("adds move, vault and track only when present", () => {
    expect(buildHandoffHref("/gallery/studio", { workItemId: "w", moveId: "mm.art.x", vaultId: "v" })).toBe(
      "/gallery/studio?work=w&move=mm.art.x&vault=v",
    );
    expect(buildHandoffHref("/gallery/studio", {})).toBe("/gallery/studio");
  });

  it("is honest about which tools recognise an arriving work identity", () => {
    expect(destinationAcceptsWork("/workspace/wallet?section=sell")).toBe(true);
    expect(destinationAcceptsWork("/workspace/first-venture")).toBe(true);
    expect(destinationAcceptsWork("/brand-partnerships")).toBe(false);
    expect(destinationAcceptsWork(null)).toBe(false);
  });
});
