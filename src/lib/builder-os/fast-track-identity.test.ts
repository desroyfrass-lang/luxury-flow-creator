import { describe, expect, it } from "vitest";
import {
  fastTrackKey,
  legacyFastTrackId,
  parentMoveIdForVault,
  slugifyStep,
} from "@/lib/builder-os/fast-track-identity";
import { BUSINESS_VAULTS } from "@/lib/business/vault-family";
import { moneyMoveForVault, moneyMoves } from "@/lib/builder-os/money-move-lifecycle";
import { moveById } from "@/lib/business/money-move-catalogue";
import { nextFastTrackCards } from "@/lib/daily/board-model";

describe("Fast Track identity", () => {
  it("builds a stable key from the Vault and the step wording, not the position", () => {
    expect(fastTrackKey("seamstress", "Name the clothing brand")).toBe(
      "ft.seamstress.name-the-clothing-brand",
    );
    expect(slugifyStep("Price the work so it pays you properly!")).toBe(
      "price-the-work-so-it-pays-you-properly",
    );
  });

  it("keeps keys unique inside every Vault", () => {
    for (const v of BUSINESS_VAULTS) {
      const keys = v.moves.map((m) => fastTrackKey(v.key, m.title));
      expect(new Set(keys).size, `${v.key} has duplicate Fast Track keys`).toBe(keys.length);
    }
  });

  it("preserves every Vault move as a Fast Track — none promoted, none deleted", () => {
    const total = BUSINESS_VAULTS.reduce((n, v) => n + v.moves.length, 0);
    expect(total).toBeGreaterThanOrEqual(150);
    const tracks = BUSINESS_VAULTS.flatMap(
      (v) => moneyMoveForVault(v, "active", []).fastTracks,
    );
    expect(tracks.length).toBe(total);
  });

  it("only claims a parent Money Move the catalogue really has, and never guesses", () => {
    for (const v of BUSINESS_VAULTS) {
      const parent = parentMoveIdForVault(v.key);
      if (parent) expect(moveById(parent)).toBeTruthy();
    }
    expect(parentMoveIdForVault("photography")).toBe("mm.services.photography-bookings");
    // Vaults spanning several canonical moves must NOT be given a false parent.
    expect(parentMoveIdForVault("seamstress")).toBeNull();
    expect(parentMoveIdForVault("music-creator")).toBeNull();
  });

  it("treats old browser ids as finished during migration only", () => {
    const vault = BUSINESS_VAULTS[0]!;
    const legacy = legacyFastTrackId(vault.key, 0);
    const move = moneyMoveForVault(vault, "active", [legacy]);
    expect(move.fastTracks[0]!.done).toBe(true);
    const move2 = moneyMoveForVault(vault, "active", [fastTrackKey(vault.key, vault.moves[0]!.title)]);
    expect(move2.fastTracks[0]!.done).toBe(true);
  });

  it("reads completion from the account, with no browser storage involved", () => {
    const map = Object.fromEntries(BUSINESS_VAULTS.map((v) => [v.key, "active"])) as Record<string, "active">;
    const first = BUSINESS_VAULTS[0]!;
    const withNone = moneyMoves(map, []);
    const withOne = moneyMoves(map, [fastTrackKey(first.key, first.moves[0]!.title)]);
    const a = withNone.find((m) => m.vaultKey === first.key)!;
    const b = withOne.find((m) => m.vaultKey === first.key)!;
    expect(a.completed).toBe(0);
    expect(b.completed).toBe(1);
  });
});

describe("Daily surfacing", () => {
  const vault = BUSINESS_VAULTS[0]!;
  const rows = [
    {
      track_key: fastTrackKey(vault.key, vault.moves[0]!.title),
      vault_key: vault.key,
      parent_move_id: parentMoveIdForVault(vault.key),
      title: vault.moves[0]!.title,
      status: "done",
      updated_at: new Date().toISOString(),
    },
  ];

  it("shows only the next step of a started Money Move, never the whole list", () => {
    const cards = nextFastTrackCards(rows);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.title).toBe(vault.moves[1]!.title);
    expect(cards[0]!.source).toBe("fast-track");
  });

  it("shows nothing for a Builder who has not started anything", () => {
    expect(nextFastTrackCards([])).toHaveLength(0);
  });

  it("never carries money or work-execution meaning", () => {
    const card = nextFastTrackCards(rows)[0]!;
    expect(card.workItemId).toBeUndefined();
    expect(card.statusLabel).toBeUndefined();
  });

  it("caps how much of the Fast Track catalogue can reach the Daily", () => {
    const many = BUSINESS_VAULTS.slice(0, 6).map((v, i) => ({
      track_key: fastTrackKey(v.key, v.moves[0]!.title),
      vault_key: v.key,
      parent_move_id: parentMoveIdForVault(v.key),
      title: v.moves[0]!.title,
      status: "done",
      updated_at: new Date(Date.now() - i * 1000).toISOString(),
    }));
    expect(nextFastTrackCards(many).length).toBeLessThanOrEqual(3);
  });
});
