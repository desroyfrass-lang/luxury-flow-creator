// FRASS-0411 — "Every Creation Has a Business" panel.
// Shown beside finished work so a creation never dead-ends as a file.

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  CREATION_PRINCIPLE,
  creationKindFrom,
  opportunitiesFor,
  type CreationKind,
} from "@/lib/creation-opportunities";

export function CreationOpportunities({
  kind,
  hint,
  className = "",
}: {
  kind?: CreationKind;
  /** Filename or media type, used when the kind isn't known. */
  hint?: string;
  className?: string;
}) {
  const resolved = kind ?? creationKindFrom(hint ?? "");
  const pathways = opportunitiesFor(resolved);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      className={`rounded-lg border border-[color:var(--gold)]/25 bg-black/40 p-4 ${className}`}
      aria-label="Every creation has a business"
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]/80">
        FRASS-0411
      </p>
      <h3 className="mt-1 text-lg font-black uppercase tracking-[0.12em] text-white">
        {CREATION_PRINCIPLE.headline}
      </h3>
      <p className="mt-2 text-sm text-white/60">{CREATION_PRINCIPLE.plain}</p>

      <ul className="mt-4 space-y-2">
        {pathways.map((p) => {
          const open = openId === p.id;
          return (
            <li key={p.id} className="rounded-md border border-white/10 bg-white/[0.03]">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : p.id)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
              >
                <span className="text-sm font-medium text-white/90">{p.title}</span>
                <span className="text-xs text-white/40">{open ? "Hide" : "Details"}</span>
              </button>
              {open && (
                <div className="space-y-2 border-t border-white/10 px-3 py-3 text-sm">
                  <p className="text-white/75">{p.what}</p>
                  <p className="text-white/55">
                    <span className="text-[color:var(--gold)]/80">
                      Here's the idea:{" "}
                    </span>
                    {p.plain}
                  </p>
                  <p className="text-xs text-white/45">How it pays: {p.earns}</p>
                  <Link
                    to={p.to}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--gold)]"
                  >
                    {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
