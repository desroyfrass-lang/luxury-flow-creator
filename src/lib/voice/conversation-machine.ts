// ─────────────────────────────────────────────────────────────────────────────
// Frassy Conversation State Machine — the single authoritative owner of a turn.
//
// Every subsystem (LLM, TTS, audio playback, UI render, microphone) SUBSCRIBES
// to this machine and reports into it. No subsystem is allowed to decide on its
// own that a turn is finished.
//
// End-of-turn handshake: a turn stays ACTIVE until llm + tts + playback + render
// are all complete. Playback completion is the source of truth for speech —
// never token generation, never text rendering.
// ─────────────────────────────────────────────────────────────────────────────

export type ConversationState =
  | "idle"
  | "listening"
  | "transcribing"
  | "thinking"
  | "streaming_response"
  | "speaking"
  | "waiting_for_builder"
  | "interrupted"
  | "error";

export type TurnOwner = "builder" | "frassy" | "none";

export type SubsystemStatus = "idle" | "active" | "complete" | "failed" | "skipped";

export type ConversationSnapshot = {
  state: ConversationState;
  turnId: string | null;
  owner: TurnOwner;
  llm: SubsystemStatus;
  tts: SubsystemStatus;
  playback: SubsystemStatus;
  render: SubsystemStatus;
  micOpen: boolean;
  interrupted: boolean;
  /** Chunks of speech queued / spoken for this turn. */
  chunksTotal: number;
  chunksSpoken: number;
  /** Seconds of audio still scheduled. */
  bufferSeconds: number;
  error: string | null;
  transitions: Array<{ at: number; from: ConversationState; to: ConversationState; note?: string }>;
};

const MAX_LOG = 40;

function blank(): ConversationSnapshot {
  return {
    state: "idle",
    turnId: null,
    owner: "none",
    llm: "idle",
    tts: "idle",
    playback: "idle",
    render: "idle",
    micOpen: false,
    interrupted: false,
    chunksTotal: 0,
    chunksSpoken: 0,
    bufferSeconds: 0,
    error: null,
    transitions: [],
  };
}

class ConversationMachine {
  private snapshot: ConversationSnapshot = blank();
  private listeners = new Set<() => void>();

  getSnapshot = (): ConversationSnapshot => this.snapshot;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emit() {
    for (const fn of this.listeners) fn();
  }

  private patch(next: Partial<ConversationSnapshot>, note?: string) {
    const from = this.snapshot.state;
    const to = next.state ?? from;
    const transitions =
      to !== from || note
        ? [{ at: Date.now(), from, to, ...(note ? { note } : {}) }, ...this.snapshot.transitions].slice(
            0,
            MAX_LOG,
          )
        : this.snapshot.transitions;
    this.snapshot = { ...this.snapshot, ...next, transitions };
    this.emit();
  }

  /** True while a turn is still owned by somebody. */
  get busy(): boolean {
    const s = this.snapshot.state;
    return s !== "idle" && s !== "waiting_for_builder" && s !== "error";
  }

  // ── Builder side ──────────────────────────────────────────────────────────
  startListening() {
    this.patch(
      { ...blank(), state: "listening", owner: "builder", micOpen: true, turnId: newTurnId() },
      "mic opened",
    );
  }

  startTranscribing() {
    this.patch({ state: "transcribing", micOpen: false }, "mic closed, transcribing");
  }

  // ── Frassy turn ───────────────────────────────────────────────────────────
  /** Opens a Frassy turn. Any in-flight turn is superseded. */
  startTurn(opts: { spoken: boolean }): string {
    const turnId = newTurnId();
    this.snapshot = {
      ...blank(),
      turnId,
      owner: "frassy",
      state: "thinking",
      llm: "active",
      tts: opts.spoken ? "idle" : "skipped",
      playback: opts.spoken ? "idle" : "skipped",
      render: "active",
      transitions: this.snapshot.transitions,
    };
    this.patch({}, `turn ${turnId} opened (${opts.spoken ? "spoken" : "silent"})`);
    return turnId;
  }

