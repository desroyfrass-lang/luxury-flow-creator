/**
 * FRASS-0418 — For Us Immersive Experience.
 *
 * The arrival signature and the optional ambience are generated with the Web
 * Audio API rather than shipped as media files: no download, no autoplay of a
 * heavy asset, and it can be stopped instantly. Here's the practical version: the page hums a
 * five-second welcome the way a hotel lobby chime greets you at the door, and
 * the sea only keeps playing if you ask it to.
 */

const SIGNATURE_KEY = "frass.forus.signature.at";
const AMBIENCE_KEY = "frass.forus.ambience";
const MUTED_KEY = "frass.forus.muted";
/** Play the arrival ditty at most once an hour, like the Entrance welcome. */
const SIGNATURE_TTL_MS = 60 * 60 * 1000;

type Ctx = AudioContext & { __frassForUs?: boolean };

let ctx: Ctx | null = null;
let ambienceStop: (() => void) | null = null;

function audio(): Ctx | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC() as Ctx;
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(MUTED_KEY) === "1";
}

export function setMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
  if (muted) stopAmbience();
}

export function ambienceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AMBIENCE_KEY) === "1";
}

export function setAmbienceEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AMBIENCE_KEY, on ? "1" : "0");
  if (on) startAmbience();
  else stopAmbience();
}

export function signatureDue(): boolean {
  if (typeof window === "undefined") return false;
  if (isMuted()) return false;
  const raw = window.localStorage.getItem(SIGNATURE_KEY);
  if (!raw) return true;
  const at = Number(raw);
  return !Number.isFinite(at) || Date.now() - at > SIGNATURE_TTL_MS;
}

function markSignaturePlayed() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIGNATURE_KEY, String(Date.now()));
}

/** A warm steel-pan style bell: FM pair with a fast attack and long tail. */
function pan(context: AudioContext, freq: number, at: number, gain: number, length = 1.6) {
  const carrier = context.createOscillator();
  const mod = context.createOscillator();
  const modGain = context.createGain();
  const amp = context.createGain();
  const tone = context.createBiquadFilter();

  carrier.type = "sine";
  carrier.frequency.value = freq;
  mod.type = "sine";
  mod.frequency.value = freq * 2.01;
  modGain.gain.value = freq * 1.6;
  tone.type = "lowpass";
  tone.frequency.value = 4200;

  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + length);

  mod.connect(modGain).connect(carrier.frequency);
  carrier.connect(tone).connect(amp).connect(context.destination);
  carrier.start(at);
  mod.start(at);
  carrier.stop(at + length + 0.05);
  mod.stop(at + length + 0.05);
}

/**
 * Five seconds of Frass: a rising island phrase that resolves warm and open.
 * Returns true when it actually played.
 */
export function playArrivalSignature(): boolean {
  const context = audio();
  if (!context) return false;
  const t = context.currentTime + 0.08;
  // C major pentatonic phrase, syncopated the way a rhythm section lands.
  const phrase: [number, number, number][] = [
    [523.25, 0.0, 0.22],
    [659.25, 0.26, 0.2],
    [783.99, 0.5, 0.22],
    [1046.5, 0.78, 0.26],
    [880.0, 1.2, 0.18],
    [783.99, 1.44, 0.18],
    [659.25, 1.76, 0.2],
    [523.25, 2.2, 0.24],
  ];
  phrase.forEach(([freq, offset, gain]) => pan(context, freq, t + offset, gain, offset > 2 ? 2.6 : 1.5));
  // A soft low swell underneath, like the sea answering.
  const swell = context.createOscillator();
  const swellGain = context.createGain();
  swell.type = "triangle";
  swell.frequency.value = 130.81;
  swellGain.gain.setValueAtTime(0.0001, t);
  swellGain.gain.exponentialRampToValueAtTime(0.06, t + 0.6);
  swellGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.6);
  swell.connect(swellGain).connect(context.destination);
  swell.start(t);
  swell.stop(t + 4.8);

  markSignaturePlayed();
  return true;
}

/** Rolling surf and wind: filtered noise, breathing slowly. Never loops harshly. */
export function startAmbience() {
  if (typeof window === "undefined" || isMuted()) return;
  const context = audio();
  if (!context || ambienceStop) return;

  const seconds = 4;
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const surf = context.createBiquadFilter();
  surf.type = "lowpass";
  surf.frequency.value = 620;

  const body = context.createGain();
  body.gain.value = 0.0001;

  const breath = context.createOscillator();
  const breathDepth = context.createGain();
  breath.type = "sine";
  breath.frequency.value = 0.12; // one wave roughly every eight seconds
  breathDepth.gain.value = 0.035;

  source.connect(surf).connect(body).connect(context.destination);
  breath.connect(breathDepth).connect(body.gain);
  body.gain.setValueAtTime(0.0001, context.currentTime);
  body.gain.exponentialRampToValueAtTime(0.05, context.currentTime + 3);

  source.start();
  breath.start();

  ambienceStop = () => {
    try {
      body.gain.cancelScheduledValues(context.currentTime);
      body.gain.setTargetAtTime(0.0001, context.currentTime, 0.4);
      source.stop(context.currentTime + 1.4);
      breath.stop(context.currentTime + 1.4);
    } catch {
      /* already stopped */
    }
    ambienceStop = null;
  };
}

export function stopAmbience() {
  ambienceStop?.();
}
