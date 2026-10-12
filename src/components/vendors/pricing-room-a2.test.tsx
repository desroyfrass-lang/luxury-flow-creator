// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { computeDestinationPricing } from "@/lib/commerce/destination-pricing";
import { DEFAULT_INPUTS, parseStoredInputs, type WorksheetInputs } from "@/lib/commerce/pricing-worksheet";

// ---- fake server keyed by destination, with revision checks like the real one ----
type Row = { finalPrice: number | null; inputs: WorksheetInputs; updatedAt: string; revision: number; approvalStatus: string; approvedRevision: number | null; approvedAt: string | null };
const db = new Map<string, Row>();
const calls: any[] = [];
let roles: string[] = ["admin"];
let forceReady = false;
let tick = 0;
let quoteRows: any[] = [];
const variants = ["S", "3XL"].map((s, i) => ({ id: s, option_label: `Sky Blue ${s}`, sku: null, supplier_cost: i ? 8.5 : 6.97, currency: "USD" }));
const evaluate = (destination: string) => {
  const w = db.get(destination);
  const pricing = computeDestinationPricing({ destination, inputs: w?.inputs ?? DEFAULT_INPUTS, finalPrice: w?.finalPrice ?? null, now: new Date(), variants: [] });
  if (forceReady) Object.assign(pricing, { ready: true, requiresReviewNote: true, band: "founder_review", requirements: pricing.requirements.map((r) => ({ ...r, met: true })) });
  return { worksheet: w ?? null, pricing, evaluatedAt: new Date().toISOString() };
};
vi.mock("@tanstack/react-start", () => ({ useServerFn: (f: any) => f, createServerFn: () => ({}) }));
vi.mock("@/hooks/use-my-roles", () => ({ useMyRoles: () => ({ roles, signedIn: true, loading: false }) }));
vi.mock("@/lib/vendors/shipping-quotes.functions", () => ({
  listCjShippingQuotes: async ({ data }: any) => { calls.push(["quotes", data.country]); return quoteRows; },
  fetchCjShippingQuotes: async ({ data }: any) => { calls.push(["fetch", data.country]); return { results: [] }; },
}));
vi.mock("@/lib/vendors/pricing-room.functions", () => ({
  getPricingWorksheet: async ({ data }: any) => { calls.push(["get", data.destination]); return db.get(data.destination) ?? null; },
  evaluatePricingDestination: async ({ data }: any) => evaluate(data.destination),
  savePricingWorksheet: async ({ data }: any) => {
    calls.push(["save", data.destination, data.expectedRevision]);
    const prev = db.get(data.destination);
    if (prev && data.expectedRevision !== prev.revision) throw new Error("This worksheet was changed elsewhere. Reload to see the latest before saving.");
    const row: Row = { finalPrice: data.finalPrice, inputs: parseStoredInputs(data.inputs), updatedAt: `2026-10-11T12:${String(++tick).padStart(2, "0")}:00Z`, revision: (prev?.revision ?? 0) + 1, approvalStatus: prev?.approvalStatus === "approved" ? "revised_after_approval" : "draft", approvedRevision: prev?.approvedRevision ?? null, approvedAt: null };
    db.set(data.destination, row);
    return row;
  },
  approvePricingWorksheet: async ({ data }: any) => {
    calls.push(["approve", data.destination, data.expectedRevision, data.note]);
    if (!roles.includes("super_admin")) throw new Error("Only the Founder can approve a price.");
     const r = db.get(data.destination);
     if (!r) throw new Error("Save first.");
    if (r.revision !== data.expectedRevision) throw new Error("The worksheet changed since it was checked. Check it again.");
    db.set(data.destination, { ...r, approvalStatus: "approved", approvedRevision: r.revision });
    return { status: "approved" };
  },
}));

const { ProfitBreakdownWithQuotes } = await import("./profit-breakdown-with-quotes");
const mount = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><ProfitBreakdownWithQuotes productId="p1" canFetch currency="USD" offerCost={6.97} variants={variants} knownShipping={{ amount: 7.35, note: "quote" }} /></QueryClientProvider>);
};
const priceBox = () => screen.getByLabelText("Final selling price") as HTMLInputElement;
const radio = (name: string) => screen.getByRole("radio", { name });

beforeEach(() => { db.clear(); calls.length = 0; roles = ["admin"]; forceReady = false; quoteRows = []; });
afterEach(cleanup);

