// ─────────────────────────────────────────────────────────────────────────────
// Frassy's Money Moves Desk — the persistent header.
//
// Three things, always visible: who she is building for, whether she is
// building right now, and how much you have asked her to do on her own.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Check, ChevronDown, Pause, Play } from "lucide-react";
import { FrassyLook } from "@/components/frassy/frassy-look";
import {
  AUTONOMY_META,
  AUTONOMY_MODES,
  autonomyStatus,
  type AutonomyMode,
} from "@/lib/frassy/autonomy";

export function DeskHeader({
  firstName,
  mode,
  paused,
  saving,
  onModeChange,
  onPausedChange,
}: {
  firstName: string;
  mode: AutonomyMode;
  paused: boolean;
  saving: boolean;
  onModeChange: (m: AutonomyMode) => void;
  onPausedChange: (p: boolean) => void;
}) {
  const [openPicker, setOpenPicker] = useState(false);
  const status = autonomyStatus(mode, paused);
  const meta = AUTONOMY_META[mode];

  return (
    <header className="rounded-sm border border-white/10 bg-white/[0.03] px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <FrassyLook room="workshop" size={112} showCaption={false} />
          <div>
            <div className="text-[10px] uppercase tracking-[0.45em] text-[color:var(--gold)]">
              Frassy · Money Moves Desk
            </div>
            <h1 className="mt-3 font-display text-3xl text-white md:text-4xl">
              Frassy is building for {firstName ? `${firstName}'s` : "your"} freedom
            </h1>
            <p className="mt-2 text-xs text-white/40">
              Tap her outfit or her hair — everything she wears is in the store.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status.working
                ? "animate-pulse bg-[color:var(--gold)] shadow-[0_0_12px_var(--gold)]"
                : "bg-white/30"
            }`}
          />
          <span className="text-xs uppercase tracking-[0.3em] text-white/60">{status.text}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* Four ways of working — one control, four positions. */}
        <div className="relative">
          <button
            onClick={() => setOpenPicker((v) => !v)}
            disabled={saving}
            className="inline-flex items-center gap-3 rounded-sm border border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10 px-4 py-3 text-left disabled:opacity-60"
          >
            <span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-white/50">
                How we work together
              </span>
              <span className="mt-1 block text-sm text-white">{meta.label}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-[color:var(--gold)]" />
          </button>

          {openPicker && (
            <div className="absolute left-0 z-30 mt-2 w-[22rem] max-w-[85vw] rounded-sm border border-white/15 bg-[#0b0c0f] p-2 shadow-2xl">
              {AUTONOMY_MODES.map((id) => {
                const m = AUTONOMY_META[id];
                const active = id === mode;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      onModeChange(id);
                      setOpenPicker(false);
                    }}
                    className={`flex w-full items-start gap-3 rounded-sm px-3 py-3 text-left hover:bg-white/5 ${
                      active ? "bg-[color:var(--gold)]/10" : ""
                    }`}
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        active ? "text-[color:var(--gold)]" : "text-transparent"
                      }`}
                    />
                    <span>
                      <span className="block text-sm text-white">{m.label}</span>
                      <span className="mt-1 block text-xs text-white/50">{m.plain}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => onPausedChange(!paused)}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/70 hover:border-[color:var(--gold)] hover:text-white disabled:opacity-60"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {paused ? "Let Frassy build & launch for me" : "Pause — I'll review first"}
        </button>
      </div>

      <p className="mt-4 max-w-2xl text-sm text-white/50">
        {paused
          ? "I've stopped starting anything new. I'll still answer you, still watch your earnings, and I'll hold whatever is finished until you say go."
          : meta.plain}
      </p>
    </header>
  );
}
