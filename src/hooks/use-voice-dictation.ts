import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Frassy voice input engine.
 *
 * Two layers run at once so the conversation feels immediate *and* accurate:
 *
 *  1. Web Speech API — instant live interim text while the Builder is talking.
 *     Used for the on-screen transcript only, never for what Frassy processes.
 *  2. Raw PCM capture + `/api/stt` (openai/gpt-4o-transcribe with the Frass
 *     vocabulary prompt) — the authoritative transcript, with punctuation and
 *     correct platform names.
 *
 * Turn-taking is driven by voice-activity detection, not by the browser's
 * aggressive short-silence cut-off: we only finalize after a real pause, so
 * Builders can think mid-sentence without being cut off.
 */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export type DictationStatus = "idle" | "listening" | "hearing" | "transcribing";

export type VoiceDictation = {
  supported: boolean;
  listening: boolean;
  interim: string;
  /** Fine-grained state for the conversation status bar. */
  status: DictationStatus;
  /** 0–1 input level, for the live meter. */
  level: number;
  lastTranscript: string;
  transcriptSource: "User" | "Assistant Echo" | "Noise" | "Discarded" | "—";
  start: () => void;
  stop: () => void;
};

export type VoiceDictationOptions = {
  /** Fires the instant the Builder starts talking — used to interrupt Frassy. */
  onSpeechStart?: () => void;
  /** Silence (ms) that ends a spoken thought. Generous by design. */
  pauseMs?: number;
  /**
   * Return true while Frassy is talking / busy. Anything captured in that
   * window is speaker echo, not the Builder, and is discarded.
   */
  isMuted?: () => boolean;
  /** Return true when a transcript matches Frassy's current spoken output. */
  isAssistantEcho?: (text: string) => boolean;
};

/**
 * Echo and mis-hear guard. Room noise and speaker bleed come back from STT as
 * tiny fragments or non-Latin scripts; sending those makes Frassy answer
 * questions nobody asked.
 */
const SHORT_ALLOW = /^(yes|yeah|yep|no|nope|ok|okay|stop|next|go|hi|hey|sure)\b/i;
function isLikelySpeech(text: string): boolean {
  const clean = text.trim();
  if (clean.length < 2) return false;
  const latin = clean.replace(/[^A-Za-z0-9]/g, "");
  // Mostly non-Latin => mis-transcribed noise for an English-first assistant.
  if (latin.length < clean.replace(/\s/g, "").length * 0.6) return false;
  if (latin.length < 3) return false;
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length < 2 && !SHORT_ALLOW.test(clean)) return false;
  return true;
}

const TARGET_RATE = 16000;
const SPEECH_RMS = 0.014;
const MIN_UTTERANCE_MS = 350;

function downsample(input: Float32Array, from: number, to: number): Float32Array {
  if (to >= from) return input;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos = i * ratio;
    const low = Math.floor(pos);
    const high = Math.min(low + 1, input.length - 1);
    const frac = pos - low;
    out[i] = input[low]! * (1 - frac) + input[high]! * frac;
  }
  return out;
}

