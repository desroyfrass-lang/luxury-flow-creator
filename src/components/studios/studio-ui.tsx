// FRASS-0600 — shared furniture for Frassy Studios.
// A production house, not a SaaS dashboard: deep surfaces, gold hairlines,
// large previews, calm hierarchy.
import type { ReactNode } from "react";
import { PRODUCTION_STATUSES, prettify } from "@/lib/studios/studios";

export function StudioSection({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-tight">{title}</h2>
          {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StudioCard({
  title,
  eyebrow,
  children,
  footer,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/60 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      {eyebrow ? (
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{eyebrow}</div>
      ) : null}
      {title ? <h3 className="mt-1 font-display text-lg uppercase tracking-tight">{title}</h3> : null}
      <div className={title || eyebrow ? "mt-3" : ""}>{children}</div>
      {footer ? <div className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl leading-none">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

const TINTS: Record<string, string> = {
  muted: "border-border text-muted-foreground",
  info: "border-sky-500/40 text-sky-300",
  warn: "border-amber-500/40 text-amber-300",
  gold: "border-[color:var(--gold)] text-[color:var(--gold)]",
  good: "border-emerald-500/40 text-emerald-300",
  bad: "border-rose-500/40 text-rose-300",
};

export function StatusPill({ status, tint }: { status: string; tint?: keyof typeof TINTS }) {
  const known = PRODUCTION_STATUSES.find((s) => s.value === status);
  const cls = TINTS[tint ?? known?.tint ?? "muted"];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${cls}`}>
      {known?.label ?? prettify(status)}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-card/30 px-6 py-12 text-center">
      <p className="font-display text-lg uppercase tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function GoldButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)]/10 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)]/20 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function QuietButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-sm border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]";
