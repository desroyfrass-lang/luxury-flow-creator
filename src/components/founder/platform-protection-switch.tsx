// FRASS-0476 — The Founder Freeze Switch.
// One Founder-only control that pauses new transactions while an issue is
// investigated. Everything else remains viewable: members keep browsing, but
// nothing new moves until the switch goes back off.

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock, LockOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ALL_DOMAINS,
  PROTECTION_DOMAINS,
  protectionHeadline,
  type ProtectionDomain,
} from "@/lib/platform-protection";
import {
  getPlatformProtection,
  setPlatformProtection,
} from "@/lib/platform-protection.functions";

export function PlatformProtectionSwitch() {
  const qc = useQueryClient();
  const readFn = useServerFn(getPlatformProtection);
  const writeFn = useServerFn(setPlatformProtection);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "platform-protection"],
    queryFn: () => readFn(),
  });

  const [paused, setPaused] = useState<ProtectionDomain[]>(ALL_DOMAINS);
  useEffect(() => {
    if (data?.active && data.paused.length) setPaused(data.paused as ProtectionDomain[]);
  }, [data?.active, data?.paused]);

  const save = useMutation({
    mutationFn: (v: { active: boolean; paused: ProtectionDomain[] }) => writeFn({ data: v }),
    onSuccess: (r) => {
      toast.success(
        r.active ? "Platform Protection Mode is on." : "Platform Protection Mode is off.",
      );
      qc.invalidateQueries({ queryKey: ["admin", "platform-protection"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = Boolean(data?.active);
  const busy = save.isPending || isLoading;

  const toggleDomain = (id: ProtectionDomain) => {
    const next = paused.includes(id) ? paused.filter((d) => d !== id) : [...paused, id];
    setPaused(next);
    if (active) save.mutate({ active: true, paused: next });
  };

  return (
    <section
      className={`mt-10 rounded-sm border p-6 ${
        active ? "border-destructive/60 bg-destructive/10" : "border-border bg-card/40"
      }`}
      data-blueprint="platform-protection"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            Launch Protection · Founder only
          </span>
          <h2 className="mt-2 flex items-center gap-2 font-display text-2xl">
            {active ? <Lock className="h-5 w-5 text-destructive" /> : <LockOpen className="h-5 w-5" />}
            Platform Protection Mode
          </h2>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            {isLoading ? "Checking the switch…" : protectionHeadline(data ?? { active: false, paused: [], updatedAt: null })}
          </p>
          <p className="mt-2 max-w-xl text-xs text-muted-foreground/80">
            <strong>Let's break it down:</strong> it's the shop shutter. The lights stay
            on and people can still look around — but nothing is sold, joined, paid or withdrawn
            until you lift it again.
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => save.mutate({ active: !active, paused })}
          className={`inline-flex items-center gap-2 rounded-sm px-5 py-3 text-[11px] font-bold uppercase tracking-[0.24em] transition disabled:opacity-50 ${
            active
              ? "bg-foreground text-background hover:opacity-90"
              : "border border-destructive/60 text-destructive hover:bg-destructive/10"
          }`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {active ? "Turn protection off" : "🔒 Activate protection"}
        </button>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {PROTECTION_DOMAINS.map((d) => {
          const on = paused.includes(d.id);
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => toggleDomain(d.id)}
                disabled={save.isPending}
                className={`w-full rounded-sm border p-3 text-left transition disabled:opacity-50 ${
                  on && active
                    ? "border-destructive/50 bg-destructive/10"
                    : on
                      ? "border-[color:var(--gold)]/40 bg-background/40"
                      : "border-border bg-background/20 opacity-70"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{d.label}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {on ? (active ? "Paused" : "Will pause") : "Open"}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{d.what}</span>
                <span className="mt-1 block text-xs text-muted-foreground/70">{d.plain}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[11px] text-muted-foreground/70">
        Every throw of this switch is written to the security record with your name and the time.
      </p>
    </section>
  );
}
