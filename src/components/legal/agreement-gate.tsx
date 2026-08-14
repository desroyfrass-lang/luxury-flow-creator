// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0499 — the Welcome Hall agreement moment.
// everyday language first, the full text one tap away, then one honest acceptance.
// One component for both levels — there is no second agreement system.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Check, ShieldCheck } from "lucide-react";
import { acceptAgreement, listMyAgreements } from "@/lib/legal/agreements.functions";
import {
  AGREEMENTS,
  FRASS_PROMISE,
  PRIVACY_PRINCIPLES,
  SECURITY_PRINCIPLES,
  isCurrent,
  type AgreementLevel,
} from "@/lib/legal/agreements";

export function AgreementGate({
  level,
  className = "",
}: {
  level: AgreementLevel;
  className?: string;
}) {
  const agreement = AGREEMENTS[level];
  const listFn = useServerFn(listMyAgreements);
  const acceptFn = useServerFn(acceptAgreement);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const accepted = useQuery({
    queryKey: ["my-agreements"],
    queryFn: () => listFn(),
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () => acceptFn({ data: { level } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["my-agreements"] }),
  });

  const signedIn = accepted.isSuccess;
  const done = signedIn && isCurrent(level, accepted.data ?? []);

  return (
    <section
      className={`rounded-3xl border border-[color:var(--gold,#d4af37)]/35 bg-[color:var(--gold,#d4af37)]/[0.05] p-6 ${className}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold,#d4af37)]">
        <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" /> {agreement.title} · v{agreement.version}
      </p>
      <p className="mt-3 text-sm leading-relaxed">{agreement.spoken}</p>

      <div className="mt-4 rounded-2xl bg-black/20 p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">The Frass Promise</p>
        <p className="mt-2 text-sm leading-relaxed">{FRASS_PROMISE}</p>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{agreement.who}</p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {agreement.covers.map((c) => (
          <li key={c} className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted-foreground">
            {c}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-4 text-xs underline text-muted-foreground"
      >
        {open ? "Hide the everyday-language summary" : "Read the everyday-language summary"}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {agreement.sections.map((s) => (
            <div key={s.heading} className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm font-semibold">{s.heading}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.plain}</p>
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Privacy principles</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {PRIVACY_PRINCIPLES.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Security principles</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {SECURITY_PRINCIPLES.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {done ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
            <Check className="h-3.5 w-3.5" /> Accepted · v{agreement.version}
          </span>
        ) : signedIn ? (
          <button
            type="button"
            onClick={() => accept.mutate()}
            disabled={accept.isPending}
            className="rounded-full bg-[color:var(--gold,#d4af37)] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black disabled:opacity-50"
          >
            {accept.isPending ? "Recording…" : "I understand and agree"}
          </button>
        ) : (
          <Link
            to="/auth"
            search={{ next: "/welcome-hall" }}
            className="rounded-full border border-white/20 px-5 py-2.5 text-xs uppercase tracking-[0.2em]"
          >
            Sign in to accept
          </Link>
        )}
        <Link to={agreement.href} className="text-xs underline text-muted-foreground">
          Read the full legal text
        </Link>
      </div>

      {accept.isError && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          I couldn't record that just now. Try once more in a moment.
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Here's what this means: you can reopen this any time to see exactly what you agreed to and when. If we
        change something important, I'll bring it back to you before you carry on.
      </p>
    </section>
  );
}
