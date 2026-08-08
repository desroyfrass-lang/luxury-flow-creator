import { useEffect, useState } from "react";
import {
  architecturalIntegrityReview,
  integrityHeadline,
  HEALTH_DOT,
  PRINCIPLE_15,
  TRUTH_BEFORE_BEAUTY,
  type ArchHealthRow,
} from "@/lib/construction/governance";

/**
 * Principle 15 — Continuous Architectural Integrity.
 * A standing review of the platform's structure, read from real signals only.
 */
export function ArchitecturalHealth() {
  const [rows, setRows] = useState<ArchHealthRow[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    // Only components actually rendered on this screen count as present.
    const tagged = Array.from(document.querySelectorAll("[data-blueprint]")).map(
      (n) => n.getAttribute("data-blueprint") ?? "",
    );
    setRows(architecturalIntegrityReview(tagged.filter(Boolean)));
  }, []);

  if (rows.length === 0) return null;

  return (
    <section className="rounded-lg border border-[color:color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[color:color-mix(in_oklab,var(--background)_75%,transparent)] p-5">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Architectural health
      </div>
      <h2 className="mt-1 text-lg font-semibold">{integrityHeadline(rows)}</h2>

      <div className="arch-health mt-4">
        {rows.map((r) => (
          <div key={r.id}>
            <button
              type="button"
              className="arch-health-row w-full text-left"
              onClick={() => setOpen(open === r.id ? null : r.id)}
            >
              <span className={`arch-health-dot arch-health-${r.level}`}>{HEALTH_DOT[r.level]}</span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{r.label}</span>
                <span className="block text-[11px] leading-relaxed text-muted-foreground">
                  {r.detail}
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Source · {r.source}
                </span>
              </span>
            </button>
            {open === r.id && r.items.length > 0 && (
              <ul className="mt-1 space-y-1 pl-8 text-[11px] text-muted-foreground">
                {r.items.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">{PRINCIPLE_15}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{TRUTH_BEFORE_BEAUTY}</p>
    </section>
  );
}
