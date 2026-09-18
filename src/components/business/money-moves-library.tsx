// ─────────────────────────────────────────────────────────────────────────────
// MASTER MONEY MOVES LIBRARY — the permanent catalogue, openly browsable.
//
// Step 1 is identity and discoverability only. Nothing here starts work, routes
// a Builder, or promises income. Where a real tool exists today, the card links
// to it; where one does not, the card says so honestly.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  MONEY_MOVE_CATALOGUE,
  READINESS_LABEL,
  catalogueByFamily,
  type MoneyMoveFamily,
} from "@/lib/business/money-move-catalogue";

export function MoneyMovesLibrary({ className = "" }: { className?: string }) {
  const families = catalogueByFamily();
  const [open, setOpen] = useState<MoneyMoveFamily | "all">("all");
  const shown = open === "all" ? families : families.filter((f) => f.id === open);

  return (
    <section className={className}>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Explore all Money Moves
      </p>
      <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.05em]">
        The Money Moves Library
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every way to earn on Frass, in one place — {MONEY_MOVE_CATALOGUE.length} moves. Nothing is
        hidden from you. Some already have a tool you can open today; the rest say plainly that
        they are not ready yet.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen("all")}
          className={`rounded-full border px-4 py-1.5 text-xs ${
            open === "all" ? "border-[color:var(--gold,#d4af37)] bg-[color:var(--gold,#d4af37)] text-black" : "border-white/15 text-muted-foreground hover:bg-white/5"
          }`}
        >
          All
        </button>
        {families.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setOpen(f.id)}
            className={`rounded-full border px-4 py-1.5 text-xs ${
              open === f.id ? "border-[color:var(--gold,#d4af37)] bg-[color:var(--gold,#d4af37)] text-black" : "border-white/15 text-muted-foreground hover:bg-white/5"
            }`}
          >
            <span aria-hidden className="mr-1">{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-7">
        {shown.map((f) => (
          <div key={f.id}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">
              <span aria-hidden className="mr-1.5">{f.emoji}</span>
              {f.label}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{f.blurb}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {f.moves.map((m) => (
                <article
                  key={m.id}
                  className="rounded-2xl border border-white/12 bg-white/[0.03] p-4"
                >
                  <h4 className="text-sm font-semibold">{m.title}</h4>
                  <p className="mt-1.5 text-xs text-muted-foreground">{m.purpose}</p>
                  <p className="mt-2 text-xs">
                    <span className="text-muted-foreground">What it earns: </span>
                    {m.outcome}
                  </p>
                  <p className="mt-2 inline-block rounded-full border border-white/15 bg-black/25 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    {READINESS_LABEL[m.readiness]}
                  </p>
                  {m.destination ? (
                    <p className="mt-2 text-xs">
                      <a href={m.destination.path} className="underline underline-offset-2">
                        Open {m.destination.label}
                      </a>
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      No tool for this one yet — I will not send you somewhere that cannot help.
                    </p>
                  )}
                  {m.needsVerification?.length ? (
                    <p className="mt-2 text-[11px] text-amber-200/80">
                      Still to be confirmed by Frass: {m.needsVerification.join(" ")}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
