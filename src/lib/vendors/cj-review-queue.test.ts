import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { SUGGESTED_NAMES } from "@/components/vendors/cj-review-queue";

const src = readFileSync("src/lib/cj.functions.ts", "utf8");
const block = src.slice(src.indexOf("founderListCjPending"));

describe("Founder CJ review queue", () => {
  it("both queue functions require auth and the Founder/admin role", () => {
    expect(block.match(/requireSupabaseAuth/g)?.length).toBe(2);
    expect(block.match(/await assertAdmin\(context\)/g)?.length).toBe(2);
  });
  it("lists only pending records", () => {
    expect(block).toContain('.eq("status", "pending")');
  });
  it("saving a name never touches CJ original data, status, import or publish", () => {
    const save = block.slice(block.indexOf("founderSaveCjDraftName"));
    expect(save).toContain(".update({ title: data.name })");
    expect(save).not.toMatch(/cj_data:|status:|shopify|publish/i);
  });
  it("carries the five Founder working names as suggestions", () => {
    expect(SUGGESTED_NAMES["2607170938071630700"]).toBe("The Empress Lace Maxi");
    expect(Object.keys(SUGGESTED_NAMES)).toHaveLength(5);
  });
});
