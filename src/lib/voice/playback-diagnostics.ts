export type DiagnosticState = "waiting" | "ok" | "failed" | "active";

export type PlaybackDiagnostics = {
  microphone: DiagnosticState;
  sttConnected: DiagnosticState;
  transcriptProduced: DiagnosticState;
  llmResponseReceived: DiagnosticState;
  ttsRequestSent: DiagnosticState;
  audioStreamReceived: DiagnosticState;
  pcmChunksDecoded: DiagnosticState;
  chunksQueued: DiagnosticState;
  destinationConnected: DiagnosticState;
  playbackStarted: DiagnosticState;
  playbackCompleted: DiagnosticState;
  audioContextState: AudioContextState | "none";
  autoplayState: "unverified" | "blocked" | "unlocked";
  outputDevice: string;
  gainLevel: number;
  pcmBufferBytes: number;
  queueLength: number;
  sampleRate: number;
  outputLatencyMs: number | null;
  playbackPosition: number;
  firstFailure: string | null;
  timestamps: Partial<Record<"ttsGenerated" | "pcmReceived" | "pcmDecoded" | "pcmQueued" | "pcmPlayed", string>>;
};

const initial: PlaybackDiagnostics = {
  microphone: "waiting",
  sttConnected: "waiting",
  transcriptProduced: "waiting",
  llmResponseReceived: "waiting",
  ttsRequestSent: "waiting",
  audioStreamReceived: "waiting",
  pcmChunksDecoded: "waiting",
  chunksQueued: "waiting",
  destinationConnected: "waiting",
  playbackStarted: "waiting",
  playbackCompleted: "waiting",
  audioContextState: "none",
  autoplayState: "unverified",
  outputDevice: "Browser default device",
  gainLevel: 1,
  pcmBufferBytes: 0,
  queueLength: 0,
  sampleRate: 24000,
  outputLatencyMs: null,
  playbackPosition: 0,
  firstFailure: null,
  timestamps: {},
};

let state = { ...initial };
const listeners = new Set<(value: PlaybackDiagnostics) => void>();

export function getPlaybackDiagnostics(): PlaybackDiagnostics {
  return state;
}

export function updatePlaybackDiagnostics(patch: Partial<PlaybackDiagnostics>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
}

export function markPlaybackTimestamp(name: keyof PlaybackDiagnostics["timestamps"]): void {
  if (state.timestamps[name]) return;
  updatePlaybackDiagnostics({
    timestamps: { ...state.timestamps, [name]: new Date().toISOString() },
  });
}

export function failPlayback(stage: string): void {
  if (!state.firstFailure) updatePlaybackDiagnostics({ firstFailure: stage });
}

export function resetPlaybackDiagnostics(): void {
  state = {
    ...initial,
    microphone: state.microphone,
    sttConnected: state.sttConnected,
    transcriptProduced: state.transcriptProduced,
    llmResponseReceived: state.llmResponseReceived,
    outputDevice: state.outputDevice,
  };
  listeners.forEach((listener) => listener(state));
}

export function subscribePlaybackDiagnostics(
  listener: (value: PlaybackDiagnostics) => void,
): () => void {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export async function detectOutputDevice(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const output = devices.find((device) => device.kind === "audiooutput" && device.deviceId === "default")
      ?? devices.find((device) => device.kind === "audiooutput");
    updatePlaybackDiagnostics({
      outputDevice: output?.label || "Browser default device (label unavailable)",
    });
  } catch {
    updatePlaybackDiagnostics({ outputDevice: "Browser default device (restricted)" });
  }
}