export function studioPlaybackState(outputUrl?: string | null) {
  const playable = Boolean(outputUrl?.trim());
  return {
    playable,
    label: playable ? "Play current output" : "No playable output yet",
  } as const;
}

export const studioConversationPresentation = {
  naturalResponses: true,
  responseOptionsMenu: true,
  responseOptionsDefaultOpen: false,
} as const;

export function studioActionContext(nextAction: string) {
  return [
    "Studio response approach: natural conversation with secondary response options closed by default.",
    "If a requested machine or output is unavailable, the truthful blocker is followed by the best available action for this production.",
    "No uninstalled machine is described as available.",
    `Best available action now: ${nextAction}`,
  ].join("\n");
}
