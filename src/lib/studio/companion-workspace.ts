// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0407 / A1 — Companion workspace (cost-control architecture).
//
// Long exploratory conversation is expensive and is not studio work. When
// Frassy recognises it, she can hand that thinking to the Builder's OWN
// already-connected AI in a side-by-side workspace — she stays visible — and
// the useful result is accepted back into the Frass production.
//
// This is NOT a fifth control depth, and the Builder is never asked to pick a
// provider every session; the choice is made once, during the Welcome Call.
//
// SCOPE OF THIS BUILD: interface only. No provider call is made here, no
// credentials are read, and nothing is pretended to be connected.
// ─────────────────────────────────────────────────────────────────────────────

export type ConnectedCreatorTool = {
  /** Stable key of the Builder's own connected tool, chosen at the Welcome Call. */
  key: string;
  label: string;
  kind: "ai-assistant" | "publishing" | "other";
  connected: boolean;
};

/** Nothing is connected until real onboarding supplies it. Honest empty state. */
export function connectedCreatorTools(): ConnectedCreatorTool[] {
  return [];
}

export function preferredCompanionAi(tools: ConnectedCreatorTool[]): ConnectedCreatorTool | null {
  return tools.find((t) => t.kind === "ai-assistant" && t.connected) ?? null;
}

export type ExplorationSignal = {
  /** Messages exchanged in the current stretch of conversation. */
  turns: number;
  /** Characters of conversation in that stretch. */
  characters: number;
  /** True when no concrete studio operation has been requested. */
  noOperationRequested: boolean;
};

export type CompanionSuggestion =
  | { suggest: false; reason: string }
  | { suggest: true; reason: string; tool: ConnectedCreatorTool | null; everyday: string };

/**
 * Recognises long exploratory conversation. Pure function, no side effects.
 */
export function suggestCompanionHandoff(
  signal: ExplorationSignal,
  tools: ConnectedCreatorTool[] = connectedCreatorTools(),
): CompanionSuggestion {
  const exploratory = signal.noOperationRequested && signal.turns >= 8 && signal.characters >= 2500;
  if (!exploratory) {
    return { suggest: false, reason: "This is normal studio direction, not open-ended exploration." };
  }
  const tool = preferredCompanionAi(tools);
  return {
    suggest: true,
    reason: "Long exploratory thinking — better done in your own assistant than billed as studio work.",
    tool,
    everyday: tool
      ? `Want to think this through in ${tool.label} beside me? I stay right here, and you can hand me anything useful when you're done.`
      : "You haven't connected your own assistant yet. You can add it in your Welcome Call setup — until then we can keep thinking here.",
  };
}