  /** Model has begun producing text for this turn. */
  llmStreaming(turnId: string) {
    if (!this.owns(turnId)) return;
    this.patch({ state: "streaming_response" }, "llm streaming");
  }

  llmComplete(turnId: string) {
    if (!this.owns(turnId)) return;
    this.patch({ llm: "complete" }, "llm complete");
    this.settle(turnId);
  }

  llmFailed(turnId: string, message: string) {
    if (!this.owns(turnId)) return;
    this.patch({ state: "error", llm: "failed", error: message }, "llm failed");
  }

  /** UI has rendered the full reply text. Never ends the turn on its own. */
  renderComplete(turnId: string) {
    if (!this.owns(turnId)) return;
    this.patch({ render: "complete" }, "render complete");
    this.settle(turnId);
  }

  // ── Speech ────────────────────────────────────────────────────────────────
  speechQueued(turnId: string, chunks: number) {
    if (!this.owns(turnId)) return;
    this.patch(
      { state: "speaking", tts: "active", playback: "active", chunksTotal: chunks },
      `${chunks} speech chunk(s) queued`,
    );
  }

  chunkSpoken(turnId: string, index: number) {
    if (!this.owns(turnId)) return;
    this.patch({ chunksSpoken: index + 1 }, `chunk ${index + 1}/${this.snapshot.chunksTotal} played`);
  }

  bufferSeconds(turnId: string, seconds: number) {
    if (!this.owns(turnId)) return;
    this.snapshot = { ...this.snapshot, bufferSeconds: seconds };
    this.emit();
  }

  /** Called ONLY when the audio element/buffer reported real completion. */
  playbackComplete(turnId: string) {
    if (!this.owns(turnId)) return;
    this.patch({ tts: "complete", playback: "complete", bufferSeconds: 0 }, "playback complete");
    this.settle(turnId);
  }

  playbackFailed(turnId: string, message: string) {
    if (!this.owns(turnId)) return;
    this.patch(
      { tts: "failed", playback: "failed", error: message, bufferSeconds: 0 },
      "playback failed",
    );
    // A failed voice must not strand the turn — text is still a valid answer.
    this.settle(turnId, true);
  }

  interrupt(reason = "builder interrupted") {
    if (!this.snapshot.turnId) return;
    this.patch(
      { state: "interrupted", interrupted: true, bufferSeconds: 0, playback: "complete", tts: "complete" },
      reason,
    );
    const turnId = this.snapshot.turnId;
    this.settle(turnId, true);
  }

  fail(message: string) {
    this.patch({ state: "error", error: message }, "error");
  }

  reset() {
    this.snapshot = { ...blank(), transitions: this.snapshot.transitions };
    this.patch({ state: "idle" }, "reset");
  }

  private owns(turnId: string): boolean {
    return this.snapshot.turnId === turnId;
  }

  /**
   * End-of-turn handshake. The turn only closes when EVERY subsystem has
   * reported terminal status. Missing any one keeps the turn active.
   */
  private settle(turnId: string, force = false) {
    if (!this.owns(turnId)) return;
    const s = this.snapshot;
    const done = (v: SubsystemStatus) => v === "complete" || v === "skipped" || v === "failed";
    if (!force && !(done(s.llm) && done(s.render) && done(s.tts) && done(s.playback))) return;
    if (!force && s.bufferSeconds > 0.01) return;
    this.patch(
      { state: "waiting_for_builder", owner: "none", micOpen: false },
      "turn complete — listening safely re-enabled",
    );
  }
}

function newTurnId(): string {
  return `turn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export const conversation = new ConversationMachine();

export const STATE_LABELS: Record<ConversationState, string> = {
  idle: "Idle",
  listening: "Listening",
  transcribing: "Transcribing",
  thinking: "Thinking",
  streaming_response: "Streaming response",
  speaking: "Speaking",
  waiting_for_builder: "Waiting for Builder",
  interrupted: "Interrupted",
  error: "Error",
};
