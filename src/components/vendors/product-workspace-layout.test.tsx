// @vitest-environment happy-dom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SupplierGallery } from "./product-workspace-layout";
afterEach(cleanup);
it("retains all five originals, including failed images, and opens only the selected source", () => {
  const urls = Array.from({ length: 5 }, (_, i) => `https://supplier.example/original-${i}.jpg`);
  render(<SupplierGallery urls={urls} />);
  fireEvent.error(screen.getByAltText("Supplier product photo 5"));
  expect(screen.getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(urls);
  expect(screen.getByRole("button", { name: "Zoom supplier image 5" }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Zoom supplier image 2" }));
  expect(screen.getByAltText("Selected original supplier image").getAttribute("src")).toBe(urls[1]);
});