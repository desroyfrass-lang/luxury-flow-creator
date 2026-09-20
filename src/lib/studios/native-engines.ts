// ─────────────────────────────────────────────────────────────────────────────
// FV Studios — Frass-native engine registry (commissioning pass 1).
//
// Frass Vision Studios does not belong to any vendor. This file is the register
// of the machines Frass intends to own and run itself. Each one is a *slot*:
// declared, named, and truthfully reported as NOT INSTALLED until a real engine
// is commissioned behind it.
//
// TRUTH RULE: nothing in this file performs generation, and no slot may ever be
// described as "working" on the strength of its entry existing. A slot becomes
// installed only when a real engine is registered against it.
//
// This sits UNDERNEATH the existing provider-agnostic Generation Router
// (src/lib/studios/generation-layer.ts). The router is preserved; this layer
// only decides which *kind* of engine a capability should reach for first.
// ─────────────────────────────────────────────────────────────────────────────

/** Who owns and runs the machine. */
export type EngineOwnership = "frass_native" | "external_fallback";

/** The machines FV Studios needs. One slot per kind of work. */
export const NATIVE_CAPABILITIES = [
  { id: "image", label: "Image engine", plain: "Stills, thumbnails, illustration, character art." },
  { id: "video", label: "Video engine", plain: "Moving footage generated for a scene." },
  { id: "animation", label: "Animation engine", plain: "Character movement and performance." },
  { id: "voice", label: "Voice engine", plain: "Spoken dialogue and narration." },
  { id: "music", label: "Music engine", plain: "Score, beds, and original music." },
  { id: "sound", label: "Sound engine", plain: "Effects, atmosphere, foley." },
  { id: "audioRestoration", label: "Audio restoration engine", plain: "Noise, echo, wind, hum and level repair." },
  { id: "finishing", label: "Finishing & mastering engine", plain: "Grade, mix, loudness, and the final master." },
  { id: "text", label: "Writing engine", plain: "Concepts, scripts, scene notes, captions." },
] as const;

export type NativeCapability = (typeof NATIVE_CAPABILITIES)[number]["id"];

export const NATIVE_CAPABILITY_IDS = NATIVE_CAPABILITIES.map((c) => c.id) as NativeCapability[];

export function capabilityLabelNative(id: string): string {
  return NATIVE_CAPABILITIES.find((c) => c.id === id)?.label ?? id;
}

/** A row from studio_providers, read as an engine. */
export type EngineRow = {
  id: string;
  slug: string;
  label: string;
  capabilities: string[];
  status: string;
  enabled: boolean;
  /** Added by the commissioning migration; older rows read as external. */
  engine_type?: string | null;
  priority?: number | null;
  founder_preferred?: boolean | null;
};

export function engineOwnership(row: EngineRow): EngineOwnership {
  return row.engine_type === "frass_native" ? "frass_native" : "external_fallback";
}

function isUsable(row: EngineRow, capability: NativeCapability): boolean {
  return Boolean(row.enabled) && row.status === "available" && row.capabilities.includes(capability);
}

export type EngineDecision =
  | {
      ok: true;
      engine: EngineRow;
      ownership: EngineOwnership;
      reason: string;
    }
  | {
      ok: false;
      capability: NativeCapability;
      /** Machine-readable so the interface never has to guess. */
      state: "not_installed" | "external_not_permitted";
      reason: string;
    };

export type EngineRoutingOptions = {
  /**
   * External engines are a fallback and a benchmark, never the default. They
   * are used only when the Founder has explicitly permitted it for this run.
   */
  allowExternalFallback?: boolean;
};

/**
 * Native-first routing.
 *
 * A Frass-native engine is always preferred. An external engine is considered
 * only when it is explicitly permitted. When neither exists the answer is a
 * plain "NOT INSTALLED" — never a silent substitution.
 */
export function routeToEngine(
  capability: NativeCapability,
  engines: EngineRow[],
  options: EngineRoutingOptions = {},
): EngineDecision {
  const usable = engines.filter((e) => isUsable(e, capability));
  const native = usable.filter((e) => engineOwnership(e) === "frass_native");
  const external = usable.filter((e) => engineOwnership(e) === "external_fallback");

  const rank = (a: EngineRow, b: EngineRow) =>
    Number(Boolean(b.founder_preferred)) - Number(Boolean(a.founder_preferred)) ||
    (a.priority ?? 100) - (b.priority ?? 100);

  if (native.length > 0) {
    const engine = [...native].sort(rank)[0]!;
    return {
      ok: true,
      engine,
      ownership: "frass_native",
      reason: `${engine.label} — the Frass-native ${capabilityLabelNative(capability).toLowerCase()}.`,
    };
  }

  if (external.length > 0) {
    if (!options.allowExternalFallback) {
      return {
        ok: false,
        capability,
        state: "external_not_permitted",
        reason: `The Frass ${capabilityLabelNative(capability).toLowerCase()} is NOT INSTALLED. An outside service could do this, but outside services are a fallback and were not permitted for this run.`,
      };
    }
    const engine = [...external].sort(rank)[0]!;
    return {
      ok: true,
      engine,
      ownership: "external_fallback",
      reason: `${engine.label} — outside fallback, used because the Frass engine is NOT INSTALLED.`,
    };
  }

  return {
    ok: false,
    capability,
    state: "not_installed",
    reason: `${capabilityLabelNative(capability)}: NOT INSTALLED. No Frass engine and no outside service is connected for this, so nothing can be produced and nothing can be charged.`,
  };
}

