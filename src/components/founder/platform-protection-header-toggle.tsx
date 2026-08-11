// FRASS-0476 — the master switch as it appears in the Control Room header.
// One button, always in reach, Founder only. The full domain controls live in
// the Security Center; this is the fast throw.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Loader2, Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { ALL_DOMAINS, protectionHeadline } from "@/lib/platform-protection";
import {
  getPlatformProtection,
  setPlatformProtection,
} from "@/lib/platform-protection.functions";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function PlatformProtectionHeaderToggle() {
  const isAdmin = useIsAdmin();
  const qc = useQueryClient();
  const readFn = useServerFn(getPlatformProtection);
  const writeFn = useServerFn(setPlatformProtection);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "platform-protection"],
    queryFn: () => readFn(),
    enabled: Boolean(isAdmin),
  });

  const save = useMutation({
    mutationFn: (active: boolean) =>
      writeFn({ data: { active, paused: data?.paused?.length ? data.paused : ALL_DOMAINS } }),
    onSuccess: (r) => {
      toast.success(
        r.active
          ? "Platform Protection Mode is on. Nothing new moves until you lift it."
          : "Platform Protection Mode is off. Normal trading resumed.",
      );
      qc.invalidateQueries({ queryKey: ["admin", "platform-protection"] });
      qc.invalidateQueries({ queryKey: ["platform-protection", "public"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return null;
  const active = Boolean(data?.active);
  const busy = save.isPending || isLoading;

  return (
    <div
      className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border px-4 py-3 ${
        active ? "border-destructive/60 bg-destructive/10" : "border-border bg-card/40"
      }`}
      data-blueprint="protection-header"
    >
      <div className="min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
          Platform state · {active ? "Protected" : "Open"}
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          {isLoading
            ? "Checking the switch…"
            : protectionHeadline(data ?? { active: false, paused: [], updatedAt: null })}{" "}
          <Link
            to="/admin/launch-feedback"
            className="underline underline-offset-2 hover:text-[color:var(--gold)]"
          >
            Choose what freezes
          </Link>
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => save.mutate(!active)}
        className={`inline-flex shrink-0 items-center gap-2 rounded-sm px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.24em] transition disabled:opacity-50 ${
          active
            ? "bg-foreground text-background hover:opacity-90"
            : "border border-destructive/60 text-destructive hover:bg-destructive/10"
        }`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : active ? (
          <LockOpen className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        {active ? "Lift protection" : "🔒 Platform Protection Mode"}
      </button>
    </div>
  );
}
