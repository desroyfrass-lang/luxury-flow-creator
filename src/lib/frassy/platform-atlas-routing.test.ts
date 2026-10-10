import { describe, expect, it } from "vitest";
import { PLATFORM_ATLAS } from "./platform-atlas";

const entry = (name: string) => PLATFORM_ATLAS.find((e) => e.name === name);

describe("Frassy platform map — creative routing", () => {
  it("names /try-on as the shared virtual try-on, without claiming drafts can use it", () => {
    expect(entry("Try-On")?.path).toBe("/try-on");
    expect(entry("Try-On")?.purpose).toMatch(/shared Frass virtual try-on/);
    expect(entry("Try-On")?.purpose).toMatch(/drafts cannot use it yet/);
  });
  it("describes Frass Shape as the shapewear department, not the try-on room", () => {
    expect(entry("Frass Shape")?.purpose).toMatch(/shapewear department/);
    expect(entry("Frass Shape")?.purpose).toMatch(/Not the try-on room/);
    expect(entry("Frass Shape")?.purpose).not.toMatch(/AI Fit Assistant/);
  });
  it("positions Fashion Studio as the Founder creative desk without claiming connected tools", () => {
    expect(entry("Fashion Studio")?.path).toBe("/studios/fashion");
    expect(entry("Fashion Studio")?.purpose).toMatch(/central fashion creative desk/);
    expect(entry("Fashion Studio")?.purpose).toMatch(/not connected here yet/);
  });
  it("says FV Studios image/video generation is not configured", () => {
    expect(entry("FV Studios")?.path).toBe("/studio");
    expect(entry("FV Studios")?.purpose).toMatch(/NOT configured/);
  });
});
