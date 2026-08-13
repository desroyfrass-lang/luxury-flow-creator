// FRASS-0544 — Technical Version / Explain Like I'm New.
//
// The same answer, two readings. Nobody has to admit they didn't follow.

import { useState } from "react";
import { hasTechnicalLanguage, splitPlainEnglish } from "@/lib/frassy/plain-english";

export function PlainEnglishMessage({ content }: { content: string }) {
  const { technical, plain } = splitPlainEnglish(content);
  const offer = plain !== null || hasTechnicalLanguage(content);
  const [mode, setMode] = useState<"technical" | "plain">("technical");

  if (!offer) return <p className="whitespace-pre-wrap">{content}</p>;

  const shown = mode === "plain" && plain ? plain : mode === "plain" ? content : technical;

  return (
    <div>
      <p className="whitespace-pre-wrap">{shown}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setMode("technical")}
          aria-pressed={mode === "technical"}
          className={`rounded-sm border px-2 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
            mode === "technical"
              ? "border-[color:var(--gold)]/60 text-[color:var(--gold)]"
              : "border-white/15 text-white/50 hover:text-white/80"
          }`}
        >
          Technical version
        </button>
        <button
          type="button"
          onClick={() => setMode("plain")}
          aria-pressed={mode === "plain"}
          className={`rounded-sm border px-2 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
            mode === "plain"
              ? "border-emerald-400/60 text-emerald-300"
              : "border-white/15 text-white/50 hover:text-white/80"
          }`}
        >
          Explain like I&apos;m new
        </button>
      </div>

      {mode === "plain" && !plain && (
        <p className="mt-1.5 text-[10px] text-white/40">
          Ask Frassy “explain that in plain English” for the everyday version.
        </p>
      )}
    </div>
  );
}
