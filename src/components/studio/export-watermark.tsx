// FRASS-0408 §1 — Watermark selection for FV Studios exports.
// Optional always; rewarded when chosen.
import { useState } from "react";
import { Stamp } from "lucide-react";
import {
  DEFAULT_WATERMARK,
  WATERMARK_FINISHES,
  WATERMARK_INCENTIVES,
  WATERMARK_OPTIONS,
  WATERMARK_POSITIONS,
  WATERMARK_RULES,
  type WatermarkChoice,
} from "@/lib/studio/watermark";

export function ExportWatermarkPanel() {
  const [choice, setChoice] = useState<WatermarkChoice>(DEFAULT_WATERMARK);
  const option = WATERMARK_OPTIONS.find((o) => o.key === choice.key)!;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/45">
        <Stamp className="h-4 w-4 text-amber-300" /> Export watermark
      </h3>
      <p className="mt-2 text-[11px] text-white/45">
        Always optional. Carry the mark and your AI exports cost less.
      </p>

      <div className="mt-4 space-y-2">
        {WATERMARK_OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => setChoice((c) => ({ ...c, key: o.key }))}
            className={`w-full rounded-xl border p-3 text-left transition ${
              o.key === choice.key
                ? "border-amber-300/60 bg-amber-300/[0.06]"
                : "border-white/10 hover:border-amber-300/35"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-white/85">{o.label}</span>
              {o.creditDiscountPct > 0 && (
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] uppercase tracking-widest text-emerald-300">
                  −{o.creditDiscountPct}% credits
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/45">{o.plain}</p>
            {o.requiresBusiness && (
              <p className="mt-1 text-[10px] uppercase tracking-widest text-amber-300/60">
                Paid creator / business account
              </p>
            )}
          </button>
        ))}
      </div>

      {option.mark && (
        <div className="mt-4 space-y-3">
          {/* Live preview of where the mark sits */}
          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-black">
            <span
              className="absolute text-[9px] uppercase tracking-[0.25em]"
              style={{
                opacity: choice.opacity,
                color: WATERMARK_FINISHES.find((f) => f.key === choice.finish)?.swatch,
                ...positionStyle(choice.position),
              }}
            >
              {option.mark}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {WATERMARK_POSITIONS.map((p) => (
              <button
                key={p.key}
                onClick={() => setChoice((c) => ({ ...c, position: p.key }))}
                className={`rounded-full border px-2.5 py-1 text-[10px] transition ${
                  p.key === choice.position
                    ? "border-amber-300/60 text-amber-200"
                    : "border-white/12 text-white/45 hover:border-amber-300/35"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {WATERMARK_FINISHES.map((f) => (
              <button
                key={f.key}
                onClick={() => setChoice((c) => ({ ...c, finish: f.key }))}
                aria-label={f.label}
                className={`h-6 w-6 rounded-full border-2 transition ${
                  f.key === choice.finish ? "border-amber-300" : "border-white/15"
                }`}
                style={{ background: f.swatch }}
              />
            ))}
            <label className="ml-auto flex items-center gap-2 text-[10px] text-white/45">
              Opacity
              <input
                type="range"
                min={20}
                max={100}
                value={Math.round(choice.opacity * 100)}
                onChange={(e) =>
                  setChoice((c) => ({ ...c, opacity: Number(e.target.value) / 100 }))
                }
                className="w-20 accent-amber-300"
              />
            </label>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.04] p-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200/80">
          What carrying the mark gets you
        </p>
        <ul className="mt-2 space-y-1">
          {WATERMARK_INCENTIVES.map((i) => (
            <li key={i} className="text-[11px] text-white/55">
              · {i}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-3 space-y-1">
        {WATERMARK_RULES.map((r) => (
          <li key={r} className="text-[10px] leading-relaxed text-white/35">
            · {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function positionStyle(p: WatermarkChoice["position"]): React.CSSProperties {
  switch (p) {
    case "bottom-left":
      return { left: 12, bottom: 10 };
    case "top-right":
      return { right: 12, top: 10 };
    case "top-left":
      return { left: 12, top: 10 };
    case "end-card":
      return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
    default:
      return { right: 12, bottom: 10 };
  }
}
