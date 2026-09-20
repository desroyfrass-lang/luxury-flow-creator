// FRASS-0407 / A1 — the four control depths of ONE production.
import { CONTROL_DEPTHS, CROSS_CUTTING_HELPERS, DEPTH_SWITCH_GUARANTEES, controlDepth, type ControlDepthId } from "@/lib/studio/control-depths";

export function ControlDepthBar({
  depth,
  onChange,
  disabled,
  productionTitle,
}: {
  depth: ControlDepthId;
  onChange: (next: ControlDepthId) => void;
  disabled?: boolean;
  productionTitle?: string | null;
}) {
  const active = controlDepth(depth);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-white/45">Creator Control</h2>
        <p className="text-[11px] text-white/40">
          {productionTitle ? `${productionTitle} — ` : ""}four depths of the same production, never four studios.
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CONTROL_DEPTHS.map((d) => {
          const on = d.id === active.id;
          return (
            <button
              key={d.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d.id)}
              className={`rounded-xl border p-3 text-left transition disabled:opacity-40 ${
                on
                  ? "border-amber-300/60 bg-amber-300/[0.06]"
                  : "border-white/10 bg-black/30 hover:border-amber-300/30"
              }`}
            >
              <span className={`text-xs font-medium ${on ? "text-amber-200" : "text-white/75"}`}>
                {d.icon} {d.label} Mode
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-white/50">{d.everyday}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">In this depth you have</p>
          <ul className="mt-1.5 space-y-1 text-[11px] text-white/55">
            {active.surfaces.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Changing depth never costs you anything</p>
          <ul className="mt-1.5 space-y-1 text-[11px] text-white/55">
            {DEPTH_SWITCH_GUARANTEES.map((g) => (
              <li key={g}>· {g}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CROSS_CUTTING_HELPERS.map((h) => (
          <span
            key={h.id}
            title={h.everyday}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-white/45"
          >
            {h.label} · always on
          </span>
        ))}
      </div>
    </section>
  );
}
