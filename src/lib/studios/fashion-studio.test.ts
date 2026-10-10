import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FASHION_SECTIONS, FASHION_STUDIO_OPEN_ROLES, parseFashionSearch } from "./fashion-studio";
import { STUDIO_NAV, STUDIO_PRIMARY_NAV } from "./studios";

const P = "11111111-1111-1111-1111-111111111111";
const V = "22222222-2222-2222-2222-222222222222";

describe("F1 Fashion Studio", () => {
  it("is in the Studios menu and keeps existing entries", () => {
    expect(STUDIO_NAV.find((n) => n.id === "fashion")?.to).toBe("/studios/fashion");
    expect(STUDIO_PRIMARY_NAV).toContain("fashion");
    for (const id of ["dashboard", "create", "productions", "review", "characters", "assets"]) expect(STUDIO_NAV.some((n) => n.id === id)).toBe(true);
  });
  it("only Founder and admin are opened", () => {
    expect([...FASHION_STUDIO_OPEN_ROLES]).toEqual(["founder", "admin"]);
  });
  it("search accepts only a pair of UUIDs, never metadata", () => {
    expect(parseFashionSearch({ productId: P, variantId: V })).toEqual({ productId: P, variantId: V });
    expect(parseFashionSearch({ productId: P })).toEqual({});
    expect(parseFashionSearch({ productId: "x", variantId: V })).toEqual({});
    expect(parseFashionSearch({ productId: P, variantId: V, name: "Fake", image: "https://evil" })).toEqual({ productId: P, variantId: V });
  });
  it("unconnected sections carry a blocker; connected ones a real link", () => {
    for (const s of FASHION_SECTIONS) expect(s.status === "connected" ? !!s.link : !!s.blocker).toBe(true);
    expect(FASHION_SECTIONS.find((s) => s.id === "looks")?.status).toBe("not_connected");
    expect(FASHION_SECTIONS.find((s) => s.id === "makers")?.status).toBe("not_connected");
  });
  it("room sits under the gated /studios layout and uses the server handoff only", () => {
    const src = readFileSync("src/routes/_authenticated/studios.fashion.tsx", "utf8");
    expect(src).toContain('createFileRoute("/_authenticated/studios/fashion")');
    expect(src).toContain("getProductHandoff");
    expect(src).not.toMatch(/\.(insert|update|upsert|delete)\(|generateTryOn|images\/generations/);
    expect(readFileSync("src/routes/_authenticated/studios.tsx", "utf8")).toContain("requireFounderRoute");
  });
  it("greeting uses the approved Fashionista look, no missing-image note", () => {
    const src = readFileSync("src/routes/_authenticated/studios.fashion.tsx", "utf8");
    expect(src).toContain('presentationRoom="fashion"');
    expect(src).not.toMatch(/Missing image|FASHIONISTA_LOOK_MISSING|FV_STUDIOS_FRASSY_LOOK/);
    expect(readFileSync("src/assets/frassy-fashionista-studios.png.asset.json", "utf8")).toContain("Fashionista_Frassy_in_Frass_Studios.png");
  });
  it("only the verified variant handoff carries product context into Fashion Studio", () => {
    const panel = readFileSync("src/components/vendors/cj-pilot-panel.tsx", "utf8");
    expect(panel).toContain("Not connected yet");
    expect(panel).not.toContain('to: "/studios/fashion" as const');
    const picker = readFileSync("src/components/vendors/supplier-variant-picker.tsx", "utf8");
    expect(picker).toContain('to="/studios/fashion"');
    expect(picker).toContain("productId: handoff.productId, variantId: handoff.variant.id");
  });
  it("uses a room-only light scope and suppresses the parent assistant only in Fashion", () => {
    const route = readFileSync("src/routes/_authenticated/studios.fashion.tsx", "utf8");
    const shell = readFileSync("src/routes/_authenticated/studios.tsx", "utf8");
    const css = readFileSync("src/styles.css", "utf8");
    expect(route).toContain("fashion-studio-light");
    expect(css).toContain(".fashion-studio-light");
    expect(shell).toContain('pathname !== "/studios/fashion"');
  });
  it("uses one shared Frassy engine with verified read-only handoff context", () => {
    const route = readFileSync("src/routes/_authenticated/studios.fashion.tsx", "utf8");
    expect(route).toContain("<FrassyChat");
    expect(route).toContain("fashionHandoffContext(handoff.data)");
    expect(route).toContain("verified again on the server");
    expect(route).toContain("No image/video, capsule, try-on, order, charge, save, or publication tool is connected here.");
    expect(route).not.toMatch(/\.(insert|update|upsert|delete)\(/);
  });
  it("adds Fashion-specific responsibility before the broader Studios context", () => {
    const context = readFileSync("src/lib/frassy/context.ts", "utf8");
    expect(context.indexOf('["/studios/fashion"]')).toBeLessThan(context.indexOf('["/fv-studios", "/studio", "/studios"'));
  });
});
