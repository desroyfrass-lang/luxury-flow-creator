// FRASS-0407 / A1 — the four control depths of ONE production.
import { CONTROL_DEPTHS, CROSS_CUTTING_HELPERS, controlDepth, type ControlDepthId } from "@/lib/studio/control-depths";
import { Button } from "@/components/ui/button";

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
    <section className="border-y border-border bg-card/40 px-3 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs uppercase text-muted-foreground">Creator Control</h2>
        <p className="text-xs text-muted-foreground">
          {productionTitle ? `${productionTitle} · ` : ""}same production, deeper controls
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {CONTROL_DEPTHS.map((d) => {
          const on = d.id === active.id;
          return (
            <Button
              key={d.id}
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => onChange(d.id)}
              className={`h-auto min-h-14 justify-start whitespace-normal px-3 py-3 text-left ${
                on
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background/40 text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden>{d.icon}</span> {d.label}
              </span>
            </Button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-foreground/70">{active.everyday}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {CROSS_CUTTING_HELPERS.map((h) => (
          <span
            key={h.id}
            title={h.everyday}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
          >
            {h.label} · always on
          </span>
        ))}
      </div>
    </section>
  );
}
