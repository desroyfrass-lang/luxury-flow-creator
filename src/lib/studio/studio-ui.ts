export function studioPlaybackState(outputUrl?: string | null) {
  const playable = Boolean(outputUrl?.trim());
  return {
    playable,
    label: playable ? "Play current output" : "No playable output yet",
  } as const;
}
