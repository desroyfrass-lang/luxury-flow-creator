import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { PINNED_REGIONS, OTHER_REGIONS, useRegion, type Region } from "@/lib/region";

/**
 * Country switcher pinned beside the hamburger.
 * US and CA flags are always visible; every other market lives in the dropdown.
 */
export function RegionSwitcher() {
  const { region, setRegion } = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (r: Region) => {
    setRegion(r);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      {PINNED_REGIONS.map((r) => {
        const active = region.code === r.code;
        return (
          <button
            key={r.code}
            type="button"
            onClick={() => pick(r)}
            aria-label={`Shop from ${r.name}`}
            aria-pressed={active}
            title={`Shop from ${r.name} · ${r.currency}`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-base leading-none transition ${
              active
                ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                : "border-border opacity-60 hover:opacity-100"
            }`}
          >
            <span aria-hidden>{r.flag}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change shopping country"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-2 text-[10px] uppercase tracking-[0.18em] transition hover:border-[color:var(--gold)]"
      >
        <span aria-hidden>{PINNED_REGIONS.some((r) => r.code === region.code) ? "" : region.flag}</span>
        {region.code}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <p className="border-b border-border px-4 py-2 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            Shopping from
          </p>
          <ul className="max-h-72 overflow-y-auto py-1">
            {[...PINNED_REGIONS, ...OTHER_REGIONS].map((r) => (
              <li key={r.code}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition hover:bg-muted"
                >
                  <span aria-hidden className="text-base leading-none">
                    {r.flag}
                  </span>
                  <span className="flex-1">{r.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{r.currency}</span>
                  {region.code === r.code ? <Check className="h-3.5 w-3.5 text-[color:var(--gold)]" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
