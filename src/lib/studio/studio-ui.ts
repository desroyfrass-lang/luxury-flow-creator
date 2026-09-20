export function studioPlaybackState(outputUrl?: string | null) {
  const playable = Boolean(outputUrl?.trim());
  return {
    playable,
    label: playable ? "Play current output" : "No playable output yet",
  } as const;
}

export const studioConversationPresentation = {
  naturalResponses: true,
  showExplanationLevels: false,
  showPerResponsePlayback: false,
} as const;

export function studioActionContext(nextAction: string) {
  return [
    "Studio response approach: natural conversation without response-level learning controls.",
    "If a requested machine or output is unavailable, the truthful blocker is followed by the best available action for this production.",
    "No uninstalled machine is described as available.",
    `Best available action now: ${nextAction}`,
  ].join("\n");
}
