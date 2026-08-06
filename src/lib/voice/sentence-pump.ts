// Sentence pump: feeds streamed model text into the voice output as soon as a
// natural clause is complete, so Frassy begins speaking well before the reply
// has finished generating.

export type SentenceSink = (sentence: string) => void;

const HARD_BREAK = /([.!?…]["')\]]?)(\s|$)/;
const SOFT_BREAK = /([,;:—-])\s/;
const SOFT_MIN = 90;
const HARD_MAX = 220;

export class SentencePump {
  private buffer = "";

  constructor(private readonly sink: SentenceSink) {}

  push(delta: string) {
    this.buffer += delta;
    // Flush every complete sentence in the buffer.
    for (;;) {
      const nl = this.buffer.indexOf("\n");
      const hard = this.buffer.match(HARD_BREAK);
      let cut = -1;
      if (hard?.index !== undefined) cut = hard.index + hard[1]!.length;
      if (nl !== -1 && (cut === -1 || nl < cut)) cut = nl + 1;

      if (cut === -1) {
        // No sentence end yet — flush at a clause boundary if we're running long
        // so the first audio still arrives fast.
        if (this.buffer.length >= HARD_MAX) {
          const soft = this.buffer.slice(SOFT_MIN).match(SOFT_BREAK);
          const softCut =
            soft?.index !== undefined ? SOFT_MIN + soft.index + soft[1]!.length : HARD_MAX;
          this.emit(this.buffer.slice(0, softCut));
          this.buffer = this.buffer.slice(softCut);
          continue;
        }
        return;
      }
      this.emit(this.buffer.slice(0, cut));
      this.buffer = this.buffer.slice(cut);
    }
  }

  flush() {
    this.emit(this.buffer);
    this.buffer = "";
  }

  reset() {
    this.buffer = "";
  }

  private emit(text: string) {
    const clean = text.trim();
    if (clean.length > 1) this.sink(clean);
  }
}
