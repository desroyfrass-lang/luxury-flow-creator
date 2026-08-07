import { useEffect, useState } from "react";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

/** Elegant countdown to a target timestamp. */
export function Countdown({ target, compact }: { target: number; compact?: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const cells: Array<[string, number]> = d > 0 ? [["Days", d], ["Hrs", h], ["Min", m], ["Sec", s]] : [["Hrs", h], ["Min", m], ["Sec", s]];

  return (
    <div className={`flex items-end gap-2 ${compact ? "" : "gap-3"}`}>
      {cells.map(([label, value]) => (
        <div key={label} className="text-center">
          <div
            className={`rounded-lg border border-[color:var(--gold)]/30 bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] px-2.5 py-1.5 font-display tabular-nums text-[color:var(--gold)] ${
              compact ? "text-base" : "text-xl md:text-2xl"
            }`}
          >
            {pad(value)}
          </div>
          <span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
