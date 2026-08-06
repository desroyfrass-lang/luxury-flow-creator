// Gapless streaming PCM player (24 kHz, 16-bit LE, mono) — the output half of
// the provider-independent voice layer.
//
// Audio arrives as base64 PCM chunks while the model is still generating, so
// Frassy starts speaking before the sentence is finished. Every scheduled
// buffer source is tracked so a barge-in can be honoured on the same frame.

import { getSharedAudioContext } from "@/lib/audio-unlock";

const SAMPLE_RATE = 24000;

export class PcmPlayer {
  private ctx: AudioContext | null = null;
  private playhead = 0;
  private pending = new Uint8Array(0);
  private sources = new Set<AudioBufferSourceNode>();
  private stopped = false;

  /** Resolves when everything scheduled so far has finished playing. */
  private tailEndsAt = 0;

  async ensureContext(): Promise<AudioContext | null> {
    if (this.stopped) return null;
    // Always the shared, gesture-unlocked context — creating a private one here
    // is what made Frassy silent: it started suspended and never resumed.
    this.ctx = await getSharedAudioContext();
    if (!this.ctx || this.ctx.state !== "running") return null;
    return this.ctx;
  }

  get playing(): boolean {
    return this.sources.size > 0;
  }

  /** Seconds until all currently scheduled audio has played out. */
  get remaining(): number {
    if (!this.ctx) return 0;
    return Math.max(0, this.tailEndsAt - this.ctx.currentTime);
  }

  push(bytes: Uint8Array) {
    if (this.stopped || !this.ctx) return;
    const merged = new Uint8Array(this.pending.length + bytes.length);
    merged.set(this.pending);
    merged.set(bytes, this.pending.length);
    const usable = merged.length - (merged.length % 2);
    this.pending = merged.slice(usable);
    if (usable === 0) return;

    const samples = new Int16Array(merged.buffer.slice(0, usable));
    const floats = new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) floats[i] = samples[i]! / 32768;

    const buffer = this.ctx.createBuffer(1, floats.length, SAMPLE_RATE);
    buffer.copyToChannel(floats, 0);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);

    // First chunk gets a small lead-in; the device output has not started yet.
    if (this.playhead === 0) this.playhead = this.ctx.currentTime + 0.06;
    else this.playhead = Math.max(this.playhead, this.ctx.currentTime);

    source.start(this.playhead);
    this.playhead += buffer.duration;
    this.tailEndsAt = this.playhead;
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }

  pushBase64(b64: string) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    this.push(bytes);
  }

  /** Waits until the queue has drained (or the player is stopped). */
  async waitForDrain(): Promise<void> {
    while (!this.stopped && this.remaining > 0.01) {
      await new Promise((r) => setTimeout(r, Math.min(120, this.remaining * 1000)));
    }
  }

  stop() {
    this.stopped = true;
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        /* already finished */
      }
    }
    this.sources.clear();
    this.pending = new Uint8Array(0);
    this.playhead = 0;
    this.tailEndsAt = 0;
    // The context is shared and stays unlocked for the session — never close it.
    this.ctx = null;
  }
}
