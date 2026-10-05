import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { frassyLook } from "@/lib/frassy/wardrobe";
import { frassySurface } from "@/lib/frassy/surfaces";

const companion = readFileSync("src/components/daily/daily-frassy.tsx", "utf8");
const daily = readFileSync("src/routes/_authenticated/daily.tsx", "utf8");
const css = readFileSync("src/styles.css", "utf8");
const chat = readFileSync("src/components/frassy-chat.tsx", "utf8");

describe("recovered Daily Frassy presentation boundaries", () => {
  it("uses the registered Daily portrait without substitution or cropping", () => {
    expect(frassyLook("daily").image).toContain("frassy-look-daily.jpg");
    expect(companion).toContain('frassyLook("daily")');
    expect(css).toContain(".daily-frassy-restored img { width: 100%; height: 100%; object-fit: contain; }");
  });

  it("keeps recovered timing and dimensions with safe-area-aware home", () => {
    expect(companion).toContain("setSettled(true), 1900");
    expect(css).toContain("right 900ms var(--ease-luxury)");
    expect(css).toContain("height: 13rem;");
    expect(css).toContain("height: 3.5rem;");
    expect(css).toContain("bottom: max(1.25rem, env(safe-area-inset-bottom));");
  });

  it("preserves the canonical board and Welcome Hall ownership without motion", () => {
    expect(daily).toContain("boardFn()");
    expect(daily).toContain("markWelcomedToday()");
    expect(daily).not.toContain("<FrassDaily");
    expect(daily).not.toContain("to=\"/frassy\"");
    expect(companion).not.toMatch(/motion-rig|studio-motion|\.webm|DailyWelcomeCeremony/);
    expect(frassySurface("/daily")).toBe("workspace");
  });

  it("reuses conversation without startup scripts, voice or automatic departure", () => {
    expect(companion).toContain('presentation="daily"');
    expect(chat).toContain("active: !dailyPresentation && (open || embedded)");
    expect(chat).toContain("if (place && !dailyPresentation)");
    expect(chat).toContain("if (!dailyPresentation && (spoken || speakReplies)");
  });
});