// ─────────────────────────────────────────────────────────────────────────────
// Push-to-talk WAV recorder (Phase 2).
//
// Deliberately dumb: start() opens the mic, stop() closes it and returns ONE
// complete 16 kHz mono WAV blob. No VAD, no silence timers, no auto-restart,
// no continuous mode. The mic is only ever open between an explicit start()
// and an explicit stop() driven by a user gesture.
// ─────────────────────────────────────────────────────────────────────────────

const TARGET_RATE = 16000;

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function downsample(chunks: Float32Array[], from: number, to: number): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let at = 0;
  for (const c of chunks) {
    merged.set(c, at);
    at += c.length;
  }
  if (to >= from) return merged;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(merged.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), merged.length);
    let sum = 0;
    for (let j = start; j < end; j++) sum += merged[j]!;
    out[i] = end > start ? sum / (end - start) : 0;
  }
  return out;
}

export type WavRecorder = {
  stop: () => Promise<Blob>;
  cancel: () => void;
};

export async function startWavRecording(): Promise<WavRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    },
  });

  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const node = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  let done = false;

  node.onaudioprocess = (e) => {
    if (done) return;
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  source.connect(node);
  node.connect(ctx.destination);

  const teardown = async () => {
    done = true;
    try {
      node.disconnect();
      source.disconnect();
    } catch {
      /* already torn down */
    }
    stream.getTracks().forEach((t) => t.stop());
    const rate = ctx.sampleRate;
    await ctx.close().catch(() => {});
    return rate;
  };

  return {
    stop: async () => {
      const rate = await teardown();
      return encodeWav(downsample(chunks, rate, TARGET_RATE), TARGET_RATE);
    },
    cancel: () => {
      void teardown();
      chunks.length = 0;
    },
  };
}