describe("A2 destination selector", () => {
  it("each country loads its own worksheet; US price never copied to Canada", async () => {
    mount();
    await waitFor(() => expect(priceBox().value).not.toBe(""));
    const usValue = priceBox().value;
    expect(radio("United States").getAttribute("aria-checked")).toBe("true");
    fireEvent.click(radio("Canada"));
    await waitFor(() => expect(screen.getByTestId("fx-blocked")).toBeTruthy());
    expect(priceBox().value).toBe("");
    expect(priceBox().disabled).toBe(true);
    expect(usValue).not.toBe("");
    expect(calls).toContainEqual(["get", "CA"]);
    expect(calls).toContainEqual(["quotes", "CA"]);
    expect(screen.getByText(/Get fresh CJ Canada shipping quotes/)).toBeTruthy();
  });
  it("save is destination-scoped, revision-checked and survives reload", async () => {
    const view = mount();
    await waitFor(() => expect(priceBox().value).not.toBe(""));
    fireEvent.change(priceBox(), { target: { value: "31.50" } });
    expect(screen.getByTestId("save-state").textContent).toContain("Unsaved changes");
    fireEvent.click(screen.getByRole("button", { name: /Save United States worksheet/ }));
    await waitFor(() => expect(db.get("US")?.finalPrice).toBe(31.5));
    expect(calls).toContainEqual(["save", "US", undefined]);
    await waitFor(() => expect(screen.getByTestId("save-state").textContent).not.toContain("Unsaved"));
    view.unmount();
    mount();
    await waitFor(() => expect(priceBox().value).toBe("31.50"));
    expect(db.has("CA")).toBe(false);
  });
  it("a stale revision is refused with a clear message", async () => {
    db.set("US", { finalPrice: 30, inputs: DEFAULT_INPUTS, updatedAt: "2026-10-11T11:00:00Z", revision: 1, approvalStatus: "draft", approvedRevision: null, approvedAt: null });
    mount();
    await waitFor(() => expect(priceBox().value).toBe("30.00"));
    const saved = db.get("US");
    if (!saved) throw new Error("Test setup missing saved row");
    db.set("US", { ...saved, revision: 2 }); // someone else saved
    fireEvent.change(priceBox(), { target: { value: "32" } });
    fireEvent.click(screen.getByRole("button", { name: /Save United States worksheet/ }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("changed elsewhere"));
  });
});

describe("A2 readiness and approval", () => {
  it("shows the 14 server checks and blocks non-Founder approval with reasons", async () => {
    mount();
    await waitFor(() => expect(screen.getByText(/of 14 checks met/)).toBeTruthy());
    const btn = screen.getByRole("button", { name: /Approve United States price/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(screen.getByText("Only the Founder account can approve.")).toBeTruthy();
    expect(screen.getByText(/Save the United States worksheet first/)).toBeTruthy();
  });
  it("Founder approval needs a review note in the 25–29.99% band, sends the saved revision, and edits mark it changed", async () => {
    roles = ["admin", "super_admin"]; forceReady = true;
    db.set("US", { finalPrice: 22.5, inputs: DEFAULT_INPUTS, updatedAt: "2026-10-11T11:00:00Z", revision: 3, approvalStatus: "draft", approvedRevision: null, approvedAt: null });
    mount();
    const btn = await screen.findByRole("button", { name: /Approve United States price/ }) as HTMLButtonElement;
    await waitFor(() => expect(screen.getByText(/write a review note/)).toBeTruthy());
    expect(btn.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/Founder review note/), { target: { value: "Launch test margin" } });
    await waitFor(() => expect(btn.disabled).toBe(false));
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => expect(calls).toContainEqual(["approve", "US", 3, "Launch test margin"]));
    await waitFor(() => expect(screen.getByTestId("approval-status").textContent).toContain("Approved · version 3"));
    fireEvent.change(priceBox(), { target: { value: "23" } });
    fireEvent.click(screen.getByRole("button", { name: /Save United States worksheet/ }));
    await waitFor(() => expect(screen.getByTestId("approval-status").textContent).toContain("Changed after approval"));
  });
  it("destination buttons are real keyboard-reachable controls", async () => {
    mount();
    await waitFor(() => screen.getByTestId("destination-selector"));
    for (const n of ["United States", "Canada", "United Kingdom", "Jamaica"]) expect(radio(n).tagName).toBe("BUTTON");
  });
});

describe("editable A2 settings", () => {
  it("chooses and persists a genuine common quoted method, immediately pricing each variant's own shipping", async () => {
    const fetched = new Date().toISOString();
    const expires = new Date(Date.now() + 3600000).toISOString();
    quoteRows = variants.flatMap((v) => [
      { variant_id: v.id, method: "Cheap", price: 5, currency: "USD", fetched_at: fetched, expires_at: expires },
      { variant_id: v.id, method: "Standard", price: v.id === "S" ? 7.35 : 9.1, currency: "USD", fetched_at: fetched, expires_at: expires },
    ]);
    mount();
    const method = await screen.findByLabelText("Standard shipping method preference");
    await waitFor(() => expect((method as HTMLSelectElement).disabled).toBe(false));
    fireEvent.change(method, { target: { value: "Standard" } });
    expect(priceBox().value).toBe("33.16");
    fireEvent.click(screen.getByRole("button", { name: /Save United States worksheet/ }));
    await waitFor(() => expect(db.get("US")?.inputs.shippingMethod).toBe("Standard"));
    expect(db.get("US")?.finalPrice).toBe(33.16);
  });
  it("saves country/product notes and fee edits, recomputes and restores them without leaking to Canada", async () => {
    const view = mount();
    await waitFor(() => expect(priceBox().value).not.toBe(""));
    const original = priceBox().value;
    fireEvent.change(screen.getByLabelText("Packaging (USD)"), { target: { value: "2.25" } });
    fireEvent.change(screen.getByLabelText("Founder explanatory notes"), { target: { value: "Delegate: check supplier packaging" } });
    fireEvent.change(screen.getByLabelText("Tax / duty planning notes"), { target: { value: "Confirm destination duties before launch" } });
    fireEvent.change(screen.getByLabelText("Commission applicability"), { target: { value: "none" } });
    expect(priceBox().value).not.toBe(original);
    fireEvent.click(screen.getByRole("button", { name: /Save United States worksheet/ }));
    await waitFor(() => expect(db.get("US")?.inputs.packagingCost.amount).toBe("2.25"));
    expect(db.get("US")?.inputs.commissionPct.state).toBe("not_applicable");
    expect(db.get("US")?.finalPrice).not.toBeNull();
    view.unmount(); mount();
    await waitFor(() => expect((screen.getByLabelText("Founder explanatory notes") as HTMLTextAreaElement).value).toBe("Delegate: check supplier packaging"));
    fireEvent.click(radio("Canada"));
    await waitFor(() => expect((screen.getByLabelText("Founder explanatory notes") as HTMLTextAreaElement).value).toBe(""));
    expect(priceBox().value).toBe("");
  });
  it("failed saves preserve editable draft and do not reset unsaved changes", async () => {
    db.set("US", { finalPrice: 30, inputs: DEFAULT_INPUTS, updatedAt: "2026-10-11T11:00:00Z", revision: 1, approvalStatus: "draft", approvedRevision: null, approvedAt: null });
    mount();
    await waitFor(() => expect(priceBox().value).toBe("30.00"));
    const previous = db.get("US");
    if (!previous) throw new Error("Missing test row");
    db.set("US", { ...previous, revision: 2 });
    fireEvent.change(screen.getByLabelText("Business policy notes"), { target: { value: "Keep my draft" } });
    fireEvent.click(screen.getByRole("button", { name: /Save United States worksheet/ }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("changed elsewhere"));
    expect((screen.getByLabelText("Business policy notes") as HTMLTextAreaElement).value).toBe("Keep my draft");
    expect(screen.getByTestId("save-state").textContent).toContain("Unsaved changes");
  });
  it("notes changed after approval become a new unapproved revision", async () => {
    roles = ["admin", "super_admin"];
    db.set("US", { finalPrice: 30, inputs: DEFAULT_INPUTS, updatedAt: "2026-10-11T11:00:00Z", revision: 4, approvalStatus: "approved", approvedRevision: 4, approvedAt: null });
    mount();
    await waitFor(() => expect(priceBox().value).toBe("30.00"));
    fireEvent.change(screen.getByLabelText("Business policy notes"), { target: { value: "Revised draft policy" } });
    fireEvent.click(screen.getByRole("button", { name: /Save United States worksheet/ }));
    await waitFor(() => expect(db.get("US")?.revision).toBe(5));
    expect(db.get("US")?.approvalStatus).toBe("revised_after_approval");
    expect(db.get("US")?.approvedRevision).toBe(4);
  });
  it("a checklist action opens the matching cost control and moves keyboard focus", async () => {
    mount();
    const action = await screen.findByRole("button", { name: "Open setting: Packaging cost verified" });
    HTMLElement.prototype.scrollIntoView = vi.fn();
    fireEvent.click(action);
    const control = screen.getByLabelText("Packaging (USD)");
    expect(document.activeElement).toBe(control);
    expect(control.closest("details")?.open).toBe(true);
  });
});
