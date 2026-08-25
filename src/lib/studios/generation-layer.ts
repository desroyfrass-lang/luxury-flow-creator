// FRASS-0601 — the provider-agnostic generation layer.
//
// Frassy Studios never talks to a vendor. It asks for a *capability*, and the
// Generation Router finds an approved, configured provider that can do it.
// Swapping in a new service — or Frass Hill's own future engine — is a row in
// the providers table, not a rewrite of the studio.
//
//   Frassy Studios → Generation Router → Available Provider → Generation Job
//                  → Generated Asset → Asset Library

export const GENERATION_CAPABILITIES = [
  { id: "textGeneration", label: "Writing", plain: "Concepts, scripts, scene notes, captions.", icon: "✍🏾" },
  { id: "imageGeneration", label: "Images", plain: "Character art, backgrounds, thumbnails.", icon: "🖼️" },
  { id: "videoGeneration", label: "Video", plain: "Moving footage for a scene.", icon: "🎥" },
  { id: "animationGeneration", label: "Animation", plain: "Character movement and performance.", icon: "🌀" },
  { id: "voiceGeneration", label: "Voice", plain: "Spoken dialogue and narration.", icon: "🎙️" },
  { id: "musicGeneration", label: "Music", plain: "Score and music beds.", icon: "🎵" },
  { id: "soundGeneration", label: "Sound effects", plain: "Footsteps, doors, atmosphere.", icon: "🔊" },
] as const;

export type GenerationCapability = (typeof GENERATION_CAPABILITIES)[number]["id"];

export function capabilityLabel(id: string): string {
  return GENERATION_CAPABILITIES.find((c) => c.id === id)?.label ?? id;
}

/** What the studio asks for. Deliberately vendor-free. */
export type GenerationRequest = {
  capability: GenerationCapability;
  productionId?: string | null;
  sceneId?: string | null;
  /** Plain description of the wanted result. */
  brief: string;
  /** Reference assets the provider should stay faithful to. */
  referenceAssetIds?: string[];
  /** Founder-set quality/speed/cost bias. */
  preference?: "quality" | "speed" | "cost" | "consistency";
  meta?: Record<string, unknown>;
};

export type ProviderRow = {
  id: string;
  slug: string;
  label: string;
  capabilities: string[];
  status: string;
  enabled: boolean;
  quality_rating: number | null;
  speed_rating: number | null;
  cost_rating: number | null;
  character_consistency: boolean;
  commercial_rights: string;
  priority: number;
  founder_preferred: boolean;
  notes: string | null;
};

export type RoutingDecision =
  | { ok: true; provider: ProviderRow; reason: string }
  | { ok: false; reason: string; capability: GenerationCapability };

/**
 * The Generation Router.
 *
 * Picks the best approved provider for a capability. When nothing is
 * configured it says so honestly — it never pretends work was done.
 */
export function routeGeneration(
  capability: GenerationCapability,
  providers: ProviderRow[],
  preference: GenerationRequest["preference"] = "quality",
): RoutingDecision {
  const eligible = providers.filter(
    (p) => p.enabled && p.status === "available" && p.capabilities.includes(capability),
  );

  if (eligible.length === 0) {
    return {
      ok: false,
      capability,
      reason: `No ${capabilityLabel(capability).toLowerCase()} service is connected yet. Frass hasn't bought or switched one on, so this stays a planned job until you connect one.`,
    };
  }

  const score = (p: ProviderRow) => {
    let s = p.founder_preferred ? 1000 : 0;
    s += 200 - p.priority;
    if (preference === "quality") s += (p.quality_rating ?? 0) * 10;
    if (preference === "speed") s += (p.speed_rating ?? 0) * 10;
    if (preference === "cost") s += (10 - (p.cost_rating ?? 5)) * 10;
    if (preference === "consistency") s += p.character_consistency ? 100 : 0;
    if (p.commercial_rights === "frass_owned" || p.commercial_rights === "licensed") s += 40;
    return s;
  };

  const provider = [...eligible].sort((a, b) => score(b) - score(a))[0]!;
  return {
    ok: true,
    provider,
    reason: `${provider.label} — chosen for ${preference}.`,
  };
}

export const JOB_STATUSES = [
  { value: "queued", label: "Queued", tint: "muted" },
  { value: "preparing", label: "Preparing", tint: "info" },
  { value: "generating", label: "Generating", tint: "warn" },
  { value: "processing", label: "Processing", tint: "warn" },
  { value: "complete", label: "Complete", tint: "good" },
  { value: "failed", label: "Failed", tint: "bad" },
  { value: "cancelled", label: "Cancelled", tint: "muted" },
  { value: "awaiting_provider", label: "Waiting on a service", tint: "muted" },
] as const;

export const ANIMATION_CATEGORIES = [
  "movement",
  "walking",
  "running",
  "talking",
  "listening",
  "laughing",
  "sitting",
  "standing",
  "turning",
  "pointing",
  "dancing",
  "reaction",
  "facial_expression",
  "entrance",
  "exit",
  "camera_move",
  "transition",
] as const;

/**
 * Asset-first order of preference: REUSE → ADAPT → GENERATE NEW.
 * Reuse keeps characters consistent and keeps generation spend down.
 */
export type ReuseDecision = {
  action: "reuse" | "adapt" | "generate";
  assetId?: string;
  assetName?: string;
  note: string;
};

type MatchableAsset = { id: string; name: string; tags?: string[] | null; approved?: boolean; reuse_allowed?: boolean };

/** Simple, explainable matcher — the Founder can always see why something matched. */
export function findReusableAsset(need: string, assets: MatchableAsset[]): ReuseDecision {
  const wanted = need.toLowerCase().trim();
  if (!wanted) return { action: "generate", note: "Nothing described yet." };

  const usable = assets.filter((a) => a.approved !== false && a.reuse_allowed !== false);
  const words = wanted.split(/[^a-z0-9]+/).filter((w) => w.length > 2);

  let best: { asset: MatchableAsset; score: number } | null = null;
  for (const asset of usable) {
    const hay = `${asset.name} ${(asset.tags ?? []).join(" ")}`.toLowerCase();
    let score = 0;
    if (hay.includes(wanted)) score += 100;
    for (const w of words) if (hay.includes(w)) score += 10;
    if (score > 0 && (!best || score > best.score)) best = { asset, score };
  }

  if (!best) return { action: "generate", note: `Nothing in the library matches “${need}”. This would be new work.` };
  if (best.score >= 100)
    return {
      action: "reuse",
      assetId: best.asset.id,
      assetName: best.asset.name,
      note: `Approved asset reused: ${best.asset.name}. No new generation needed.`,
    };
  return {
    action: "adapt",
    assetId: best.asset.id,
    assetName: best.asset.name,
    note: `Close match: ${best.asset.name}. Adapt this rather than making something new.`,
  };
}

/**
 * Reuse savings, told honestly.
 *
 * Frass does not invent dollar amounts. Until a provider publishes its price
 * we report *work avoided*, not money — that is the number we can stand behind.
 */
export function reuseSummary(decisions: ReuseDecision[]) {
  const reused = decisions.filter((d) => d.action === "reuse").length;
  const adapted = decisions.filter((d) => d.action === "adapt").length;
  const fresh = decisions.filter((d) => d.action === "generate").length;
  return {
    reused,
    adapted,
    fresh,
    total: decisions.length,
    plain:
      decisions.length === 0
        ? "Nothing checked yet."
        : `${reused} reused, ${adapted} adapted, ${fresh} would be new. That is ${reused + adapted} pieces of work you don't have to pay to make twice.`,
  };
}
