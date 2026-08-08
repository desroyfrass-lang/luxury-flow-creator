import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LEDGERS, money, type TraceableAmount } from "@/lib/finance/financial-center";

/**
 * FRASS-0302 — every monetary number on the platform is clickable.
 * Clicking opens where it came from, what was deducted, why it reads the way
 * it does, and what can be done with it.
 */
export function Amount({ item, compact = false }: { item: TraceableAmount; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ledger = LEDGERS[item.ledger];

  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.22em] text-[oklch(0.66_0.01_80)]">
            {item.label}
          </span>
          <span className={`mt-1 block font-display ${compact ? "text-xl" : "text-2xl"}`}>
            {money(item.amount, item.currency)}
          </span>
          <span className="mt-1 block text-[11px] text-[oklch(0.62_0.01_80)]">{ledger.label}</span>
        </span>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {item.settlement === "pending" && (
        <p className="mt-2 rounded-lg border border-amber-400/25 bg-amber-400/5 px-2.5 py-1.5 text-[11px] text-amber-200/90">
          Subject to settlement timing. It moves to Available automatically once it clears.
        </p>
      )}

      {open && (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.62_0.01_80)]">Breakdown</div>
            <ul className="mt-1.5 space-y-1">
              {item.breakdown.map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-[13px]">
                  <span
                    className={
                      l.kind === "deduction"
                        ? "text-[oklch(0.72_0.01_80)]"
                        : l.kind === "net"
                          ? "text-[color:var(--hill-gold)]"
                          : "text-[oklch(0.82_0.01_80)]"
                    }
                  >
                    {l.label}
                  </span>
                  <span className="tabular-nums">{l.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {item.records.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.62_0.01_80)]">
                Transactions behind it
              </div>
              <ul className="mt-1.5 space-y-1">
                {item.records.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 text-[13px]">
                    <span>{r.label}</span>
                    <span className="text-[oklch(0.62_0.01_80)]">{r.meta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[13px] text-[oklch(0.82_0.01_80)]">{item.explain}</p>
          <p className="rounded-lg border border-[color:var(--hill-gold)]/25 bg-[color:var(--hill-gold)]/5 p-2.5 text-[13px]">
            <span className="text-[color:var(--hill-gold)]">What that means is… </span>
            {item.plain}
          </p>

          {item.actions?.length ? (
            <div className="flex flex-wrap gap-2">
              {item.actions.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/18 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[oklch(0.72_0.01_80)]"
                >
                  {a === "withdraw" ? "Withdraw" : a === "export" ? "Export" : "Investigate"}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