/** Commissioning board: one honest line per machine. */
export type EngineSlotStatus = {
  capability: NativeCapability;
  label: string;
  plain: string;
  state: "installed_native" | "external_only" | "not_installed";
  headline: string;
};

export function engineBoard(engines: EngineRow[]): EngineSlotStatus[] {
  return NATIVE_CAPABILITIES.map((c) => {
    const usable = engines.filter((e) => isUsable(e, c.id));
    const hasNative = usable.some((e) => engineOwnership(e) === "frass_native");
    const hasExternal = usable.some((e) => engineOwnership(e) === "external_fallback");
    const state: EngineSlotStatus["state"] = hasNative
      ? "installed_native"
      : hasExternal
        ? "external_only"
        : "not_installed";
    return {
      capability: c.id,
      label: c.label,
      plain: c.plain,
      state,
      headline:
        state === "installed_native"
          ? "Frass engine installed"
          : state === "external_only"
            ? "NOT INSTALLED — an outside service is available as a fallback"
            : "NOT INSTALLED",
    };
  });
}

/** Which machine does a studio credit operation need? */
const OPERATION_CAPABILITY: Record<string, NativeCapability> = {
  "ai-video-generation": "video",
  "ai-broll": "video",
  "ai-avatar": "video",
  "lip-sync": "video",
  "ai-image": "image",
  "ai-animation": "animation",
  "ai-music": "music",
  "voice-generation": "voice",
  "voice-clone": "voice",
  dubbing: "voice",
  "voice-enhance": "audioRestoration",
  "phone-noise": "audioRestoration",
  "phone-stems": "audioRestoration",
  "background-replace": "finishing",
  "object-removal": "finishing",
  "smart-reframe": "finishing",
  "color-grade": "finishing",
  upscale: "finishing",
  "silence-removal": "finishing",
  "scene-detect": "finishing",
  "ai-master": "finishing",
  "multi-export": "finishing",
  "phone-stabilise": "finishing",
  "phone-exposure": "finishing",
  "phone-lowlight": "finishing",
  "phone-detail": "finishing",
  "phone-optics": "finishing",
  subtitles: "text",
  translation: "text",
  script: "text",
  highlights: "text",
  "doc-assembly": "text",
};

export function capabilityForOperation(operationKey: string): NativeCapability | null {
  return OPERATION_CAPABILITY[operationKey] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Machine independence.
//
// A requested chain can touch several machines. One uninstalled machine (for
// example finishing/mastering) must NEVER stop an installed machine (for
// example audio restoration) from doing its own, separate piece of work.
// Uninstalled work is dropped from the bill and reported honestly.
// ─────────────────────────────────────────────────────────────────────────────

export type PlannedLine = { key: string; credits?: number };

export type CapabilityPlan = {
  /** Lines whose machine is installed and may actually run. */
  runnable: Array<{ key: string; capability: NativeCapability }>;
  /** Lines whose machine is NOT INSTALLED — never run, never charged. */
  blocked: Array<{ key: string; capability: NativeCapability | null; reason: string }>;
  /** The engine that will carry this job, when anything can run at all. */
  decision: EngineDecision;
};

export function planOperations(
  lines: PlannedLine[],
  engines: EngineRow[],
  options: EngineRoutingOptions = {},
): CapabilityPlan {
  const runnable: CapabilityPlan["runnable"] = [];
  const blocked: CapabilityPlan["blocked"] = [];
  let decision: EngineDecision | null = null;

  for (const line of lines) {
    const capability = capabilityForOperation(line.key);
    if (!capability) {
      blocked.push({
        key: line.key,
        capability: null,
        reason: "This step has no engine mapped yet, so it cannot run and is not charged.",
      });
      continue;
    }
    const routed = routeToEngine(capability, engines, options);
    if (routed.ok) {
      runnable.push({ key: line.key, capability });
      if (!decision) decision = routed;
    } else {
      blocked.push({ key: line.key, capability, reason: routed.reason });
    }
  }

  return {
    runnable,
    blocked,
    decision:
      decision ?? {
        ok: false,
        capability: (blocked[0]?.capability ?? "finishing") as NativeCapability,
        state: "not_installed",
        reason: blocked[0]?.reason ?? "Nothing in this request has an installed engine.",
      },
  };
}
