// Chunking for text-to-speech.
//
// STOP-SHIP RULE: speech is NEVER truncated. A reply longer than one TTS
// request is split at natural boundaries and every chunk is spoken in order.
// Truncation (`text.slice(0, 800)`) was the cause of Frassy stopping
// mid-sentence — it is banned from the voice path.

/** Conservative per-request budget; comfortably under the model's input cap. */
export const TTS_CHUNK_CHARS = 600;

const SENTENCE = /[^.!?…]+[.!?…]*\s*/g;

function splitLongPiece(piece: string, max: number): string[] {
  const out: string[] = [];
  // Prefer clause boundaries, then whitespace, before cutting hard.
  let rest = piece;
  while (rest.length > max) {
    const window = rest.slice(0, max);
    const clause = Math.max(
      window.lastIndexOf(", "),
      window.lastIndexOf("; "),
      window.lastIndexOf(" — "),
      window.lastIndexOf(": "),
    );
    const space = window.lastIndexOf(" ");
    const cut = clause > max * 0.5 ? clause + 1 : space > max * 0.4 ? space : max;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}

/** Splits text into speakable chunks. Every character is preserved. */
export function chunkForTTS(text: string, max = TTS_CHUNK_CHARS): string[] {
  const clean = text.replace(/\s+\n/g, "\n").trim();
  if (!clean) return [];
  if (clean.length <= max) return [clean];

  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    const t = current.trim();
    if (t) chunks.push(t);
    current = "";
  };

  for (const paragraph of clean.split(/\n{2,}/)) {
    const sentences = paragraph.match(SENTENCE) ?? [paragraph];
    for (const sentence of sentences) {
      if (sentence.length > max) {
        flush();
        for (const part of splitLongPiece(sentence.trim(), max)) chunks.push(part);
        continue;
      }
      if (current.length + sentence.length > max) flush();
      current += sentence;
    }
    flush();
  }
  flush();
  return chunks.filter(Boolean);
}

/** Strips markdown so the voice never reads syntax out loud. */
export function speakableText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_~>]+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