function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  let length = 0;
  for (const c of chunks) length += c.length;
  const merged = new Float32Array(length);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }
  const samples = downsample(merged, sampleRate, TARGET_RATE);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (pos: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let p = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    p += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export function useVoiceDictation(
  onFinal: (text: string) => void,
  options: VoiceDictationOptions = {},
): VoiceDictation {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [status, setStatus] = useState<DictationStatus>("idle");
  const [level, setLevel] = useState(0);
  const [lastTranscript, setLastTranscript] = useState("");
  const [transcriptSource, setTranscriptSource] = useState<VoiceDictation["transcriptSource"]>("—");

  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;
  const speechStartRef = useRef(options.onSpeechStart);
  speechStartRef.current = options.onSpeechStart;
  const mutedRef = useRef(options.isMuted);
  mutedRef.current = options.isMuted;
  const echoRef = useRef(options.isAssistantEcho);
  echoRef.current = options.isAssistantEcho;
  const pauseMs = options.pauseMs ?? 700;

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const speakingRef = useRef(false);
  const voicedMsRef = useRef(0);
  const silenceMsRef = useRef(0);
  const activeRef = useRef(false);
  const interimTextRef = useRef("");
  const beganWhileMutedRef = useRef(false);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        (Boolean(getRecognitionCtor()) || Boolean(navigator.mediaDevices?.getUserMedia)),
    );
  }, []);

  const teardown = useCallback(() => {
    activeRef.current = false;
    try {
      recRef.current?.abort();
    } catch {
      /* noop */
    }
    recRef.current = null;
    try {
      nodeRef.current?.disconnect();
      sourceRef.current?.disconnect();
    } catch {
      /* noop */
    }
    nodeRef.current = null;
    sourceRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    chunksRef.current = [];
    speakingRef.current = false;
    beganWhileMutedRef.current = false;
    voicedMsRef.current = 0;
    silenceMsRef.current = 0;
    setLevel(0);
  }, []);

  const stop = useCallback(() => {
    teardown();
    setListening(false);
    setInterim("");
    setStatus("idle");
  }, [teardown]);

  /** Send the buffered utterance for accurate transcription. */
  const finalize = useCallback(async () => {
    const chunks = chunksRef.current;
    chunksRef.current = [];
    const fallback = interimTextRef.current.trim();
    interimTextRef.current = "";
    setInterim("");
    const rate = ctxRef.current?.sampleRate ?? 48000;
    if (!chunks.length) return;

    setStatus("transcribing");
    let text = "";
    try {
      const blob = encodeWav(chunks, rate);
      if (blob.size > 3000) {
        const form = new FormData();
        form.append("file", blob, "recording.wav");
        const res = await fetch("/api/stt", { method: "POST", body: form });
        if (res.ok) {
          const data = (await res.json()) as { text?: string };
          text = (data.text ?? "").trim();
        }
      }
    } catch {
      /* fall through to the browser transcript */
    }
    const result = text || fallback;
    if (activeRef.current) setStatus("listening");
    setLastTranscript(result);
    const beganWhileMuted = beganWhileMutedRef.current;
    beganWhileMutedRef.current = false;
    if (!result || !isLikelySpeech(result)) {
      setTranscriptSource("Noise");
      return;
    }
    if (beganWhileMuted && echoRef.current?.(result)) {
      setTranscriptSource("Assistant Echo");
      console.info("[frassy] discarded assistant echo transcript", { transcript: result });
      return;
    }
    if (mutedRef.current?.()) {
      setTranscriptSource("Discarded");
      console.info("[frassy] discarded transcript while turn was not owned by Builder", { transcript: result });
      return;
    }
    setTranscriptSource("User");
    finalRef.current(result);
  }, []);

  const start = useCallback(() => {
    if (activeRef.current || typeof window === "undefined") return;
    activeRef.current = true;
    setListening(true);
    setStatus("listening");

    // Layer 1 — live interim transcript (continuous: never ends on a short pause).
    const Ctor = getRecognitionCtor();
    if (Ctor) {
      try {
        const rec = new Ctor();
        rec.lang = "en-US";
        // Stop-ship containment: one explicit microphone press owns one capture.
        rec.continuous = false;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.onresult = (e: any) => {
          let live = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            live += e.results[i][0].transcript;
          }
          interimTextRef.current = `${interimTextRef.current} ${live}`.trim().slice(-400);
          setInterim(live.trim());
        };
        rec.onerror = () => {};
        rec.onend = () => {};
        recRef.current = rec;
        rec.start();
      } catch {
        recRef.current = null;
      }
    }

    // Layer 2 — PCM capture + voice activity detection.
    navigator.mediaDevices
      ?.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((stream) => {
        if (!activeRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const Ctx =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        ctxRef.current = ctx;
        void ctx.resume().catch(() => {});
        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        const node = ctx.createScriptProcessor(2048, 1, 1);
        nodeRef.current = node;

        node.onaudioprocess = (e) => {
          if (!activeRef.current) return;
          const input = e.inputBuffer.getChannelData(0);
          const blockMs = (input.length / ctx.sampleRate) * 1000;
          let sum = 0;
          for (let i = 0; i < input.length; i++) sum += input[i]! * input[i]!;
          const rms = Math.sqrt(sum / input.length);
          setLevel(Math.min(1, rms * 12));

          if (rms > SPEECH_RMS) {
            if (!speakingRef.current) {
              speakingRef.current = true;
              beganWhileMutedRef.current = Boolean(mutedRef.current?.());
              setStatus("hearing");
              // Push-to-interrupt: the Builder talking always wins.
              speechStartRef.current?.();
            }
            voicedMsRef.current += blockMs;
            silenceMsRef.current = 0;
            chunksRef.current.push(new Float32Array(input));
          } else if (speakingRef.current) {
            silenceMsRef.current += blockMs;
            // Keep trailing silence so words aren't clipped.
            chunksRef.current.push(new Float32Array(input));
            if (silenceMsRef.current >= pauseMs) {
              const voiced = voicedMsRef.current;
              speakingRef.current = false;
              voicedMsRef.current = 0;
              silenceMsRef.current = 0;
              if (voiced >= MIN_UTTERANCE_MS) void finalize();
              else chunksRef.current = [];
            }
          } else {
            // Pre-roll so the first syllable is captured.
            chunksRef.current.push(new Float32Array(input));
            if (chunksRef.current.length > 10) chunksRef.current.shift();
          }
        };

        source.connect(node);
        node.connect(ctx.destination);
      })
      .catch(() => {
        // Mic denied — the Web Speech layer (if any) still carries the session.
        if (!recRef.current) stop();
      });
  }, [finalize, pauseMs, stop]);

  useEffect(() => () => teardown(), [teardown]);

  return { supported, listening, interim, status, level, lastTranscript, transcriptSource, start, stop };
}
