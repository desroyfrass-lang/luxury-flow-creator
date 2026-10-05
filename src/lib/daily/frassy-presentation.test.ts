import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import dailyOriginal from "@/assets/frassy-daily-seated-exact-original.png.asset.json";
import { frassySurface } from "@/lib/frassy/surfaces";

const companion = readFileSync("src/components/daily/daily-frassy.tsx", "utf8");
const daily = readFileSync("src/routes/_authenticated/daily.tsx", "utf8");
const css = readFileSync("src/styles.css", "utf8");
const chat = readFileSync("src/components/frassy-chat.tsx", "utf8");

describe("recovered Daily Frassy presentation boundaries", () => {
  it("uses only the exact ivory-suit original with perimeter-only blending", () => {
    expect(dailyOriginal.original_filename).toBe("frassy-daily-seated-exact-original.png");
    expect(companion).toContain("src={dailyOriginal.url}");
    expect(companion).toContain("width={1025} height={1024}");
    expect(companion).not.toMatch(/frassyLook|frassy-look-daily|frassy-gold/);
    const imageRules = css.split(".daily-frassy-restored img {")[1]?.split("}")[0];
    expect(imageRules).toContain("object-fit: contain");
    expect(imageRules).toContain("mask-composite: intersect");
    expect(imageRules).not.toContain("filter:");
  });

  it("keeps recovered timing and dimensions with safe-area-aware home", () => {
    expect(companion).toContain("setSettled(true), 1900");
    expect(css).toContain("right 900ms var(--ease-luxury)");
    expect(css).toContain("height: 13rem;");
    expect(css).toContain("height: 12rem;");
    expect(css).toContain("height: 9.5rem;");
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