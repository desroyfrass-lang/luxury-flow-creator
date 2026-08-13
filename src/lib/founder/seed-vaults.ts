// FRASS-0561 — Founder Seed Vaults.
// Nothing created in Frass is ever practice. Anything the Founder makes while
// testing is a real, owned, permanent asset with a life ahead of it.

export type SeedVaultStatus =
  | "seed"
  | "published"
  | "monetized"
  | "academy_path"
  | "transferred";

export type SeedVault = {
  id: string;
  title: string;
  summary: string | null;
  kind: string;
  origin_persona: string | null;
  origin_session: string | null;
  status: SeedVaultStatus;
  transferred_to: string | null;
  price_cents: number | null;
  academy_path_title: string | null;
  protected: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const SEED_VAULT_STATUS: Record<
  SeedVaultStatus,
  { emoji: string; label: string; plain: string }
> = {
  seed: { emoji: "🌱", label: "Seed", plain: "Created and kept. Waiting for you to decide its future." },
  published: { emoji: "📖", label: "Published", plain: "Live for members to read and learn from." },
  monetized: { emoji: "💰", label: "Monetized", plain: "Being sold — it earns." },
  academy_path: { emoji: "🎓", label: "Academy Builder Path", plain: "Turned into a course other Builders follow." },
  transferred: { emoji: "🤝", label: "Transferred", plain: "Ownership handed to a Partner who now runs it." },
};

export type SeedVaultAction = {
  id: "publish" | "monetize" | "academy" | "transfer" | "reseed";
  emoji: string;
  label: string;
  plain: string;
  status: SeedVaultStatus;
  needs?: "price" | "path-title" | "partner";
};

export const SEED_VAULT_ACTIONS: SeedVaultAction[] = [
  { id: "publish", emoji: "📖", label: "Publish", plain: "Let members read it.", status: "published" },
  { id: "monetize", emoji: "💰", label: "Monetize", plain: "Put a price on it and sell it.", status: "monetized", needs: "price" },
  {
    id: "academy",
    emoji: "🎓",
    label: "Convert to Academy Builder Path",
    plain: "Turn it into a course other Builders can follow.",
    status: "academy_path",
    needs: "path-title",
  },
  {
    id: "transfer",
    emoji: "🤝",
    label: "Transfer to a Partner",
    plain: "Hand ownership to a Partner who will run it.",
    status: "transferred",
    needs: "partner",
  },
  { id: "reseed", emoji: "🌱", label: "Return to Seed", plain: "Undo the decision and keep it private again.", status: "seed" },
];

export const SEED_VAULT_PROMISE =
  "Nothing here is mock data, sample content or practice. Every Seed Vault is a real asset you own — it can be published, sold, taught, or handed to a Partner. Frass will never delete one automatically.";

export function seedVaultSummary(vaults: SeedVault[]) {
  const by = (s: SeedVaultStatus) => vaults.filter((v) => v.status === s).length;
  const earning = vaults.filter((v) => v.status === "monetized");
  const potential = earning.reduce((sum, v) => sum + (v.price_cents ?? 0), 0) / 100;
  return {
    total: vaults.length,
    seeds: by("seed"),
    published: by("published"),
    monetized: by("monetized"),
    academy: by("academy_path"),
    transferred: by("transferred"),
    listedValue: potential,
    plain:
      vaults.length === 0
        ? "You have not created a Seed Vault yet. Anything you make while testing will land here and stay yours."
        : `You own ${vaults.length} Seed Vault${vaults.length === 1 ? "" : "s"}. ${by("seed")} still waiting on a decision from you.`,
  };
}
