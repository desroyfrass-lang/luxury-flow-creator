// ─────────────────────────────────────────────────────────────────────────────
// SPEC-BLUEPRINT-001-FINAL §3 — Adaptive Workshop Environments.
//
// The Workshop is one place. It changes clothes, never bones.
//
// The Universal OS backend, the Universal Upload Manager (FRASS-0400), the
// Conversation Dock (FRASS-0553) and every Builder tool behave identically in
// every environment. Only the room around them adapts to the craft.
// ─────────────────────────────────────────────────────────────────────────────

export type WorkshopEnvironmentId =
  | "fv-studios"
  | "bridal-boutique"
  | "frass-gallery"
  | "kitchen-studio"
  | "default";

export type WorkshopEnvironment = {
  id: WorkshopEnvironmentId;
  name: string;
  emoji: string;
  /** One everyday sentence describing the room you just walked into. */
  everyday: string;
  /** The tool rail this environment surfaces first. */
  tools: string[];
  /** CSS class applied to the Workshop container for the room's finish. */
  skin: string;
};

export const WORKSHOP_ENVIRONMENTS: Record<WorkshopEnvironmentId, WorkshopEnvironment> = {
  "fv-studios": {
    id: "fv-studios",
    name: "FV Studios",
    emoji: "🎛",
    everyday: "A recording room. Takes, stems and releases are within arm's reach.",
    tools: ["Sessions & takes", "Stems", "Mastering", "Release & publishing"],
    skin: "workshop-skin-studio",
  },
  "bridal-boutique": {
    id: "bridal-boutique",
    name: "Bridal Boutique",
    emoji: "👰",
    everyday: "A quiet fitting room. Clients, measurements and timelines first.",
    tools: ["Client files", "Measurements", "Fittings calendar", "Lookbook"],
    skin: "workshop-skin-boutique",
  },
  "frass-gallery": {
    id: "frass-gallery",
    name: "Frass Gallery",
    emoji: "🖼",
    everyday: "A gallery wall. Pieces, collections and the story around them.",
    tools: ["Pieces", "Collections", "Mood boards", "Print & pricing"],
    skin: "workshop-skin-gallery",
  },
  "kitchen-studio": {
    id: "kitchen-studio",
    name: "Kitchen Studio",
    emoji: "🍲",
    everyday: "A working kitchen. Recipes, costing and menus on the pass.",
    tools: ["Recipes", "Batch costing", "Menus", "Food photography"],
    skin: "workshop-skin-kitchen",
  },
  default: {
    id: "default",
    name: "Workshop",
    emoji: "🛠",
    everyday: "Your general workbench. Everything you need, nothing you don't.",
    tools: ["Projects", "Uploads", "Listings", "Income"],
    skin: "workshop-skin-default",
  },
};

/** Vault key → environment. Anything unmapped uses the default Workshop. */
const BY_VAULT: Record<string, WorkshopEnvironmentId> = {
  "music-creator": "fv-studios",
  bridal: "bridal-boutique",
  seamstress: "bridal-boutique",
  "visual-creator": "frass-gallery",
  photography: "frass-gallery",
  "creative-series": "frass-gallery",
  footwear: "frass-gallery",
  bags: "frass-gallery",
  jewelry: "frass-gallery",
  beauty: "frass-gallery",
  culinary: "kitchen-studio",
};

/** Workspace mode / project id → environment, for Builders working without a Vault. */
const BY_MODE: Record<string, WorkshopEnvironmentId> = {
  music: "fv-studios",
  "music-studio": "fv-studios",
  bridal: "bridal-boutique",
  fashion: "bridal-boutique",
  "luxury-house": "frass-gallery",
  gallery: "frass-gallery",
};

export function environmentForVault(vaultKey: string | null | undefined): WorkshopEnvironment {
  if (!vaultKey) return WORKSHOP_ENVIRONMENTS.default;
  return WORKSHOP_ENVIRONMENTS[BY_VAULT[vaultKey] ?? "default"];
}

export function environmentFor(opts: {
  vaultKey?: string | null;
  modeId?: string | null;
  projectId?: string | null;
}): WorkshopEnvironment {
  if (opts.vaultKey && BY_VAULT[opts.vaultKey]) return WORKSHOP_ENVIRONMENTS[BY_VAULT[opts.vaultKey]];
  if (opts.projectId && BY_MODE[opts.projectId]) return WORKSHOP_ENVIRONMENTS[BY_MODE[opts.projectId]];
  if (opts.modeId && BY_MODE[opts.modeId]) return WORKSHOP_ENVIRONMENTS[BY_MODE[opts.modeId]];
  return WORKSHOP_ENVIRONMENTS.default;
}

/** What never changes, whichever room you're standing in. */
export const UNIVERSAL_GUARANTEE = [
  "Universal Upload Manager (FRASS-0400)",
  "Universal Conversation Dock (FRASS-0553)",
  "Vault, Money Move and Fast Track records",
  "Your Frass Card, Financial Center and Marketplace listings",
];
