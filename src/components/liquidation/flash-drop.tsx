import { Zap } from "lucide-react";
import { Countdown } from "./countdown";

/** Occasional flash drop banner. Active only during set windows of the week. */
export function FlashDrop() {
  const now = new Date();
  // Flash drops run Fri 00:00 → Sat 12:00 (local). Otherwise the banner hides.
  const day = now.getDay();
  const active = day === 5 || (day === 6 && now.getHours() < 12);
  if (!active) return null;

  const end = new Date(now);
  end.setDate(end.getDate() + (day === 5 ? 1 : 0));
  end.setHours(12, 0, 0, 0);

  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-12">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--gold)]/40 bg-[linear-gradient(100deg,color-mix(in_oklab,var(--foreground)_14%,transparent),transparent_60%)] px-5 py-5 md:px-10 md:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_10%_50%,color-mix(in_oklab,var(--gold)_18%,transparent),transparent_70%)]" />
        <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
              <Zap className="h-3.5 w-3.5" /> Flash Drop
            </p>
            <h3 className="mt-2 font-display text-xl uppercase tracking-[0.12em] md:text-3xl">
              Extra markdowns across select collections
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Applied automatically at checkout while the window is open.
            </p>
          </div>
          <Countdown target={end.getTime()} />
        </div>
      </div>
    </section>
  );
}
