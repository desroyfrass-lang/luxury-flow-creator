import { describe, expect, it } from "vitest";
import {
  MONEY_MOVE_CATALOGUE,
  MONEY_MOVE_FAMILIES,
  catalogueByFamily,
  moveById,
} from "./money-move-catalogue";
import { FIRST_SALE_MOVE, FIRST_SALE_MOVE_ID } from "@/lib/daily/money-move-link";

describe("Master Money Moves Library", () => {
  it("keeps every id stable, unique and prefixed", () => {
    const ids = MONEY_MOVE_CATALOGUE.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^mm\.[a-z]+\.[a-z0-9-]+$/);
  });

  it("preserves the canonical 40 as ten archetypes of four", () => {
    const canonical = MONEY_MOVE_CATALOGUE.filter((m) => m.kind === "canonical");
    expect(canonical.length).toBe(40);
    const families = MONEY_MOVE_FAMILIES.filter((f) => f.canonical);
    expect(families.length).toBe(10);
    for (const f of families) {
      expect(canonical.filter((m) => m.family === f.id).length).toBe(4);
    }
  });

  it("keeps the reconciled additional routes without inventing archetypes", () => {
    const extra = MONEY_MOVE_CATALOGUE.filter((m) => m.kind === "additional");
    expect(extra.length).toBe(13);
    for (const id of [
      "mm.direct.frass-card-sale",
      "mm.direct.hidden-assets-resale",
      "mm.art.originals-prints-commissions",
      "mm.services.wellness-practice",
      "mm.services.beauty-appointments",
      "mm.services.photography-bookings",
      "mm.services.freight-brokerage",
      "mm.services.software-builds",
      "mm.services.trade-jobs",
      "mm.manufacturing.made-to-order-craft",
      "mm.knowledge.paid-guide-course",
      "mm.content.faceless-content",
      "mm.ecosystem.referral-income",
    ]) {
      expect(moveById(id), id).toBeTruthy();
    }
  });

  it("never invents a specialist destination", () => {
    for (const m of MONEY_MOVE_CATALOGUE) {
      if (m.destination) expect(m.destination.path.startsWith("/")).toBe(true);
    }
  });

  it("points every related move at a real catalogue entry", () => {
    for (const m of MONEY_MOVE_CATALOGUE) {
      for (const rel of m.relatedMoveIds ?? []) expect(moveById(rel), rel).toBeTruthy();
    }
  });

  it("groups every move under a known family", () => {
    const grouped = catalogueByFamily().flatMap((f) => f.moves);
    expect(grouped.length).toBe(MONEY_MOVE_CATALOGUE.length);
  });

  it("anchors the working first sale move to a stable catalogue identity", () => {
    const move = moveById(FIRST_SALE_MOVE_ID);
    expect(move).toBeTruthy();
    expect(FIRST_SALE_MOVE.title).toBe(move!.title);
    expect(FIRST_SALE_MOVE.detail).toBe(move!.purpose);
  });
});
