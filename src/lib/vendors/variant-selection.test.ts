import { describe, expect, it } from "vitest";
import { groupVisualVariants, selectedVisualVariant, type VisualVariant } from "./variant-selection";

const image = "https://cf.cjdropshipping.com/quick/product/b96d9cbd-2106-4c97-b0fe-aae979402286.jpg";
const sizes = ["S", "M", "L", "XL", "2XL", "3XL"];
const refs = ["2606050313341623900", "2606050313341625000", "2606050313341625600", "2606050313341626300", "2606050313341626900", "2606220218121628700"];
const variants: VisualVariant[] = sizes.map((size, i) => ({ ref: refs[i], sku: `CJQB29225370${i + 1}`, label: `Sky Blue-${size}`, image }));

describe("Supplier variant selection", () => {
  it("maps six CJ combinations to one Sky Blue colour and its linked photo", () => {
    const groups = groupVisualVariants(variants);
    expect(groups.map((g) => g.colour)).toEqual(["Sky Blue"]);
    expect(groups[0]?.variants.map((v) => v.size)).toEqual(["S", "M", "L", "XL", "2XL", "3XL"]);
    expect(groups[0]?.variants.every((v) => v.image === image)).toBe(true);
  });
  it("selects the exact size, ID and image; refuses unknown references", () => {
    expect(selectedVisualVariant(variants, "2606220218121628700")).toEqual(variants[5]);
    expect(selectedVisualVariant(variants, "other-product")).toBeNull();
  });
  it("keeps missing images null without borrowing another colour's image", () => {
    const rows = [{ ...variants[0], image: null }, { ...variants[1], label: "Red-M", image: "http://unsafe/photo.jpg" }];
    expect(groupVisualVariants(rows).map((g) => g.variants[0]?.image)).toEqual([null, null]);
  });
  it("does not invent colours or sizes from unknown formats", () => {
    const groups = groupVisualVariants([{ ref: "plain", sku: null, label: "Blue-Green", image: null }]);
    expect(groups[0]?.colour).toBe("Blue-Green");
    expect(groups[0]?.variants[0]?.size).toBeNull();
  });
  it("grouping and changing selection never mutate supplier records", () => {
    const frozen = Object.freeze(variants.map((v) => Object.freeze({ ...v })));
    const before = JSON.stringify(frozen);
    groupVisualVariants(frozen);
    selectedVisualVariant(frozen, refs[0]);
    selectedVisualVariant(frozen, refs[5]);
    expect(JSON.stringify(frozen)).toBe(before);
  });
});