// Provider-independent voice contract (Phase 2 of the voice architecture).
//
// Frassy's intelligence — memory, tools, districts, modes — never talks to a
// voice vendor directly. It talks to these interfaces. Swapping the current
// streaming STT→LLM→TTS pipeline for OpenAI Realtime (WebRTC) later means
// implementing `VoiceTransport` once; nothing above this line changes.

export type ConversationPhase =
  | "idle"
  | "listening"
  | "hearing"
  | "understanding"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "resuming";

export type SpeakRequest = {
  text: string;
  /** Neural voice id resolved from Builder preferences. */
  voice: string;
  /** Natural-language prosody steering. */
  instructions?: string;
  speed?: number;
};

/** Output half: turns text into audible speech. Must be interruptible. */
export type VoiceOutput = {
  readonly id: string;
  /** Speaks one chunk. Resolves when playback finished (or was interrupted). */
  speak: (req: SpeakRequest) => Promise<void>;
  /** Immediate barge-in — must cut audio on the current frame. */
  stop: () => void;
  readonly speaking: boolean;
};

/** Input half: turns Builder speech into text (or, later, into audio frames). */
export type VoiceInput = {
  readonly id: string;
  start: () => void;
  stop: () => void;
  readonly listening: boolean;
};

/**
 * A full realtime transport (Phase 3). OpenAI Realtime / ElevenLabs implement
 * this in one object; today the pipeline composes VoiceInput + VoiceOutput.
 */
export type VoiceTransport = {
  readonly id: string;
  readonly realtime: boolean;
  input: VoiceInput;
  output: VoiceOutput;
};
