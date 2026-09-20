export const A1_CLEAN_ENGINE = {
  type: "frass_native" as const,
  slug: "frass_a1_clean_web_audio_v1",
  version: "1.0.0",
  runtime: "browser",
} as const;

export const A1_CLEAN_BUCKET = "studio-audio";
export const MAX_A1_AUDIO_BYTES = 20 * 1024 * 1024;
export const A1_AUDIO_MIME_TYPES = [
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
] as const;

export function isAcceptedA1Audio(mime: string, size: number): boolean {
  return A1_AUDIO_MIME_TYPES.includes(mime as (typeof A1_AUDIO_MIME_TYPES)[number]) && size > 0 && size <= MAX_A1_AUDIO_BYTES;
}

export function a1StoragePaths(userId: string, jobId: string) {
  return {
    source: `${userId}/${jobId}/source`,
    output: `${userId}/${jobId}/a1-clean.wav`,
  };
}

function encodeWav(channels: Float32Array[], sampleRate: number): Blob {
  const count = channels[0]?.length ?? 0;
  const channelCount = channels.length;
  const dataBytes = count * channelCount * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, "RIFF"); view.setUint32(4, 36 + dataBytes, true); text(8, "WAVE"); text(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * channelCount * 2, true);
  view.setUint16(32, channelCount * 2, true); view.setUint16(34, 16, true); text(36, "data");
  view.setUint32(40, dataBytes, true);
  let at = 44;
  for (let i = 0; i < count; i++) for (let c = 0; c < channelCount; c++) {
    const sample = Math.max(-1, Math.min(1, channels[c]![i]!));
    view.setInt16(at, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    at += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/** Real deterministic, local DSP: rumble cut, hiss band-limit, compression and peak normalization. */
export async function processA1Clean(file: File): Promise<Blob> {
  if (!isAcceptedA1Audio(file.type, file.size)) throw new Error("Use a supported audio file under 20 MB.");
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) throw new Error("This browser cannot run the A1 Clean audio machine.");
  const decoder = new Ctx();
  try {
    const decoded = await decoder.decodeAudioData(await file.arrayBuffer());
    const offline = new OfflineAudioContext(decoded.numberOfChannels, decoded.length, decoded.sampleRate);
    const source = offline.createBufferSource(); source.buffer = decoded;
    const highpass = offline.createBiquadFilter(); highpass.type = "highpass"; highpass.frequency.value = 80; highpass.Q.value = 0.707;
    const lowpass = offline.createBiquadFilter(); lowpass.type = "lowpass"; lowpass.frequency.value = Math.min(14000, decoded.sampleRate * 0.45); lowpass.Q.value = 0.707;
    const compressor = offline.createDynamicsCompressor();
    compressor.threshold.value = -24; compressor.knee.value = 18; compressor.ratio.value = 3; compressor.attack.value = 0.01; compressor.release.value = 0.22;
    source.connect(highpass).connect(lowpass).connect(compressor).connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    let peak = 0;
    for (let c = 0; c < rendered.numberOfChannels; c++) for (const sample of rendered.getChannelData(c)) peak = Math.max(peak, Math.abs(sample));
    const gain = peak > 0 ? Math.min(1.5, 0.891 / peak) : 1;
    const channels = Array.from({ length: rendered.numberOfChannels }, (_, c) => {
      const sourceData = rendered.getChannelData(c); const out = new Float32Array(sourceData.length);
      for (let i = 0; i < sourceData.length; i++) out[i] = sourceData[i]! * gain;
      return out;
    });
    return encodeWav(channels, rendered.sampleRate);
  } catch {
    throw new Error("This audio could not be decoded on this device. Try WAV, MP3, M4A, WebM, or OGG.");
  } finally {
    await decoder.close().catch(() => undefined);
  }
}