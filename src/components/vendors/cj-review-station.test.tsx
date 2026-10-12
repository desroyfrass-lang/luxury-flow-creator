// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const item = (n: number, status = "pending") => ({ id: `q${n}`, cjPid: `pid${n}`, sourceSku: `SKU${n}`, supplierTitle: `Supplier ${n}`, workingName: null, suggestedName: null,
  images: [`https://img/${n}.jpg`], supplierCost: n, currency: "USD", weightGrams: null, cjCategory: null, variants: [], status, draftProductId: null, missing: ["Shipping quote"] });
const list = vi.fn(async () => ({ items: Array.from({ length: 20 }, (_, i) => item(i + 1)), counts: { pending: 20, drafted: 0 }, podProviders: [{ name: "Printful", status: "available" }] }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (f: any) => f, createServerFn: () => ({}) }));
vi.mock("@/lib/auth/identity-watch", () => ({ useAuthUserId: () => ({ userId: "founder", ready: true }) }));
vi.mock("@/lib/vendors/cj-station.functions", () => ({ listCjStation: () => list(), saveCjStationDraft: vi.fn(), reopenCjStationItem: vi.fn() }));
vi.mock("./cj-pilot-panel", () => ({ SupplierPhotos: ({ urls }: any) => <div data-testid="photos">{urls.join(",")}</div>, PilotSaved: () => <div>saved</div> }));
vi.mock("./pilot-category-picker", () => ({ PilotCategoryPicker: () => <div /> }));
const { CjReviewStation } = await import("./cj-review-station");

const vendors = [
  { id: "cj", display_name: "CJ Dropshipping", vendor_kind: "supplier", verification_status: "verified" },
  { id: "art", display_name: "Island Artisan", vendor_kind: "artisan", verification_status: "pending" },
];
const mount = () => render(<QueryClientProvider client={new QueryClient()}>
  <CjReviewStation vendors={vendors} products={[{ id: "p1", title: "Soft Life", vendor_id: "cj", draft_status: "draft" }]} cjVendorId="cj"
    pilot={<div data-testid="pilot">CHIFFON WORKSPACE</div>} savedDraftFor={() => null} onSaved={() => {}} />
</QueryClientProvider>);
afterEach(cleanup);

describe("vendor-aware sequential workspace", () => {
  it("starts on the original chiffon workspace, then walks 20 CJ records with their own values", async () => {
    mount();
    expect(screen.getByTestId("pilot")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("1 of 21")).toBeTruthy());
    expect(screen.getByTestId("station-counts").textContent).toContain("20 waiting");
    fireEvent.click(screen.getByText("Next →"));
    expect(screen.queryByTestId("pilot")).toBeNull();
    expect(screen.getByTestId("station-pid").textContent).toBe("pid1");
    expect(screen.getByTestId("station-cost").textContent).toContain("$1.00");
    fireEvent.click(screen.getByText("Next →"));
    expect(screen.getByTestId("station-pid").textContent).toBe("pid2");
    expect(screen.getByTestId("photos").textContent).toBe("https://img/2.jpg");
    fireEvent.click(screen.getByText("← Back"));
    expect(screen.getByTestId("station-pid").textContent).toBe("pid1");
  });
  it("switching vendor shows an honest empty state and returns to the same position", async () => {
    mount();
    await waitFor(() => expect(screen.getByText("1 of 21")).toBeTruthy());
    fireEvent.click(screen.getByText("Next →")); fireEvent.click(screen.getByText("Next →"));
    fireEvent.change(screen.getByLabelText("Vendor"), { target: { value: "art" } });
    expect(screen.getByTestId("vendor-empty").textContent).toContain("No supplier queue is connected");
    expect(screen.queryByTestId("station-pid")).toBeNull();
    fireEvent.change(screen.getByLabelText("Vendor"), { target: { value: "cj" } });
    expect(screen.getByTestId("station-pid").textContent).toBe("pid2");
  });
  it("lists print-on-demand records as not connected and unselectable", async () => {
    mount();
    await waitFor(() => expect(screen.getByText(/Printful \(print on demand · not connected\)/)).toBeTruthy());
    expect((screen.getByText(/Printful/) as HTMLOptionElement).disabled).toBe(true);
  });
});
